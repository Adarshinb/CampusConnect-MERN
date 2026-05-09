import { Avatar, Button, Card, CardContent, Typography, Grid, Box, Chip, CircularProgress } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { styled } from '@mui/material/styles';
import '../css/ConnectUser.css'; // keep your styles here
import { Link } from 'react-router-dom';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
  }
}));

const ConnectUser = () => {
  const [people, setPeople] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper: safe id comparator
  const eqId = (a, b) => {
    if (!a || !b) return false;
    return a.toString() === b.toString();
  };

  useEffect(() => {
    // if no current user, nothing to fetch
    if (!currentUser?._id) return;

    setLoading(true);
    setError("");

    axios.get(`http://localhost:3006/api/user/filtered/${currentUser._id}`)
      .then((res) => {
        // backend may return array of users; filter out admin users here as well
        const filtered = Array.isArray(res.data)
          ? res.data.filter(u => u.userType !== "admin")
          : [];

        setPeople(filtered);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load users. Try again later.");
      })
      .finally(() => setLoading(false));
  }, [currentUser]);

  const handlerequest = (toId) => {
    if (!currentUser?._id) {
      alert("Please login to send requests");
      return;
    }

    axios.post("http://localhost:3006/api/user/send-request", {
      fromId: currentUser._id,
      toId
    }).then((res) => {
      alert(res.data.message || "Request sent");

      // Update currentUser in state and localStorage (functional update to ensure using latest state)
      setCurrentUser(prev => {
        const updated = {
          ...prev,
          requestsSent: Array.isArray(prev?.requestsSent) ? [...prev.requestsSent, toId] : [toId]
        };
        try {
          localStorage.setItem("user", JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to write user to localStorage", e);
        }
        return updated;
      });

      // Update people list locally so UI reflects pending state immediately
      setPeople(prev =>
        prev.map(person =>
          eqId(person._id, toId)
            ? ({ ...person, requestsSent: Array.isArray(person.requestsSent) ? [...person.requestsSent, currentUser._id] : [currentUser._id] })
            : person
        )
      );
    }).catch(err => {
      console.error(err);
      alert(err.response?.data?.error || "Failed to send request");
    });
  };

  const checkStatus = (person) => {
    if (!currentUser) return "connect";
    // use string-safe checks (some arrays may contain ObjectId objects)
    if (Array.isArray(currentUser.connections) && currentUser.connections.some(c => eqId(c, person._id))) return "connected";
    if (Array.isArray(currentUser.requestsSent) && currentUser.requestsSent.some(r => eqId(r, person._id))) return "pending";
    return "connect";
  };

  // If logged-in user is admin, do not show connect UI
  if (currentUser?.userType === "admin") {
    return (
      <Box sx={{ padding: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Connect with Others
        </Typography>
        <Typography sx={{ mt: 2 }}>
          Admin users cannot use the connection feature.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        Connect with Others
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
      )}

      <Grid container spacing={3}>
        {people
          // remove current user and admins (defensive)
          .filter(person => !eqId(person._id, currentUser?._id) && person.userType !== "admin")
          .map((person) => {
            const status = checkStatus(person);

            return (
              <Grid item xs={12} sm={6} md={4} key={person._id}>
                <StyledCard>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar src={person.profilePic} sx={{ width: 56, height: 56 }} />
                      <Box sx={{ ml: 2 }}>
                        <Link
                          to="/publicprofile"
                          state={{ userId: person._id }}
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          <Typography variant="h6">{person.name}</Typography>
                        </Link>

                        {/* show branch; show year only for students (not for faculty) */}
                        <Typography variant="subtitle2" color="text.secondary">
                          {person.branch || "No branch"}
                          {person.userType === "student" && person.year ? ` • Year ${person.year}` : ""}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
                      {status === "connect" && (
                        <Button
                          onClick={() => handlerequest(person._id)}
                          variant="contained"
                          color="primary"
                          fullWidth
                          sx={{ borderRadius: "20px", textTransform: "none", fontWeight: 600 }}
                        >
                          Connect
                        </Button>
                      )}

                      {status === "pending" && (
                        <Chip
                          label="Request Sent"
                          color="info"
                          sx={{ width: "100%", borderRadius: "20px", fontWeight: 500 }}
                        />
                      )}

                      {status === "connected" && (
                        <Box sx={{ display: "flex", alignItems: "center", color: "success.main", width: "100%", justifyContent: "center" }}>
                          <CheckCircleIcon sx={{ mr: 1 }} />
                          <Typography variant="body2">Connected</Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
            );
          })}
      </Grid>
    </Box>
  );
};

export default ConnectUser;
