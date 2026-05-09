import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  Avatar,
  IconButton,
  Typography,
  Grid,
  TextField,
  Box
} from "@mui/material";
import {
  Favorite as FavoriteIcon,
  AddComment as AddCommentIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from "@mui/icons-material";
import { red, blue } from "@mui/material/colors";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PostCard = () => {
  const [posts, setPosts] = useState([]);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentTexts, setCommentTexts] = useState({});
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3006/api/posts/user/${user._id}`
        );
        setPosts(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPosts();
  }, [user._id]);

  const handleLike = async (postId) => {
    try {
      const res = await axios.post(
        `http://localhost:3006/api/posts/like/${postId}`,
        { userId: user._id }
      );
      alert(res.data.message);

      // Update likes in state
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p._id === postId
            ? { ...p, likes: Array.isArray(res.data.likes) ? res.data.likes : [] }
            : p
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (postId) => {
    const text = commentTexts[postId]?.trim();
    if (!text) return alert("Comment cannot be empty!");

    try {
      const res = await axios.post(
        `http://localhost:3006/api/posts/comment/${postId}`,
        { userId: user._id, text }
      );
      alert("Comment posted!");

      // Update comments in state
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p._id === postId ? { ...p, comments: res.data.comments } : p
        )
      );
      setCommentTexts((prev) => ({ ...prev, [postId]: "" }));
      setExpandedComments((prev) => ({ ...prev, [postId]: true }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (postId) => {
    try {
      const res = await axios.delete(
        `http://localhost:3006/api/posts/delete/${postId}`
      );
      alert(res.data.message);
      setPosts((prevPosts) => prevPosts.filter((p) => p._id !== postId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = (post) => {
    navigate("/addpost", { state: { val: post } });
  };

  const toggleComments = (postId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  return (
    <Grid container spacing={2}>
      {posts.map((post) => (
        <Grid item xs={12} sm={6} md={4} key={post._id}>
          <Card sx={{ maxWidth: 345 }}>
            <CardHeader
              avatar={
                <Avatar
                  src={post.userId.profilePic}
                  sx={{ bgcolor: red[500] }}
                >
                  {!post.userId.profilePic && post.userId.name[0]}
                </Avatar>
              }
              action={
                <IconButton>
                  <MoreVertIcon />
                </IconButton>
              }
              title={post.userId.name}
              subheader={new Date(post.updatedAt).toLocaleString()}
            />
            {post.image && (
              <CardMedia
                component="img"
                height="194"
                image={`http://localhost:3006${post.image}`}
                alt={post.title}
              />
            )}
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {post.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {post.description}
              </Typography>
            </CardContent>
            <CardActions>
              <IconButton onClick={() => handleLike(post._id)}>
                <FavoriteIcon />
                <span style={{ marginLeft: 4 }}>{post.likes.length}</span>
              </IconButton>
              <IconButton onClick={() => toggleComments(post._id)}>
                <AddCommentIcon />
              </IconButton>
              <IconButton onClick={() => handleDelete(post._id)}>
                <DeleteIcon />
              </IconButton>
              <IconButton onClick={() => handleUpdate(post)}>
                <EditIcon />
              </IconButton>
            </CardActions>

            {/* Comment section */}
            {expandedComments[post._id] && (
              <CardContent>
                <Box sx={{ display: "flex", mb: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Write a comment..."
                    value={commentTexts[post._id] || ""}
                    onChange={(e) =>
                      setCommentTexts((prev) => ({
                        ...prev,
                        [post._id]: e.target.value
                      }))
                    }
                  />
                  <IconButton
                    color="primary"
                    onClick={() => handleComment(post._id)}
                  >
                    <CheckCircleIcon />
                  </IconButton>
                </Box>

                {post.comments?.map((comment, index) => (
                  <Box key={index} sx={{ display: "flex", mb: 1 }}>
                    <Avatar
                      src={comment.userId?.profilePic}
                      sx={{
                        width: 24,
                        height: 24,
                        mr: 1,
                        bgcolor: comment.userId?.profilePic ? "transparent" : blue[500]
                      }}
                    >
                      {!comment.userId?.profilePic &&
                        comment.userId?.name?.[0].toUpperCase()}
                    </Avatar>
                    <Typography variant="body2">
                      <strong>{comment.userId?.name || "Unknown"}:</strong>{" "}
                      {comment.text}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            )}
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default PostCard;
