import React, { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Tabs,
  Tab,
  Divider,
} from "@mui/material";
import axios from "axios";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { Link } from "react-router-dom";

const Requests = () => {
  const [tabValue, setTabValue] = useState(0);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  // ✅ Fetch data on mount
  useEffect(() => {
    if (!user?._id) return;

    // Fetch received requests
    axios
      .get(`http://localhost:3006/api/user/requests/${user._id}`)
      .then((res) => {
        setReceivedRequests(res.data);
      })
      .catch((err) => console.error("Error fetching received requests:", err));

    // Fetch sent requests
    axios
      .get(`http://localhost:3006/api/user/sent-requests/${user._id}`)
      .then((res) => {
        setSentRequests(res.data);
      })
      .catch((err) => console.error("Error fetching sent requests:", err));
  }, [user?._id]);

  // ✅ Accept request
  const handleAccept = async (requestId) => {
    try {
      const res = await axios.post(
        "http://localhost:3006/api/user/accept-request",
        {
          fromId: user._id,
          toId: requestId,
        }
      );
      alert(res.data.message);
      setReceivedRequests((prev) => prev.filter((req) => req._id !== requestId));
    } catch (err) {
      console.error("Error accepting request:", err);
    }
  };

  // ✅ Reject request
  const handleReject = async (requestId) => {
    try {
      const res = await axios.post(
        "http://localhost:3006/api/user/reject-request",
        {
          requestId,
          userId: user._id,
        }
      );
      alert(res.data.message);
      setReceivedRequests((prev) => prev.filter((req) => req._id !== requestId));
    } catch (err) {
      console.error("Error rejecting request:", err);
    }
  };

  // ✅ Cancel sent request
  const handleCancel = async (requestId) => {
    try {
      const res = await axios.post(
        "http://localhost:3006/api/user/cancel-request",
        {
          requestId,
          userId: user._id,
        }
      );
      alert(res.data.message);
      setSentRequests((prev) => prev.filter((req) => req._id !== requestId));
    } catch (err) {
      console.error("Error cancelling request:", err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          fontWeight: 600,
          mb: 3,
          color: "text.primary",
          textAlign: "center",
        }}
      >
        Connection Requests
      </Typography>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        centered
        sx={{ mb: 2 }}
      >
        <Tab label={`Received (${receivedRequests.length})`} />
        <Tab label={`Sent (${sentRequests.length})`} />
      </Tabs>

      <Divider sx={{ mb: 3 }} />

      {/* ✅ Received Requests Tab */}
      {tabValue === 0 ? (
        <Grid container spacing={3}>
          {receivedRequests.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="body1" sx={{ textAlign: "center", mt: 4 }}>
                No received requests
              </Typography>
            </Grid>
          ) : (
            receivedRequests.map((request) => (
              <Grid item xs={12} sm={6} md={4} key={request._id}>
                <Card
                  sx={{
                    borderRadius: "12px",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar sx={{ width: 56, height: 56 }} />
                      <Box sx={{ ml: 2 }}>
                        <Link
                          to="/publicprofile"
                          state={{ userId: request._id }}
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                        <Typography variant="h6" component="div">
                          {request.name}
                        </Typography>
                        </Link>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                        >
                          {request.branch} • Year {request.year}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 1,
                      p: 2,
                      pt: 0,
                    }}
                  >
                    <Button
                      onClick={() => handleAccept(request._id)}
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      fullWidth
                      sx={{
                        borderRadius: "8px",
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      Accept
                    </Button>
                    <Button
                      onClick={() => handleReject(request._id)}
                      variant="outlined"
                      color="error"
                      startIcon={<CancelIcon />}
                      fullWidth
                      sx={{
                        borderRadius: "8px",
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      Reject
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      ) : (
        /* ✅ Sent Requests Tab */
        <Grid container spacing={3}>
          {sentRequests.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="body1" sx={{ textAlign: "center", mt: 4 }}>
                No sent requests
              </Typography>
            </Grid>
          ) : (
            sentRequests.map((request) => (
              <Grid item xs={12} sm={6} md={4} key={request._id}>
                <Card
                  sx={{
                    borderRadius: "12px",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar sx={{ width: 56, height: 56 }} />
                      <Box sx={{ ml: 2 }}>
                        <Typography variant="h6" component="div">
                          {request.name}
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                        >
                          {request.branch} • Year {request.year}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>

                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button
                      onClick={() => handleCancel(request._id)}
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      sx={{
                        borderRadius: "8px",
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      Cancel Request
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Box>
  );
};

export default Requests;
