import { Avatar, Card, CardContent, Typography, Grid, Box, Button } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { styled } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  },
}));

const ViewConnections = () => {
  const [connections, setConnections] = useState([]);
  const User = JSON.parse(localStorage.getItem('user'));
  const navigate=useNavigate()

  useEffect(() => {
    if (!User?._id) return;
    axios
      .get(`http://localhost:3006/api/user/connections/${User._id}`)
      .then((res) => {
        setConnections(res.data || []);
      })
      .catch((err) => {
        console.error('Error fetching connections:', err);
      });
  }, [User?._id]);

const ChatHandler = (recipientId) => {
  navigate("/chatpage", { state: { recipientId } })
};

  return (
    <Box sx={{ padding: 3 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          fontWeight: 600,
          mb: 4,
          color: 'text.primary',
        }}
      >
        Your Connections
      </Typography>

      <Grid container spacing={3}>
        {connections.length === 0 ? (
          <Typography variant="body1" color="text.secondary" sx={{ ml: 2 }}>
            No connections yet.
          </Typography>
        ) : (
          connections.map((person) => (
            <Grid item xs={12} sm={6} md={4} key={person._id}>
              <StyledCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={person.profilePic}
                      sx={{ width: 56, height: 56 }}
                    />
                    <Box sx={{ ml: 2 }}>
                      <Link
                          to="/publicprofile"
                          state={{ userId: person._id }}
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                      <Typography variant="h6" component="div">
                        {person.name}
                      </Typography>
                      </Link>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                      >
                        {person.branch} • Year {person.year}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'success.main',
                      width: '100%',
                      justifyContent: 'center',
                    }}
                  >
                    <Button variant='contained' onClick={()=>{ChatHandler(person._id)}}>Chat</Button>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default ViewConnections;