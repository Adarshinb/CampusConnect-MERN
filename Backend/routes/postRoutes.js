const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  addPost,
  getVisiblePosts,
  getPostsByBranch,
  likePost,
  commentPost,
  updatePost,
  deletePost,
  getUserPosts
} = require("../controller/postController");


// ✅ Create post with image upload
router.post("/add", upload.single("image"), addPost);
// ✅ Update post with image upload
router.put("/update/:postId", upload.single("image"), updatePost);
router.get("/users/:userId", getVisiblePosts);
router.get("/branch/:branch", getPostsByBranch);
router.post("/like/:postId", likePost);
router.post("/comment/:postId", commentPost);
// router.put("/update/:postId", updatePost);
router.delete("/delete/:postId", deletePost);
router.get("/user/:userId", getUserPosts);


module.exports = router;
