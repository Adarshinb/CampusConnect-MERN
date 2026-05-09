const User = require("../model/userModel");
const mongoose = require('mongoose');
const Message = require("../model/chatModel");
const XLSX = require("xlsx");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Helper: sign JWT (fallback if model doesn't provide generateAuthToken)
 */
function signToken(user) {
  const payload = { id: user._id, userType: user.userType };
  if (!JWT_SECRET) throw new Error("JWT_SECRET not configured");
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Register / Signup
 */
exports.signup = async (req, res) => {
  try {
    // sanitize/whitelist fields as needed
    const { name, email, password, phone, branch, year, userType } = req.body;

    // basic check
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email and password are required" });
    }

    // prevent duplicate email early
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    // create and save (pre-save hooks will hash password if configured)
    const user = new User({
      name,
      email: email.toLowerCase().trim(),
      password,
      phone,
      branch,
      year,
      userType
    });

    await user.save();

    // generate token: prefer instance method if present
    let token;
    if (typeof user.generateAuthToken === "function") {
      token = user.generateAuthToken();
    } else {
      token = signToken(user);
    }

    // hide password for response
    const userObj = user.toObject();
    delete userObj.password;

    return res.status(201).json({ message: "User created", user: userObj, token });
  } catch (error) {
    console.error("Signup error:", error);
    // handle mongoose validation / duplicate key nicely
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    if (error.code === 11000 && error.keyValue && error.keyValue.email) {
      return res.status(409).json({ error: "Email already exists" });
    }
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};

/**
 * Bulk upload users from Excel (expects multer file in req.file)
 * - Expects Excel columns: name, email, password, phone, branch, year, userType (optional)
 * - Uses per-row save to trigger model pre-save hooks (password hashing)
 * - Returns summary of successes and failures
 */
exports.bulkUploadUsers = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // read workbook
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ error: "Excel file contains no rows" });
    }

    // map rows to user objects (basic sanitization)
    const rows = data.map((row, index) => {
      return {
        __rowIndex: index + 2, // helpful for Excel row reference (assuming header at row 1)
        name: (row.name || "").toString().trim(),
        email: (row.email || "").toString().toLowerCase().trim(),
        password: (row.password || "").toString(),
        phone: row.phone !== undefined ? String(row.phone).trim() : undefined,
        branch: row.branch || undefined,
        year: row.year || undefined,
        userType: row.userType || undefined
      };
    });

    // Save each user individually to trigger pre-save hooks (and capture per-row errors)
    const savePromises = rows.map(async (r) => {
      try {
        // minimal required checks
        if (!r.name || !r.email || !r.password) {
          throw new Error("Missing required field (name, email or password)");
        }

        // avoid duplicate email by checking existence first
        const exists = await User.findOne({ email: r.email });
        if (exists) throw new Error("Email already exists");

        const u = new User({
          name: r.name,
          email: r.email,
          password: r.password,
          phone: r.phone,
          branch: r.branch,
          year: r.year,
          userType: r.userType
        });

        const saved = await u.save();
        const obj = saved.toObject();
        delete obj.password;
        return { success: true, row: r.__rowIndex, user: obj };
      } catch (err) {
        return { success: false, row: r.__rowIndex, error: err.message || String(err) };
      }
    });

    const results = await Promise.all(savePromises);

    const successes = results.filter(r => r.success);
    const failures = results.filter(r => !r.success);

    return res.json({
      message: "Bulk upload completed",
      added: successes.length,
      failed: failures.length,
      successes,
      failures
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    return res.status(500).json({ error: error.message || "Failed to process file" });
  }
};

/**
 * Login user
 * Uses User.findByCredentials if available on model, otherwise falls back to manual compare
 * Returns token + user (without password)
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    // prefer model helper if present
    let user = null;
    if (typeof User.findByCredentials === "function") {
      user = await User.findByCredentials(email, password); // should return user without password on success
      if (!user) return res.status(401).json({ error: "Invalid credentials" });
    } else {
      // manual fallback
      const found = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
      if (!found) return res.status(401).json({ error: "Invalid credentials" });

      const match = await bcrypt.compare(password, found.password || "");
      if (!match) return res.status(401).json({ error: "Invalid credentials" });

      // remove password before returning
      found.password = undefined;
      user = found;
    }

    // generate token (prefer instance method)
    let token;
    if (typeof user.generateAuthToken === "function") {
      token = user.generateAuthToken();
    } else {
      token = signToken(user);
    }

    return res.json({ message: "Login success", user, token });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: err.message || "Login failed" });
  }
};







// Get all users
// GET /api/user
exports.getAllUsers = async (req, res) => {
  try {
    let filter = {};

    if (req.query.type) {
      filter.userType = req.query.type; // faculty / student / admin
    }

    const users = await User.find(filter).select("-password");
    res.json(users);
  } catch (err) {
    res.json({ error: err.message });
  }
};


// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    res.json(user);
  } catch (err) {
    res.json({ error: err.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "User updated", updated });
  } catch (err) {
    res.json({ error: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.json({ error: err.message });
  }
};


// Get all users excluding current user, connected users, and pending requests
exports.getFilteredUsers = async (req, res) => {
  const { userId } = req.params;

  try {
    const currentUser = await User.findById(userId);

    if (!currentUser) return res.status(404).json({ error: "User not found" });

    // Collect IDs to exclude
    const excludeIds = [
      currentUser._id,
      ...currentUser.connections,
      ...currentUser.requestsSent
    ];

    // Get all other users excluding these
    const users = await User.find({ _id: { $nin: excludeIds } })
      .select("-password");

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Send connection request
exports.sendRequest = async (req, res) => {
  const { fromId, toId } = req.body;
  try {
    const fromUser = await User.findById(fromId);
    const toUser = await User.findById(toId);
    if (!fromUser || !toUser) return res.json({ error: "Users not found" });

    fromUser.requestsSent.push(toId);
    toUser.requestsReceived.push(fromId);
    await fromUser.save();
    await toUser.save();

    res.json({ message: "Request sent" });
  } catch (err) {
    res.json({ error: err.message });
  }
};

// Accept connection request - CORRECTED VERSION
// Accept connection request
exports.acceptRequest = async (req, res) => {
  const { fromId, toId } = req.body; 
  // fromId → user who SENT the request
  // toId → user who RECEIVED the request (accepting now)

  try {
    const fromUser = await User.findById(fromId);
    const toUser = await User.findById(toId);

    if (!fromUser || !toUser)
      return res.status(404).json({ error: "Users not found" });

    // Check if already connected
    if (
      fromUser.connections.includes(toId) ||
      toUser.connections.includes(fromId)
    ) {
      return res.status(400).json({ error: "Already connected" });
    }

    // ✅ Add each other to connections
    fromUser.connections.push(toId);
    toUser.connections.push(fromId);

    // ✅ Remove from pending request lists
    // Remove `toId` from `fromUser.requestsSent`
    fromUser.requestsSent = fromUser.requestsSent.filter(
      (id) => id.toString() !== toId.toString()
    );

    // Remove `fromId` from `toUser.requestsReceived`
    toUser.requestsReceived = toUser.requestsReceived.filter(
      (id) => id.toString() !== fromId.toString()
    );

    // Save both users
    await fromUser.save();
    await toUser.save();

    res.json({ message: "Connection request accepted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Reject connection request - CORRECTED VERSION
exports.rejectRequest = async (req, res) => {
  const { requestId, userId } = req.body;
  try {
    const requester = await User.findById(requestId);
    const receiver = await User.findById(userId);

    if (!requester || !receiver) return res.status(404).json({ error: "Users not found" });

    // Remove from requests - using toString() for proper comparison
    requester.requestsSent = requester.requestsSent.filter(id => id.toString() !== userId.toString());
    receiver.requestsReceived = receiver.requestsReceived.filter(id => id.toString() !== requestId.toString());

    await requester.save();
    await receiver.save();

    res.json({ message: "Request rejected" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cancel sent request - CORRECTED VERSION
exports.cancelRequest = async (req, res) => {
  const { requestId, userId } = req.body;
  try {
    const requester = await User.findById(userId);
    const receiver = await User.findById(requestId);

    if (!requester || !receiver) return res.status(404).json({ error: "Users not found" });

    // Remove from requests - using toString() for proper comparison
    requester.requestsSent = requester.requestsSent.filter(id => id.toString() !== requestId.toString());
    receiver.requestsReceived = receiver.requestsReceived.filter(id => id.toString() !== userId.toString());

    await requester.save();
    await receiver.save();

    res.json({ message: "Request cancelled" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Additional needed APIs for connection system

// Get received requests for a user
exports.getReceivedRequests = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('requestsReceived', 'name profilePic branch year connections')
      .select('requestsReceived connections');

    if (!user) return res.status(404).json({ error: "User not found" });

    // filter out already connected users
    const filtered = user.requestsReceived.filter(
      (reqUser) => !user.connections.some(conn => conn.toString() === reqUser._id.toString())
    );

    res.json(filtered);
  } catch (err) {
    res.json({ error: err.message });
  }
};


// Get sent requests for a user
exports.getSentRequests = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('requestsSent', 'name profilePic branch year connections')
      .select('requestsSent connections');

    if (!user) return res.status(404).json({ error: "User not found" });

    // filter out already connected users
    const filtered = user.requestsSent.filter(
      (reqUser) => !user.connections.some(conn => conn.toString() === reqUser._id.toString())
    );

    res.json(filtered);
  } catch (err) {
    res.json({ error: err.message });
  }
};


// Reject connection request
exports.rejectRequest = async (req, res) => {
  const { requestId, userId } = req.body;
  try {
    const requester = await User.findById(requestId);
    const receiver = await User.findById(userId);

    if (!requester || !receiver) return res.json({ error: "Users not found" });

    // Remove from requests
    requester.requestsSent = requester.requestsSent.filter(id => id != userId);
    receiver.requestsReceived = receiver.requestsReceived.filter(id => id != requestId);

    await requester.save();
    await receiver.save();

    res.json({ message: "Request rejected" });
  } catch (err) {
    res.json({ error: err.message });
  }
};

// Cancel sent request
exports.cancelRequest = async (req, res) => {
  const { requestId, userId } = req.body;
  try {
    const requester = await User.findById(userId);
    const receiver = await User.findById(requestId);

    if (!requester || !receiver) return res.json({ error: "Users not found" });

    // Remove from requests
    requester.requestsSent = requester.requestsSent.filter(id => id != requestId);
    receiver.requestsReceived = receiver.requestsReceived.filter(id => id != userId);

    await requester.save();
    await receiver.save();

    res.json({ message: "Request cancelled" });
  } catch (err) {
    res.json({ error: err.message });
  }
};

// Get user connections
exports.getConnections = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('connections', 'name profilePic branch year');
    res.json(user.connections || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Chat History
exports.getChatHistory = async (req, res) => {
  try {
    const userId1 = new mongoose.Types.ObjectId(req.params.userId1);
    const userId2 = new mongoose.Types.ObjectId(req.params.userId2);

    const messages = await Message.find({
      $or: [
        { sender: userId1, recipient: userId2 },
        { sender: userId2, recipient: userId1 }
      ]
    })
      .sort({ createdAt: 1 })
      .populate("sender recipient", "name profilePic");

    res.json(messages || []);
  } catch (err) {
    console.error("Error fetching chat history:", err);
    res.status(500).json({ message: err.message });
  }
};

//count total users
exports.countUsers = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.json({ totalUsers: userCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


