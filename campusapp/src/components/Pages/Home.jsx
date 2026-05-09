import { Button, Container, Box, Typography, Grid, Paper, styled, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import { School, Forum, Event, Group, LibraryBooks, Sports, ArrowForward } from '@mui/icons-material';

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  borderRadius: theme.shape.borderRadius * 2,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[10],
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '50px',
  padding: '12px 32px',
  fontWeight: 700,
  letterSpacing: '0.5px',
  textTransform: 'none',
}));

const Home = () => {
  const theme = useTheme();

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          position: 'relative',
          overflow: 'hidden',
          py: 15,
          textAlign: 'center',
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 30%, ${theme.palette.success.main} 100%)`,
          color: theme.palette.primary.contrastText,
        }}
      >
        <Container maxWidth="lg">
          <Box 
            sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'url(https://source.unsplash.com/random/1600x900/?university)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.15,
              zIndex: 0,
            }}
          />
          <Box position="relative" zIndex={1}>
            <Typography 
              variant="h2" 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 900,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                lineHeight: 1.2,
                mb: 3
              }}
            >
              Connect. Collaborate. Succeed.
            </Typography>
            <Typography 
              variant="h5" 
              component="p" 
              sx={{ 
                maxWidth: '700px',
                mx: 'auto',
                mb: 5,
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                opacity: 0.9
              }}
            >
              The ultimate platform for university students to connect, share resources, and enhance campus life.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
              <StyledButton 
                component={Link} 
                to="/login" 
                variant="contained" 
                color="secondary"
                size="large"
                endIcon={<ArrowForward />}
              >
                Get Started
              </StyledButton>
              <StyledButton 
                component={Link} 
                to="/signup" 
                variant="outlined" 
                color="secondary"
                size="large"
                sx={{ 
                  borderWidth: '2px',
                  '&:hover': { borderWidth: '2px' }
                }}
              >
                Join Now
              </StyledButton>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box textAlign="center" mb={{ xs: 6, md: 8 }}>
          <Typography 
            variant="h4" 
            component="h2" 
            sx={{ 
              fontWeight: 700,
              mb: 2,
              position: 'relative',
              display: 'inline-block',
              '&:after': {
                content: '""',
                position: 'absolute',
                width: '60%',
                height: '4px',
                bottom: '-8px',
                left: '20%',
                bgcolor: 'secondary.main',
                borderRadius: '2px'
              }
            }}
          >
            Why Campus Connect?
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
            Discover features designed to make your university experience seamless and connected
          </Typography>
        </Box>
        
        <Grid container spacing={4} justifyContent="center">
          {[
            { icon: <Forum sx={{ fontSize: 50 }} />, title: "Discussion Forums", desc: "Engage in academic discussions with peers across departments" },
            { icon: <Event sx={{ fontSize: 50 }} />, title: "Event Management", desc: "Never miss important campus events and deadlines" },
            { icon: <Group sx={{ fontSize: 50 }} />, title: "Study Groups", desc: "Form virtual study groups for collaborative learning" },
            { icon: <LibraryBooks sx={{ fontSize: 50 }} />, title: "Resource Hub", desc: "Central repository for notes, papers, and study materials" },
            { icon: <Sports sx={{ fontSize: 50 }} />, title: "Campus Activities", desc: "Discover and join clubs and sports teams" },
            { icon: <School sx={{ fontSize: 50 }} />, title: "Academic Network", desc: "Connect with seniors and alumni for guidance" }
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <FeatureCard elevation={4}>
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  bgcolor: 'primary.light', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 3,
                  color: 'primary.contrastText'
                }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {feature.desc}
                </Typography>
              </FeatureCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonial/CTA Section */}
      <Box sx={{ 
        bgcolor: 'background.paper', 
        py: { xs: 8, md: 12 },
        borderTop: `1px solid ${theme.palette.divider}`,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
            Join 10,000+ Students Already Connected
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: '600px', mx: 'auto', mb: 5 }}>
            "Campus Connect transformed how I interact with my university. Finding study partners and campus events has never been easier!" 
            <Box component="span" display="block" mt={2} fontWeight="600">- Sarah, Computer Science Senior</Box>
          </Typography>
          <StyledButton 
            component={Link} 
            to="/signup" 
            variant="contained" 
            color="primary"
            size="large"
            sx={{ px: 6 }}
          >
            Create Free Account
          </StyledButton>
        </Container>
      </Box>

      {/* Footer CTA */}
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
          Ready to enhance your campus experience?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}>
          Sign up now and get access to all features completely free for students.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <StyledButton 
            component={Link} 
            to="/login" 
            variant="contained" 
            color="primary"
            size="large"
          >
            Login
          </StyledButton>
          <StyledButton 
            component={Link} 
            to="/signup" 
            variant="outlined" 
            color="primary"
            size="large"
            sx={{ borderWidth: '2px', '&:hover': { borderWidth: '2px' } }}
          >
            Sign Up
          </StyledButton>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;