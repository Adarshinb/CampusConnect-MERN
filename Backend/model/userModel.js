// models/user.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Email regex (simple version)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone number regex (10 digits)
const phoneRegex = /^\d{10}$/;

// Password regex (at least 8 chars, 1 uppercase, 1 lowercase, 1 number)
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Name is required"] },

  email: {
    type: String,
    unique: true,
    required: [true, "Email is required"],
    match: [emailRegex, "Please enter a valid email address"],
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: [true, "Password is required"],
    match: [
      passwordRegex,
      "Password must be at least 8 characters long, include 1 uppercase, 1 lowercase, and 1 number"
    ],
    select: false // won't be returned by default
  },

  phone: {
    type: String,
    validate: {
      validator: function (v) {
        return !v || phoneRegex.test(v); // optional field
      },
      message: "Phone number must be 10 digits"
    }
  },

  profilePic: { type: String, default: "" },
  bio: { type: String, default: "" },
  branch: { type: String },
  year: { type: String },
  skills: { type: [String], default: [] },

  // Connection system
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  requestsSent: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  requestsReceived: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],

  userType: { type: String, enum: ["admin", "faculty", "student"], default: "student" }
}, { timestamps: true });

/**
 * Remove sensitive fields when converting to JSON
 */
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

/**
 * Instance method: compare plain password with hashed password
 * Usage: await user.comparePassword(plainPassword)
 */
userSchema.methods.comparePassword = function (candidatePassword) {
  // `this.password` may be undefined if model was queried without +password
  return bcrypt.compare(candidatePassword, this.password || "");
};

/**
 * Instance method: generate JWT for this user
 * Usage: const token = user.generateAuthToken();
 * Requires process.env.JWT_SECRET
 */
userSchema.methods.generateAuthToken = function () {
  const payload = { id: this._id, userType: this.userType };
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  if (!secret) throw new Error("JWT_SECRET not set in environment");
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Static helper: find user by email and verify password
 * Returns user document (without password field) if valid, otherwise null
 * Usage: const user = await User.findByCredentials(email, password);
 */
userSchema.statics.findByCredentials = async function (email, password) {
  const User = this;
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
  if (!user) return null;
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return null;
  user.password = undefined; // remove before returning
  return user;
};

/**
 * Pre-save: hash password when it is new or modified
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
    const hash = await bcrypt.hash(this.password, saltRounds);
    this.password = hash;
    next();
  } catch (err) {
    next(err);
  }
});

const User = mongoose.model("user", userSchema);
module.exports = User;
