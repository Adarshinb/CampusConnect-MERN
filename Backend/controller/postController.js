const Post = require("../model/postModel");
const User = require("../model/userModel");
const path = require("path");


// Add Post (with image upload)
exports.addPost = async (req, res) => {
  try {
    const { title, description, userId } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : ""; // relative path

    const newPost = new Post({
      title,
      description,
      image,
      userId
    });

    await newPost.save();
    res.json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// 2. View All Posts by Self + Connected Users
exports.getVisiblePosts = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("connections");

    if (!user) return res.send({ error: "User not found" });

    const allVisibleUserIds = [user._id, ...user.connections.map(conn => conn._id)];

    const posts = await Post.find({ userId: { $in: allVisibleUserIds } })
      .populate("userId", "name profilePic branch")
      .sort({ createdAt: -1 });

    res.json(posts)
  } catch (err) {
    res.json({ error: err.message });
  }
};



// 3. View Posts by Branch
exports.getPostsByBranch = async (req, res) => {
  try {
    const users = await User.find({ branch: req.params.branch }, "_id");
    const userIds = users.map(u => u._id);

    const posts = await Post.find({ userId: { $in: userIds } })
      .populate("userId", "name branch profilePic")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.json({ error: err.message });
  }
};

// 4. Like Post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.json({ error: "Post not found" });

    const userId = req.body.userId;
    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
      await post.save();
    }

    res.json({ message: "Post liked", likes: post.likes.length });
  } catch (err) {
    res.json({ error: err.message });
  }
};


// 5. Add Comment
exports.commentPost = async (req, res) => {
  const { userId, text } = req.body;
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.json({ error: "Post not found" });

    // Add comment
    post.comments.push({ userId, text });
    await post.save();

    // Populate userId in comments before sending back
    const updatedPost = await Post.findById(req.params.postId)
      .populate("comments.userId", "name profilePic")  // ✅ populate comment user
      .exec();

    res.json({ message: "Comment added", comments: updatedPost.comments });
  } catch (err) {
    res.json({ error: err.message });
  }
};


// // 6. Update Post
// exports.updatePost = async (req, res) => {
//   try {
//     const post = await Post.findByIdAndUpdate(req.params.postId, req.body, { new: true });
//     if (!post) return res.json({ error: "Post not found" });

//     res.json({ message: "Post updated", post });
//   } catch (err) {
//     res.json({ error: err.message });
//   }
// };

// Update Post (with optional image change)
exports.updatePost = async (req, res) => {
  try {
    const { title, description } = req.body;
    const updateData = { title, description };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const post = await Post.findByIdAndUpdate(
      req.params.postId,
      updateData,
      { new: true }
    );

    if (!post) return res.status(404).json({ error: "Post not found" });

    res.json({ message: "Post updated", post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 7. Delete Post
exports.deletePost = async (req, res) => {
  try {
    const deleted = await Post.findByIdAndDelete(req.params.postId);
    if (!deleted) return res.json({ error: "Post not found" });

    res.json({ message: "Post deleted" });
  } catch (err) {
    res.json({ error: err.message });
  }
};

// id Controller
exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId })
      .populate("userId", "name profilePic branch")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.json({ error: err.message });
  }
};

