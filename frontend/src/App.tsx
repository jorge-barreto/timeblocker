import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Box, Tabs, Tab, Button, useTheme, useMediaQuery } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { DayView } from './pages/DayView';
import { Tasks } from './pages/Tasks';
import { useAuthStore } from './store/authStore';
import { useNavigate } from 'react-router-dom';
import logoIcon from './assets/icon.svg';

function App() {
  const { isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  console.log({isAuthenticated}, 'from App')

  const getTabValue = () => {
    if (location.pathname === '/dashboard') return 0;
    if (location.pathname === '/tasks') return 1;
    if (location.pathname === '/day') return 2;
    return false;
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    switch (newValue) {
      case 0: navigate('/dashboard'); break;
      case 1: navigate('/tasks'); break;
      case 2: navigate('/day'); break;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <img 
                src={logoIcon} 
                alt="TimeBlocker" 
                style={{ width: 32, height: 32, marginRight: 8 }}
              />
              <Typography variant="h6" component="div">
                TimeBlocker
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            
            {isAuthenticated && (
              <>
                <Tabs 
                  value={getTabValue()} 
                  onChange={handleTabChange}
                  textColor="inherit"
                  indicatorColor="secondary"
                  sx={{ mr: 2 }}
                >
                  <Tab label="Dashboard" />
                  <Tab label="Tasks" />
                  <Tab label="Calendar" />
                </Tabs>
                <Button color="inherit" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            )}
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/tasks" 
              element={isAuthenticated ? <Tasks /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/day" 
              element={isAuthenticated ? <DayView /> : <Navigate to="/login" />} 
            />
          </Routes>
        </Container>
        
        <ToastContainer
          position={isMobile ? "bottom-center" : "top-right"}
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastStyle={{
            fontSize: '14px',
            borderRadius: '8px',
            ...(isMobile && {
              margin: '0 8px',
              maxWidth: 'calc(100vw - 32px)',
            }),
          }}
          style={isMobile ? {
            bottom: '20px',
            left: '16px',
            right: '16px',
            width: 'auto',
          } : {
            top: '80px',
            right: '20px',
            width: '400px',
          }}
        />
      </Box>
    </LocalizationProvider>
  );
}

export default App;