import React from 'react';
import { Box, Typography } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import dayjs from 'dayjs';

interface TimeSlotProps {
  hour: number;
  minute: number;
  date: Date;
  onSelectionStart: () => void;
  onSelectionMove: () => void;
  onSelectionEnd: () => void;
  isSelected: boolean;
  isSelecting: boolean;
}

export const TimeSlot: React.FC<TimeSlotProps> = ({ 
  hour, 
  minute, 
  date, 
  onSelectionStart, 
  onSelectionMove, 
  onSelectionEnd, 
  isSelected, 
  isSelecting 
}) => {
  const time = dayjs(date).hour(hour).minute(minute);
  const id = `${hour}-${minute}`;
  
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <Box
      ref={setNodeRef}
      data-time-slot
      data-hour={hour}
      data-minute={minute}
      onMouseDown={onSelectionStart}
      onMouseEnter={onSelectionMove}
      onMouseUp={onSelectionEnd}
      onTouchStart={onSelectionStart}
      sx={{
        height: '15px',
        borderBottom: minute === 45 ? '1px solid #e0e0e0' : 'none',
        borderTop: minute === 0 ? '1px solid #ccc' : 'none',
        display: 'flex',
        alignItems: 'center',
        bgcolor: isSelected 
          ? 'primary.light' 
          : isOver 
            ? 'action.hover' 
            : 'transparent',
        '&:hover': {
          bgcolor: isSelecting ? undefined : 'action.hover',
        },
        cursor: isSelecting ? 'grabbing' : 'crosshair',
        userSelect: 'none',
        touchAction: 'none',
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