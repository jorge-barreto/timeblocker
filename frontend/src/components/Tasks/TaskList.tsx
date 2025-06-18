import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  TextField,
  InputAdornment,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Fab,
} from '@mui/material';
import { Search, Add, FilterList } from '@mui/icons-material';
import { useTaskStore } from '../../store/task.store';
import { TaskItem } from './TaskItem';
import { TaskForm } from './TaskForm';
import { TaskStatus, TaskPriority } from '../../types';

export const TaskList: React.FC = () => {
  const { tasks, loading, fetchTasks } = useTaskStore();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filteredTasks = tasks.filter(task => {
    // Only show top-level tasks (no parent)
    if (task.parentTaskId) return false;

    // Search filter
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'all' && task.status !== statusFilter) {
      return false;
    }

    // Priority filter
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
      return false;
    }

    return true;
  });

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'success';
      case TaskStatus.IN_PROGRESS:
        return 'primary';
      case TaskStatus.PENDING:
        return 'default';
      default:
        return 'default';
    }
  };


  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Tasks
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowTaskForm(true)}
        >
          Add Task
        </Button>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
        </Box>

        {showFilters && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                {Object.values(TaskStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'all')}
                label="Priority"
              >
                <MenuItem value="all">All</MenuItem>
                {Object.values(TaskPriority).map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {priority}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
      </Paper>

      {/* Task Statistics */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        <Chip
          label={`Total: ${tasks.length}`}
          variant="outlined"
        />
        {Object.values(TaskStatus).map((status) => {
          const count = tasks.filter(t => t.status === status).length;
          return (
            <Chip
              key={status}
              label={`${status}: ${count}`}
              color={getStatusColor(status)}
              variant="outlined"
            />
          );
        })}
      </Box>

      {/* Task List */}
      {loading ? (
        <Typography>Loading tasks...</Typography>
      ) : filteredTasks.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'No tasks match your filters'
              : 'No tasks yet'
            }
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first task to get started'
            }
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowTaskForm(true)}
          >
            Add Task
          </Button>
        </Paper>
      ) : (
        <Paper>
          <List>
            {filteredTasks.map((task) => (
              <TaskItem key={task.id} task={task} level={0} />
            ))}
          </List>
        </Paper>
      )}

      {/* Floating Action Button for mobile */}
      <Fab
        color="primary"
        aria-label="add task"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', sm: 'none' },
        }}
        onClick={() => setShowTaskForm(true)}
      >
        <Add />
      </Fab>

      {/* Task Form Dialog */}
      <TaskForm
        open={showTaskForm}
        onClose={() => setShowTaskForm(false)}
      />
    </Box>
  );
};