import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  TextField,
  IconButton,
} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import React, { useState, useEffect } from "react";
import axios from "axios";

const ProfileCard = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [inputs, setInputs] = useState({});
  const [previewPic, setPreviewPic] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser) return;
      try {
        const res = await axios.get(
          `http://localhost:3006/api/user/${storedUser._id}`
        );
        setUser(res.data);
        setInputs(res.data);
        setPreviewPic(res.data.profilePic);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, []);

  const inputHandler = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  // Handle profile picture upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imgUrl = URL.createObjectURL(file);
      setPreviewPic(imgUrl);
      // For now, store image as base64 or URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setInputs({ ...inputs, profilePic: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const updateProfile = async () => {
    try {
      const res = await axios.put(
        `http://localhost:3006/api/user/${user._id}`,
        inputs
      );
      setUser(res.data.updated);
      localStorage.setItem("user", JSON.stringify(res.data.updated));
      setEditMode(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <Card>
      <CardContent>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Avatar
              src={previewPic}
              sx={{ width: 100, height: 100 }}
            >
              {user.name.split(" ")[0][0]}
            </Avatar>

            {editMode && (
              <>
                <input
                  type="file"
                  id="profilePicUpload"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
                <label htmlFor="profilePicUpload">
                  <IconButton
                    component="span"
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      background: "white",
                      boxShadow: 2,
                    }}
                  >
                    <CameraAltIcon />
                  </IconButton>
                </label>
              </>
            )}
          </div>

          <div style={{ marginLeft: 20 }}>
            {editMode ? (
              <>
                <TextField
                  name="name"
                  value={inputs.name || ""}
                  onChange={inputHandler}
                  label="Name"
                  sx={{ mb: 1 }}
                />
                <TextField
                  name="bio"
                  value={inputs.bio || ""}
                  onChange={inputHandler}
                  label="Bio"
                  multiline
                  rows={2}
                  sx={{ mb: 1 }}
                />
                <TextField
                  name="skills"
                  value={inputs.skills || ""}
                  onChange={inputHandler}
                  label="Skills"
                  sx={{ mb: 1 }}
                />
              </>
            ) : (
              <>
                <Typography variant="h4">{user.name}</Typography>
                <Typography variant="body1">{user.bio}</Typography>
              </>
            )}
          </div>
        </div>

        <Typography variant="body2" sx={{ mt: 2 }}>
          Branch: {user.branch}
        </Typography>
        <Typography variant="body2">Year: {user.year}</Typography>
        <Typography variant="body2">
          Skills: {Array.isArray(user.skills) ? user.skills.join(", ") : user.skills}
        </Typography>

        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => {
            if (editMode) {
              updateProfile();
            } else {
              setEditMode(true);
            }
          }}
        >
          {editMode ? "Save Profile" : "Edit Profile"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
