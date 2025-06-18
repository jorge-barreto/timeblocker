import React from 'react';
import { Box, Typography } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import dayjs from 'dayjs';

interface TimeSlotProps {
  hour: number;
  minute: number;
  date: Date;
}

export const TimeSlot: React.FC<TimeSlotProps> = ({ hour, minute, date }) => {
  const time = dayjs(date).hour(hour).minute(minute);
  const id = `${hour}-${minute}`;
  
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        height: '15px',
        borderBottom: minute === 45 ? '1px solid #e0e0e0' : 'none',
        borderTop: minute === 0 ? '1px solid #ccc' : 'none',
        display: 'flex',
        alignItems: 'center',
        bgcolor: isOver ? 'action.hover' : 'transparent',
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
    >
      {minute === 0 && (
        <Typography
          variant="caption"
          sx={{
            width: '60px',
            textAlign: 'right',
            pr: 1,
            color: 'text.secondary',
          }}
        >
          {time.format('h:mm A')}
        </Typography>
      )}
    </Box>
  );
};