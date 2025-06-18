import { Typography, Button, Box, Card, CardContent, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { useState, useEffect } from 'react';

export function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Don't render if user is authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await authService.loginDemo();
      login(response.user, response.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Failed to load demo. Please try again.');
      console.error('Demo login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h2" component="h1" gutterBottom>
        Welcome to TimeBlocker
      </Typography>
      
      <Typography variant="h5" component="h2" gutterBottom color="text.secondary">
        Calendar-style time management with time blocking
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2, maxWidth: 400, mx: 'auto' }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mt: 4, mb: 6 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleDemoLogin}
          disabled={loading}
          sx={{ mr: 2, mb: { xs: 2, sm: 0 } }}
        >
          {loading ? 'Loading Demo...' : 'Try Demo'}
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={() => navigate('/register')}
          sx={{ mr: 2, mb: { xs: 2, sm: 0 } }}
        >
          Get Started
        </Button>
        <Button
          variant="text"
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