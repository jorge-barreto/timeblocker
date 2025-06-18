import React from 'react';
import { Box } from '@mui/material';
import { TaskList } from '../components/Tasks/TaskList';

export const Tasks: React.FC = () => {
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TaskList />
    </Box>
  );
};