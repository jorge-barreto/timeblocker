import React, { useState } from 'react';
import {
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Checkbox,
  Chip,
  Box,
  Collapse,
  Menu,
  MenuItem,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  MoreVert,
  Add,
  Schedule,
  Flag,
} from '@mui/icons-material';
import { useDraggable } from '@dnd-kit/core';
import { Task, TaskStatus, TaskPriority } from '../../types';
import { useTaskStore } from '../../store/task.store';
import { TaskForm } from './TaskForm';
import { format } from 'date-fns';

interface TaskItemProps {
  task: Task;
  level: number;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, level }) => {
  const { tasks, updateTask, deleteTask } = useTaskStore();
  const [expanded, setExpanded] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);

  const subtasks = tasks.filter((t) => t.parentTaskId === task.id);
  const isCompleted = task.status === TaskStatus.COMPLETED;

  const { attributes, listeners, setNodeRef } = useDraggable({
    id: task.id,
    data: { task },
  });

  const handleStatusToggle = () => {
    updateTask(task.id, {
      status: isCompleted ? TaskStatus.PENDING : TaskStatus.COMPLETED,
    });
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleDelete = () => {
    deleteTask(task.id);
    handleMenuClose();
  };

  const getPriorityIcon = (priority: TaskPriority) => {
    const color = priority === TaskPriority.HIGH ? 'error' :
                  priority === TaskPriority.MEDIUM ? 'warning' : 'info';
    return <Flag fontSize="small" color={color} />;
  };

  const progress = task.estimatedMinutes && task.totalMinutesWorked
    ? Math.min((task.totalMinutesWorked / task.estimatedMinutes) * 100, 100)
    : 0;

  return (
    <>
      <ListItem
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        sx={{
          pl: level * 4,
          opacity: task._syncStatus === 'pending' ? 0.7 : 1,
          cursor: 'grab',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      >
        <ListItemIcon>
          <Checkbox
            checked={isCompleted}
            onChange={handleStatusToggle}
            color="primary"
          />
        </ListItemIcon>

        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="body1"
                sx={{
                  textDecoration: isCompleted ? 'line-through' : 'none',
                  color: isCompleted ? 'text.secondary' : 'text.primary',
                }}
              >
                {task.title}
              </Typography>
              {getPriorityIcon(task.priority)}
              {task.deadline && (
                <Chip
                  size="small"
                  icon={<Schedule />}
                  label={format(task.deadline, 'MMM d')}
                  color={new Date(task.deadline) < new Date() ? 'error' : 'default'}
                />
              )}
              {task.recurrence && (
                <Chip size="small" label="Recurring" variant="outlined" />
              )}
              {task.category && (
                <Chip size="small" label={task.category} variant="outlined" />
              )}
            </Box>
          }
          secondary={
            <>
              {task.notes && (
                <Typography variant="body2" color="text.secondary">
                  {task.notes}
                </Typography>
              )}
              {task.estimatedMinutes && (
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption">
                      {task.totalMinutesWorked || 0} / {task.estimatedMinutes} min
                    </Typography>
                    <Typography variant="caption">{Math.round(progress)}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={progress} />
                </Box>
              )}
            </>
          }
        />

        {subtasks.length > 0 && (
          <IconButton onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        )}

        <IconButton onClick={handleMenuOpen}>
          <MoreVert />
        </IconButton>
      </ListItem>

      {subtasks.length > 0 && (
        <Collapse in={expanded}>
          {subtasks.map((subtask) => (
            <TaskItem key={subtask.id} task={subtask} level={level + 1} />
          ))}
        </Collapse>
      )}

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { setShowSubtaskForm(true); handleMenuClose(); }}>
          <Add sx={{ mr: 1 }} /> Add Subtask
        </MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>

      <TaskForm
        open={showSubtaskForm}
        onClose={() => setShowSubtaskForm(false)}
        parentTaskId={task.id}
      />
    </>
  );
};