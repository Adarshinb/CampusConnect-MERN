// routes/admin.js
const express = require("express");
const router = express.Router();
const User = require("../model/userModel");   // your user model
const Post = require("../model/postModel");   // your post model file name may differ

// optional: middleware to ensure request is authenticated and admin
// const auth = require("../middleware/auth");

// GET /api/admin/stats
// returns { totalUsers, students, faculty, admins, posts }
router.get("/stats", /* auth, */ async (req, res) => {
  try {
    // If you want only counts (fast)
    const totalUsersPromise = User.countDocuments({});
    const studentsPromise = User.countDocuments({ userType: "student" });
    const facultyPromise = User.countDocuments({ userType: "faculty" });
    const adminsPromise = User.countDocuments({ userType: "admin" });
    const postsPromise = Post.countDocuments({});

    const [totalUsers, students, faculty, admins, posts] = await Promise.all([
      totalUsersPromise,
      studentsPromise,
      facultyPromise,
      adminsPromise,
      postsPromise
    ]);

    return res.json({
      success: true,
      data: { totalUsers, students, faculty, admins, posts }
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
