// import mongoose
var mongoose = require("mongoose");

// comment sub-schema
var commentSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// post schema
var postSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  comments: [commentSchema]
}, { timestamps: true });

// model creation
var postModel = mongoose.model("post", postSchema);
module.exports = postModel;
