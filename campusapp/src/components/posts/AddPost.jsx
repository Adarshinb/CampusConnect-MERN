import { Button, TextField, Paper, Typography, Box, Container, CssBaseline, Avatar } from "@mui/material";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import PostAddIcon from '@mui/icons-material/PostAdd';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#3a4a6b' },
    secondary: { main: '#ff6b6b' },
  },
});

const AddPost = () => {
  const [inputs, setInputs] = useState({ title: "", description: "" });
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (location.state !== null) {
      setInputs({
        title: location.state.val.title,
        description: location.state.val.description,
      });
    }
  }, [location.state]);

  const inputHandler = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const addPostHandler = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", inputs.title);
    formData.append("description", inputs.description);
    formData.append("userId", user._id);
    if (file) formData.append("image", file);

    try {
      if (location.state !== null) {
        await axios.put(
          `http://localhost:3006/api/posts/update/${location.state.val._id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        alert("Post updated");
      } else {
        await axios.post(
          "http://localhost:3006/api/posts/add",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        alert("Post created");
      }
      navigate("/postcard");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to submit post");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="md">
        <CssBaseline />
        <Box sx={{ marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar src={user.profilePic} sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <PostAddIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            {location.state !== null ? 'Edit Post' : 'Create New Post'}
          </Typography>
          <Paper elevation={3} sx={{ mt: 3, p: 4, width: '100%' }}>
            <Box component="form" onSubmit={addPostHandler} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="title"
                label="Post Title"
                name="title"
                value={inputs.title}
                onChange={inputHandler}
                sx={{ mb: 3 }}
              />
              <Button variant="outlined" component="label" sx={{ mb: 3 }}>
                Upload Image
                <input type="file" hidden onChange={handleFileChange} accept="image/*" />
              </Button>
              {file && <Typography variant="body2">{file.name}</Typography>}
              <TextField
                margin="normal"
                required
                fullWidth
                id="description"
                label="Post Description"
                name="description"
                multiline
                rows={6}
                value={inputs.description}
                onChange={inputHandler}
                sx={{ mb: 3 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="submit" variant="contained" sx={{ mt: 2, mb: 2, px: 4, py: 1.5, fontSize: '1rem' }}>
                  {location.state !== null ? 'Update Post' : 'Publish Post'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default AddPost;
