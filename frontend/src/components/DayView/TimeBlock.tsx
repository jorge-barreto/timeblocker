import React, { useState } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem, Chip } from '@mui/material';
import { MoreVert, CheckCircle, AccessTime } from '@mui/icons-material';
import { useDraggable } from '@dnd-kit/core';
import { format } from 'date-fns';
import { TimeBlock as TimeBlockType, TaskPriority } from '../../types';
import { useTimeBlockStore } from '../../store/timeblock.store';

interface TimeBlockProps {
  block: TimeBlockType;
  style?: React.CSSProperties;
}

export const TimeBlock: React.FC<TimeBlockProps> = ({ block, style }) => {
  const { updateTimeBlock, deleteTimeBlock } = useTimeBlockStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: block.id,
    data: { block },
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleMarkComplete = async () => {
    await updateTimeBlock(block.id, {
      actualEnd: new Date(),
    });
    handleMenuClose();
  };

  const handleDelete = async () => {
    await deleteTimeBlock(block.id);
    handleMenuClose();
  };

  const isCompleted = !!block.actualEnd;
  const isOverdue = new Date() > block.end && !isCompleted;

  const getBackgroundColor = () => {
    if (isCompleted) return 'success.light';
    if (isOverdue) return 'error.light';
    if (block.task?.priority === TaskPriority.HIGH) return 'warning.light';
    return 'primary.light';
  };

  const getTextColor = () => {
    if (isCompleted) return 'success.contrastText';
    if (isOverdue) return 'error.contrastText';
    if (block.task?.priority === TaskPriority.HIGH) return 'warning.contrastText';
    return 'primary.contrastText';
  };

  return (
    <Box
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      sx={{
        ...style,
        bgcolor: getBackgroundColor(),
        color: getTextColor(),
        border: '1px solid',
        borderColor: isCompleted ? 'success.main' : isOverdue ? 'error.main' : 'primary.main',
        borderRadius: 1,
        p: 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.5 : 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '30px',
        '&:hover': {
          opacity: 0.8,
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 'bold',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {block.title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {isCompleted && <CheckCircle fontSize="small" />}
          {isOverdue && <AccessTime fontSize="small" />}
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{ color: 'inherit', p: 0.25 }}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Typography variant="caption" sx={{ mb: 0.5 }}>
        {format(block.start, 'h:mm a')} - {format(block.end, 'h:mm a')}
      </Typography>

      {block.notes && (
        <Typography
          variant="caption"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {block.notes}
        </Typography>
      )}

      {block.task && (
        <Box sx={{ mt: 0.5 }}>
          <Chip
            size="small"
            label={block.task.title}
            variant="outlined"
            sx={{
              height: '16px',
              fontSize: '0.6rem',
              bgcolor: 'rgba(255,255,255,0.2)',
            }}
          />
        </Box>
      )}

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {!isCompleted && (
          <MenuItem onClick={handleMarkComplete}>
            <CheckCircle sx={{ mr: 1 }} fontSize="small" />
            Mark Complete
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>
    </Box>
  );
};