import { Typography, Box, Grid, Paper } from '@mui/material';

export function Dashboard() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Day View
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Time blocks for today will be displayed here with drag-and-drop functionality.
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Tasks
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Task list and management will be implemented here.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}