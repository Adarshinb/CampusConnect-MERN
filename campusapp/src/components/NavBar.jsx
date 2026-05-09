// components/NavBar.jsx
import {
  AppBar,
  Button,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme
} from "@mui/material";
import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import "./css/NavBar.css";

const NavBar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  // read user once (memoized so it doesn't reparse on every render)
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  // if not logged in OR if user is admin -> don't show this navbar
  if (!currentUser || currentUser.userType === "admin") return null;

  const isFaculty = currentUser.userType === "faculty";

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // remove only the keys we set
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    // remove default axios header if you set it globally elsewhere
    try {
      // eslint-disable-next-line no-undef
      if (typeof window !== "undefined") {
        // optional, in case axios was set globally
        // axios.defaults.headers.common["Authorization"] = null;
      }
    } catch (e) {
      // ignore
    }

    navigate("/login");
  };

  return (
    <div>
      <AppBar position="fixed" className="app-bar">
        <Toolbar className="toolbar">
          <Typography variant="h6" component="div" className="logo">
            CampusApp
          </Typography>

          {!isMobile ? (
            <Box className="nav-links">
              <Link to="/" className="nav-link">
                <Button variant="text" className="nav-button">
                  Home
                </Button>
              </Link>

              <Link to="/profile" className="nav-link">
                <Button variant="text" className="nav-button">
                  Profile
                </Button>
              </Link>

              <Link to="/connections" className="nav-link">
                <Button variant="text" className="nav-button">
                  Chat
                </Button>
              </Link>

              <Link to="/requests" className="nav-link">
                <Button variant="text" className="nav-button">
                  Requests
                </Button>
              </Link>

              <Link to="/viewpost" className="nav-link">
                <Button variant="text" className="nav-button">
                  Posts
                </Button>
              </Link>

              <Link to="/connect" className="nav-link">
                <Button variant="text" className="nav-button">
                  Find connections
                </Button>
              </Link>

              <Link to="/addpost" className="nav-link">
                <Button
                  variant="contained"
                  color="secondary"
                  className="highlight-button"
                >
                  Add Post
                </Button>
              </Link>

              {isFaculty && (
                <Link to="/bulkupload" className="nav-link">
                  <Button variant="text" className="nav-button">
                    Bulk Add
                  </Button>
                </Link>
              )}

              <Button color="error" className="highlight-button" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          ) : (
            <>
              <IconButton
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMenuOpen}
                sx={{ ml: "auto" }}
              >
                <MenuIcon />
              </IconButton>

              <Menu
                id="mobile-menu"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right"
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right"
                }}
                open={open}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleMenuClose} component={Link} to="/">
                  Home
                </MenuItem>

                <MenuItem onClick={handleMenuClose} component={Link} to="/profile">
                  Profile
                </MenuItem>

                <MenuItem onClick={handleMenuClose} component={Link} to="/requests">
                  Requests
                </MenuItem>

                <MenuItem onClick={handleMenuClose} component={Link} to="/viewpost">
                  Posts
                </MenuItem>

                <MenuItem onClick={handleMenuClose} component={Link} to="/connect">
                  Find connections
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    navigate("/addpost");
                  }}
                  sx={{ color: theme.palette.secondary.main }}
                >
                  Add Post
                </MenuItem>

                {isFaculty && (
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      navigate("/bulkupload");
                    }}
                  >
                    Bulk Add
                  </MenuItem>
                )}

                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    handleLogout();
                  }}
                  sx={{ color: theme.palette.error.main }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>
      <div className="app-bar-spacer" />
    </div>
  );
};

export default NavBar;
