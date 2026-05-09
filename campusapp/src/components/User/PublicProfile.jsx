import React, { useEffect, useState } from "react";
import {
  Avatar,
  Card,
  CardContent,
  Typography,
  Divider,
  Box,
  Button,
  CircularProgress,
  CardMedia,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const PublicProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = location.state || {};
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!userId) return;

    const fetchUserAndPosts = async () => {
      try {
        const [userRes, postRes] = await Promise.all([
          axios.get(`http://localhost:3006/api/user/${userId}`),
          axios.get(`http://localhost:3006/api/posts/user/${userId}`)
        ]);
        setUser(userRes.data);
        setPosts(postRes.data);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    fetchUserAndPosts();
  }, [userId]);

  if (!user) {
    return (
      <Box sx={{ textAlign: "center", mt: 10 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading profile...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 4 },
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        minHeight: "100vh",
      }}
    >
      {/* Profile Header */}
      <Card
        sx={{
          mb: 4,
          borderRadius: "16px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          maxWidth: "800px",
          mx: "auto",
          textAlign: "center",
          py: 3,
        }}
      >
        <Avatar
          src={user.profilePic}
          sx={{
            width: 120,
            height: 120,
            mb: 2,
            mx: "auto",
            border: "3px solid white",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {user.name?.charAt(0)}
        </Avatar>
        <Typography variant="h4" fontWeight={700}>
          {user.name}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          {user.bio || "No bio available"}
        </Typography>
        <Typography sx={{ mt: 2 }}>
          <b>Branch:</b> {user.branch || "N/A"} • <b>Year:</b> {user.year || "N/A"}
        </Typography>
        {user.skills?.length > 0 && (
          <Typography sx={{ mt: 1 }}>
            <b>Skills:</b> {user.skills.join(", ")}
          </Typography>
        )}
        {currentUser?._id !== userId && (
          <Box sx={{ mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              sx={{ textTransform: "none" }}
            >
              ⬅ Back
            </Button>
          </Box>
        )}
      </Card>

      {/* User Posts */}
      <Box
        sx={{
          maxWidth: "800px",
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          pb: 6,
        }}
      >
        {posts.length > 0 ? (
          posts.map((post) => (
            <Card
              key={post._id}
              sx={{
                borderRadius: "16px",
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                overflow: "hidden",
              }}
            >
              {post.image && (
                <CardMedia
                  component="img"
                  height="400"
                  image={`http://localhost:3006${post.image}`}
                  alt={post.title}
                  sx={{
                    objectFit: "cover",
                    width: "100%",
                    maxHeight: "450px",
                  }}
                />
              )}
              <CardContent>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                  {post.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {post.description}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  ❤️ {post.likes?.length || 0} Likes • 💬 {post.comments?.length || 0} Comments
                </Typography>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography
            variant="body1"
            sx={{
              textAlign: "center",
              mt: 4,
              color: "text.secondary",
            }}
          >
            No posts yet.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default PublicProfile;
