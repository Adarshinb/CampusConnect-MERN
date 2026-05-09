import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
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
  Box,
  Divider,
  Fade,
  Grow,
  Zoom,
  Slide
} from '@mui/material';
import { red, pink, blue, grey } from '@mui/material/colors';
import {
  Favorite,
  FavoriteBorder,
  AddComment,
  MoreVert,
  Send,
  ChatBubbleOutline,
  Share
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

// Enhanced styled components
const StyledCard = styled(Card)(({ theme }) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
  border: '1px solid rgba(255, 255, 255, 0.8)',
  overflow: 'hidden',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${blue[500]}, ${pink[500]})`,
    borderRadius: '16px 16px 0 0',
  }
}));

const LikeButton = styled(IconButton)(({ liked }) => ({
  color: liked ? pink[500] : grey[600],
  transition: 'all 0.3s ease',
  padding: '8px',
  borderRadius: '12px',
  '&:hover': {
    color: pink[700],
    backgroundColor: 'rgba(236, 64, 122, 0.08)',
    transform: 'scale(1.1)'
  }
}));

const CommentButton = styled(IconButton)({
  color: grey[600],
  transition: 'all 0.3s ease',
  padding: '8px',
  borderRadius: '12px',
  '&:hover': {
    color: blue[700],
    backgroundColor: 'rgba(33, 150, 243, 0.08)',
    transform: 'scale(1.1)'
  }
});

const ShareButton = styled(IconButton)({
  color: grey[600],
  transition: 'all 0.3s ease',
  padding: '8px',
  borderRadius: '12px',
  '&:hover': {
    color: blue[500],
    backgroundColor: 'rgba(33, 150, 243, 0.08)',
    transform: 'scale(1.1)'
  }
});

const AnimatedCardContent = styled(Box)({
  flexGrow: 1,
  animation: 'fadeInUp 0.6s ease-out'
});

const CommentSection = styled(Box)({
  background: 'rgba(248, 249, 250, 0.8)',
  borderTop: `1px solid ${grey[200]}`,
  animation: 'slideUp 0.4s ease-out'
});

// External CSS for animations
const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }
  
  @keyframes likeAnimation {
    0% {
      transform: scale(1);
    }
    25% {
      transform: scale(1.3);
    }
    50% {
      transform: scale(0.9);
    }
    75% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }
  
  .like-animation {
    animation: likeAnimation 0.6s ease;
  }
  
  .pulse-hover:hover {
    animation: pulse 1s infinite;
  }
`;

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentTexts, setCommentTexts] = useState({});
  const [likeAnimation, setLikeAnimation] = useState({});
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    // Add CSS styles to document head
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    const fetchPosts = async () => {
      try {
        const res = await axios.get(`http://localhost:3006/api/posts/users/${user._id}`);
        const postsWithLikes = res.data.map(post => ({
          ...post,
          likes: Array.isArray(post.likes) ? post.likes : []
        }));
        setPosts(postsWithLikes);
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };
    fetchPosts();
  }, [user._id]);

  const handleLike = async (id) => {
    // Trigger like animation
    setLikeAnimation(prev => ({ ...prev, [id]: true }));
    setTimeout(() => setLikeAnimation(prev => ({ ...prev, [id]: false })), 600);

    try {
      const res = await axios.post(`http://localhost:3006/api/posts/like/${id}`, { userId: user._id });
      
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === id 
            ? { 
                ...post, 
                likes: Array.isArray(res.data.likes) ? res.data.likes : [] 
              } 
            : post
        )
      );
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleComment = async (id) => {
    const commentText = commentTexts[id] || "";
    if (!commentText.trim()) {
      alert("Comment cannot be empty!");
      return;
    }

    try {
      const res = await axios.post(`http://localhost:3006/api/posts/comment/${id}`, {
        userId: user._id,
        text: commentText
      });
      
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === id 
            ? { ...post, comments: res.data.comments } 
            : post
        )
      );
      
      setCommentTexts(prev => ({ ...prev, [id]: "" }));
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleCommentChange = (postId, text) => {
    setCommentTexts(prev => ({
      ...prev,
      [postId]: text
    }));
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMMM d, yyyy - h:mm a');
  };

  const hasLiked = (post) => {
    return Array.isArray(post.likes) && post.likes.includes(user._id);
  };

  return (
    <Box sx={{ 
      padding: { xs: 2, sm: 3, md: 4 },
      maxWidth: '1400px', 
      margin: '0 auto',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <Fade in timeout={800}>
        <Typography 
          variant="h3" 
          gutterBottom 
          sx={{ 
            fontWeight: '800', 
            background: 'linear-gradient(45deg, #2196f3, #e91e63)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            textAlign: 'center',
            mb: 6,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            textShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          Your Social Feed
        </Typography>
      </Fade>
      
      <Grid container spacing={4} justifyContent="center">
        {posts.map((post, index) => (
          <Grid item xs={12} sm={6} md={4} lg={4} key={post._id} sx={{ display: 'flex' }}>
            <Grow in timeout={800 + (index * 200)}>
              <StyledCard className="pulse-hover">
                <AnimatedCardContent>
                  <CardHeader
                    avatar={
                      
                      <Avatar 
                        src={post.userId.profilePic} 
                        sx={{ 
                          bgcolor: `linear-gradient(45deg, ${blue[500]}, ${pink[500]})`,
                          width: 48,
                          height: 48,
                          border: '3px solid white',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                        aria-label="recipe"
                      >
                        {post.userId.name.split(" ")[0][0]}
                      </Avatar>
                     
                    }
                    action={
                      <IconButton aria-label="settings" sx={{ color: grey[600] }}>
                        <MoreVert />
                      </IconButton>
                    }
                    title={
                      <Link
                          to="/publicprofile"
                          state={{ userId: post.userId._id }}
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                      <Typography variant="h6" fontWeight="700" color="text.primary">
                        {post.userId.name}
                      </Typography>
                       </Link>
                    }
                    subheader={
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {formatDate(post.updatedAt)}
                      </Typography>
                    }
                    sx={{ pb: 1 }}
                  />
                  
                  <CardContent sx={{ pb: 1, pt: 0 }}>
                    <Typography variant="h5" gutterBottom sx={{ 
                      fontWeight: '800', 
                      color: 'text.primary',
                      lineHeight: 1.3,
                      mb: 2
                    }}>
                      {post.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph sx={{ 
                      lineHeight: 1.6,
                      fontSize: '0.95rem'
                    }}>
                      {post.description}
                    </Typography>
                  </CardContent>
                  
                  {post.image && (
                    <Zoom in timeout={1000}>
                      <CardMedia
                        component="img"
                        height="280"
                        image={`http://localhost:3006${post.image}`}
                        alt={post.title}
                        sx={{ 
                          objectFit: 'cover',
                          borderRadius: '8px',
                          mx: 2,
                          mb: 2,
                          boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                        }}
                      />
                    </Zoom>
                  )}
                </AnimatedCardContent>
                
                <Box>
                  <CardActions disableSpacing sx={{ 
                    justifyContent: 'space-between', 
                    px: 2,
                    py: 1,
                    borderTop: `1px solid ${grey[200]}`
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LikeButton 
                        aria-label="like post" 
                        onClick={() => handleLike(post._id)}
                        liked={hasLiked(post)}
                        className={likeAnimation[post._id] ? 'like-animation' : ''}
                      >
                        {hasLiked(post) ? (
                          <Favorite sx={{ fontSize: '1.4rem' }} />
                        ) : (
                          <FavoriteBorder sx={{ fontSize: '1.4rem' }} />
                        )}
                      </LikeButton>
                      <Typography variant="body2" sx={{ 
                        fontWeight: '600', 
                        color: hasLiked(post) ? pink[500] : 'text.secondary',
                        minWidth: '20px'
                      }}>
                        {Array.isArray(post.likes) ? post.likes.length : 0}
                      </Typography>
                      
                      <CommentButton 
                        aria-label="comment" 
                        onClick={() => toggleComments(post._id)}
                      >
                        <ChatBubbleOutline sx={{ fontSize: '1.3rem' }} />
                      </CommentButton>
                      <Typography variant="body2" sx={{ 
                        fontWeight: '600', 
                        color: 'text.secondary',
                        minWidth: '20px'
                      }}>
                        {Array.isArray(post.comments) ? post.comments.length : 0}
                      </Typography>
                    </Box>
                    
                    <ShareButton aria-label="share">
                      <Share sx={{ fontSize: '1.3rem' }} />
                    </ShareButton>
                  </CardActions>

                  {expandedComments[post._id] && (
                    <Slide in direction="up" timeout={400}>
                      <CommentSection sx={{ px: 2, pb: 2, pt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 2 }}>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Share your thoughts..."
                            value={commentTexts[post._id] || ""}
                            onChange={(e) => handleCommentChange(post._id, e.target.value)}
                            sx={{ 
                              mr: 1,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '20px',
                                backgroundColor: 'white'
                              }
                            }}
                          />
                          <IconButton 
                            onClick={() => handleComment(post._id)}
                            disabled={!commentTexts[post._id]?.trim()}
                            sx={{ 
                              color: blue[500],
                              backgroundColor: blue[50],
                              '&:hover': {
                                backgroundColor: blue[100],
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <Send sx={{ fontSize: '1.2rem' }} />
                          </IconButton>
                        </Box>

                        {Array.isArray(post.comments) && post.comments.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="subtitle2" sx={{ 
                              fontWeight: '600', 
                              color: 'text.secondary',
                              mb: 2 
                            }}>
                              Comments ({post.comments.length})
                            </Typography>
                            {post.comments.map((comment, index) => (
                              <Fade in key={index} timeout={500 + (index * 100)}>
                                <Box sx={{ 
                                  mb: 2, 
                                  p: 1.5, 
                                  borderRadius: '12px',
                                  backgroundColor: 'white',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                  }
                                }}>
                                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                                    <Avatar
                                      src={comment.userId?.profilePic}
                                      sx={{ 
                                        width: 32, 
                                        height: 32, 
                                        bgcolor: comment.userId?.profilePic ? 'transparent' : blue[500],
                                        fontSize: '0.8rem',
                                        mr: 1.5,
                                        border: '2px solid white',
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                                      }}
                                    >
                                      {!comment.userId?.profilePic && comment.userId?.name?.[0].toUpperCase()}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="subtitle2" fontWeight="700" color="text.primary">
                                        {comment.userId.name || "Unknown"}
                                      </Typography>
                                      <Typography variant="body2" sx={{ 
                                        mt: 0.5,
                                        color: 'text.primary',
                                        lineHeight: 1.5
                                      }}>
                                        {comment.text}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Box>
                              </Fade>
                            ))}
                          </Box>
                        )}
                      </CommentSection>
                    </Slide>
                  )}
                </Box>
              </StyledCard>
            </Grow>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PostFeed;