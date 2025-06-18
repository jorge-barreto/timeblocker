# TimeGrid Frontend - Services and Key Components

## src/services/auth.service.ts
```typescript
import { api } from './api';
import { AuthResponse } from '../types';

export const authService = {
  async register(email: string, password: string, name?: string, timezone?: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', {
      email,
      password,
      name,
      timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    return response.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  async updatePushSubscription(subscription: PushSubscriptionJSON): Promise<void> {
    await api.post('/auth/push-subscription', { subscription });
  },
};
```

## src/services/task.service.ts
```typescript
import { api } from './api';
import { Task, TaskStatus, TaskPriority } from '../types';

export const taskService = {
  async getTasks(filters?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    parentId?: string | null;
  }): Promise<Task[]> {
    const response = await api.get<Task[]>('/tasks', { params: filters });
    return response.data.map(task => ({
      ...task,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
      deadline: task.deadline ? new Date(task.deadline) : undefined,
    }));
  },

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const response = await api.post<Task>('/tasks', task);
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
      deadline: response.data.deadline ? new Date(response.data.deadline) : undefined,
    };
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const response = await api.patch<Task>(`/tasks/${id}`, updates);
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
      deadline: response.data.deadline ? new Date(response.data.deadline) : undefined,
    };
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },
};
```

## src/services/timeblock.service.ts
```typescript
import { api } from './api';
import { TimeBlock } from '../types';
import { format } from 'date-fns';

export const timeBlockService = {
  async getDayView(date: Date): Promise<TimeBlock[]> {
    const response = await api.get<TimeBlock[]>('/day-view', {
      params: { date: format(date, 'yyyy-MM-dd') },
    });
    return response.data.map(block => ({
      ...block,
      start: new Date(block.start),
      end: new Date(block.end),
      actualEnd: block.actualEnd ? new Date(block.actualEnd) : undefined,
      createdAt: new Date(block.createdAt),
      updatedAt: new Date(block.updatedAt),
    }));
  },

  async createTimeBlock(block: Omit<TimeBlock, 'id' | 'createdAt' | 'updatedAt'>): Promise<TimeBlock> {
    const response = await api.post<TimeBlock>('/timeblocks', {
      ...block,
      start: block.start.toISOString(),
      end: block.end.toISOString(),
    });
    return {
      ...response.data,
      start: new Date(response.data.start),
      end: new Date(response.data.end),
      actualEnd: response.data.actualEnd ? new Date(response.data.actualEnd) : undefined,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
    };
  },

  async updateTimeBlock(id: string, updates: Partial<TimeBlock>): Promise<TimeBlock> {
    const payload = { ...updates };
    if (updates.start) payload.start = updates.start.toISOString() as any;
    if (updates.end) payload.end = updates.end.toISOString() as any;
    if (updates.actualEnd) payload.actualEnd = updates.actualEnd.toISOString() as any;

    const response = await api.patch<TimeBlock>(`/timeblocks/${id}`, payload);
    return {
      ...response.data,
      start: new Date(response.data.start),
      end: new Date(response.data.end),
      actualEnd: response.data.actualEnd ? new Date(response.data.actualEnd) : undefined,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
    };
  },

  async deleteTimeBlock(id: string): Promise<void> {
    await api.delete(`/timeblocks/${id}`);
  },
};
```

## src/components/Tasks/TaskForm.tsx
```typescript
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { TaskPriority, RecurrenceType, Task } from '../../types';
import { useTaskStore } from '../../store/task.store';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  task?: Task;
  parentTaskId?: string;
}

export const TaskForm: React.FC<TaskFormProps> = ({ open, onClose, task, parentTaskId }) => {
  const { createTask, updateTask } = useTaskStore();
  const [title, setTitle] = useState(task?.title || '');
  const [notes, setNotes] = useState(task?.notes || '');
  const [priority, setPriority] = useState(task?.priority || TaskPriority.MEDIUM);
  const [category, setCategory] = useState(task?.category || '');
  const [deadline, setDeadline] = useState<Date | null>(task?.deadline || null);
  const [estimatedMinutes, setEstimatedMinutes] = useState(task?.estimatedMinutes?.toString() || '');
  const [isRecurring, setIsRecurring] = useState(!!task?.recurrence);
  const [recurrenceType, setRecurrenceType] = useState(task?.recurrence?.type || RecurrenceType.DAILY);
  const [recurrenceInterval, setRecurrenceInterval] = useState(task?.recurrence?.interval?.toString() || '1');

  const handleSubmit = async () => {
    const taskData: any = {
      title,
      notes,
      priority,
      category,
      deadline,
      estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : undefined,
      parentTaskId,
    };

    if (isRecurring) {
      taskData.recurrence = {
        type: recurrenceType,
        interval: parseInt(recurrenceInterval),
      };
    }

    if (task) {
      await updateTask(task.id, taskData);
    } else {
      await createTask(taskData);
    }

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{task ? 'Edit Task' : 'Create Task'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            autoFocus
            label="Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <TextField
            label="Notes"
            fullWidth
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              label="Priority"
            >
              {Object.values(TaskPriority).map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Category"
            fullWidth
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Work, Personal, etc."
          />

          <DateTimePicker
            label="Deadline"
            value={deadline}
            onChange={setDeadline}
            slotProps={{ textField: { fullWidth: true } }}
          />

          <TextField
            label="Estimated Minutes"
            type="number"
            fullWidth
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(e.target.value)}
            inputProps={{ min: 0, step: 15 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
              />
            }
            label="Recurring Task"
          />

          {isRecurring && (
            <>
              <FormControl fullWidth>
                <InputLabel>Recurrence Type</InputLabel>
                <Select
                  value={recurrenceType}
                  onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType)}
                  label="Recurrence Type"
                >
                  {Object.values(RecurrenceType).map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Repeat Every"
                type="number"
                fullWidth
                value={recurrenceInterval}
                onChange={(e) => setRecurrenceInterval(e.target.value)}
                inputProps={{ min: 1 }}
                helperText={`Every ${recurrenceInterval} ${recurrenceType.toLowerCase()}`}
              />
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!title}>
          {task ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

## src/components/Tasks/TaskItem.tsx
```typescript
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
```

## src/components/DayView/TimeSlot.tsx
```typescript
import React from 'react';
import { Box, Typography } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import { format, setHours, setMinutes } from 'date-fns';

interface TimeSlotProps {
  hour: number;
  minute: number;
  date: Date;
}

export const TimeSlot: React.FC<TimeSlotProps> = ({ hour, minute, date }) => {
  const time = setMinutes(setHours(date, hour), minute);
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
          {format(time, 'h:mm a')}
        </Typography>
      )}
    </Box>
  );
};
```

## src/components/Layout/AppBar.tsx
```typescript
import React from 'react';
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
  Chip,
} from '@mui/material';
import {
  Notifications,
  Sync,
  SyncDisabled,
  AccountCircle,
} from '@mui/icons-material';
import { useAuthStore } from '../../store/auth.store';
import { useSyncStore } from '../../store/sync.store';

export const AppBar: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const { pendingChanges, isSyncing } = useSyncStore();
  const isOnline = navigator.onLine;

  return (
    <MuiAppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          TimeGrid
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Sync status */}
          <Chip
            icon={isOnline ? (isSyncing ? <Sync /> : null) : <SyncDisabled />}
            label={
              !isOnline ? 'Offline' :
              isSyncing ? 'Syncing...' :
              pendingChanges > 0 ? `${pendingChanges} pending` :
              'Synced'
            }
            color={!isOnline ? 'warning' : pendingChanges > 0 ? 'info' : 'success'}
            size="small"
          />

          {/* Notifications */}
          <IconButton color="inherit">
            <Badge badgeContent={0} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          {/* User menu */}
          <IconButton color="inherit">
            <AccountCircle />
          </IconButton>
          {user && (
            <Typography variant="body2">
              {user.name || user.email}
            </Typography>
          )}
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
};
```

## src/components/Layout/Navigation.tsx
```typescript
import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from '@mui/material';
import {
  CalendarToday,
  CheckBox,
  Settings,
  ExitToApp,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

const drawerWidth = 240;

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const menuItems = [
    { text: 'Day View', icon: <CalendarToday />, path: '/day' },
    { text: 'Tasks', icon: <CheckBox />, path: '/tasks' },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
        
        <ListItem disablePadding sx={{ mt: 'auto' }}>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon><ExitToApp /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};
```

## src/hooks/useOfflineSync.ts
```typescript
import { useEffect } from 'react';
import { offlineService } from '../services/offline.service';
import { taskService } from '../services/task.service';
import { timeBlockService } from '../services/timeblock.service';
import { useSyncStore } from '../store/sync.store';
import { useTaskStore } from '../store/task.store';
import { useTimeBlockStore } from '../store/timeblock.store';

export const useOfflineSync = () => {
  const { setIsSyncing, setPendingChanges } = useSyncStore();
  const fetchTasks = useTaskStore((state) => state.fetchTasks);
  const fetchDayView = useTimeBlockStore((state) => state.fetchDayView);
  const selectedDate = useTimeBlockStore((state) => state.selectedDate);

  useEffect(() => {
    // Initialize offline service
    offlineService.init();

    // Sync on online event
    const handleOnline = async () => {
      console.log('Back online, syncing...');
      await syncPendingChanges();
    };

    // Check sync queue periodically
    const syncInterval = setInterval(async () => {
      if (navigator.onLine) {
        await syncPendingChanges();
      }
    }, 30000); // Every 30 seconds

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(syncInterval);
    };
  }, []);

  const syncPendingChanges = async () => {
    const queue = await offlineService.getSyncQueue();
    
    if (queue.length === 0) {
      setPendingChanges(0);
      return;
    }

    setIsSyncing(true);
    setPendingChanges(queue.length);

    for (const item of queue) {
      try {
        switch (item.type) {
          case 'task':
            await syncTask(item);
            break;
          case 'timeblock':
            await syncTimeBlock(item);
            break;
        }
        
        await offlineService.removeSyncQueueItem(item.id);
      } catch (error) {
        console.error('Sync error:', error);
        // Increment retry count
        await offlineService.updateSyncQueueItem({
          ...item,
          retries: item.retries + 1,
        });
      }
    }

    // Refresh data
    await Promise.all([
      fetchTasks(),
      fetchDayView(selectedDate),
    ]);

    setIsSyncing(false);
    setPendingChanges(0);
  };

  const syncTask = async (item: any) => {
    switch (item.action) {
      case 'create':
        await taskService.createTask(item.data);
        break;
      case 'update':
        await taskService.updateTask(item.data.id, item.data.updates);
        break;
      case 'delete':
        await taskService.deleteTask(item.data.id);
        break;
    }
  };

  const syncTimeBlock = async (item: any) => {
    switch (item.action) {
      case 'create':
        await timeBlockService.createTimeBlock(item.data);
        break;
      case 'update':
        await timeBlockService.updateTimeBlock(item.data.id, item.data.updates);
        break;
      case 'delete':
        await timeBlockService.deleteTimeBlock(item.data.id);
        break;
    }
  };
};
```

## src/hooks/usePushNotifications.ts
```typescript
import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { authService } from '../services/auth.service';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export const usePushNotifications = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    registerPushNotifications();
  }, [isAuthenticated]);

  const registerPushNotifications = async () => {
    try {
      // Check permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Send subscription to backend
      await authService.updatePushSubscription(subscription.toJSON());
      
      console.log('Push notifications enabled');
    } catch (error) {
      console.error('Failed to enable push notifications:', error);
    }
  };
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
```

## src/store/sync.store.ts
```typescript
import { create } from 'zustand';

interface SyncState {
  isSyncing: boolean;
  pendingChanges: number;
  lastSyncTime: Date | null;
  setIsSyncing: (syncing: boolean) => void;
  setPendingChanges: (count: number) => void;
  setLastSyncTime: (time: Date) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  isSyncing: false,
  pendingChanges: 0,
  lastSyncTime: null,
  setIsSyncing: (syncing) => set({ isSyncing: syncing }),
  setPendingChanges: (count) => set({ pendingChanges: count }),
  setLastSyncTime: (time) => set({ lastSyncTime: time }),
}));
```

## src/components/Auth/RegisterForm.tsx
```typescript
import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert,
  Paper,
  Link
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/auth.store';

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register(
        formData.email,
        formData.password,
        formData.name
      );
      setAuth(response.user, response.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      bgcolor: 'background.default'
    }}>
      <Paper sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h4" align="center" gutterBottom>
          TimeGrid
        </Typography>
        <Typography variant="h6" align="center" gutterBottom>
          Create Account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            margin="normal"
            required
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Register'}
          </Button>
        </form>

        <Typography align="center">
          Already have an account?{' '}
          <Link 
            component="button" 
            onClick={() => navigate('/login')}
            underline="hover"
          >
            Login
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};
```

## src/index.css
```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Ensure full height for the app */
#root {
  height: 100vh;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
```