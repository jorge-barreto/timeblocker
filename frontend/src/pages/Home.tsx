import { Typography, Button, Box, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h2" component="h1" gutterBottom>
        Welcome to TimeBlocker
      </Typography>
      
      <Typography variant="h5" component="h2" gutterBottom color="text.secondary">
        Calendar-style time management with time blocking
      </Typography>
      
      <Box sx={{ mt: 4, mb: 6 }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/register')}
          sx={{ mr: 2 }}
        >
          Get Started
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={() => navigate('/login')}
        >
          Sign In
        </Button>
      </Box>

      <Box sx={{ mt: 8, display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Card sx={{ maxWidth: 300 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Time Blocking
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Schedule your day in 15-minute increments with drag-and-drop time blocks
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ maxWidth: 300 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Task Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Organize tasks with hierarchical structure, priorities, and deadlines
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ maxWidth: 300 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Offline First
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Works offline with automatic sync when connection is restored
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}