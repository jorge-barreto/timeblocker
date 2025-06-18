import React from 'react';
import { Box } from '@mui/material';
import { DayViewGrid } from '../components/DayView/DayViewGrid';

export const DayView: React.FC = () => {
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <DayViewGrid />
    </Box>
  );
};