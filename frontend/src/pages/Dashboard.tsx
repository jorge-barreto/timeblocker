import { useEffect, useState } from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Fab
} from '@mui/material';
import { Add, TrendingUp, Schedule, CheckCircle } from '@mui/icons-material';
import { useTaskStore } from '../store/task.store';
import { useTimeBlockStore } from '../store/timeblock.store';
import { TaskStatus, TaskPriority } from '../types';
import { formatTime, formatDuration } from '../utils/date.utils';
import { TaskForm } from '../components/Tasks/TaskForm';
import { TimeBlockForm } from '../components/DayView/TimeBlockForm';

export function Dashboard() {
  const { tasks, fetchTasks, updateTask } = useTaskStore();
  const { timeBlocks, fetchDayView } = useTimeBlockStore();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTimeBlockForm, setShowTimeBlockForm] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchDayView(new Date());
  }, [fetchTasks, fetchDayView]);

  const pendingTasks = tasks.filter(task => task.status === TaskStatus.PENDING).slice(0, 8);
  const completedToday = tasks.filter(task => 
    task.status === TaskStatus.COMPLETED && 
    new Date(task.updatedAt).toDateString() === new Date().toDateString()
  ).length;

  const totalEstimatedTime = tasks
    .filter(task => task.status !== TaskStatus.COMPLETED)
    .reduce((sum, task) => sum + (task.estimatedMinutes || 0), 0);

  const todayBlocks = timeBlocks.filter(block => {
    const today = new Date();
    const blockDate = new Date(block.start);
    return blockDate.toDateString() === today.toDateString();
  });

  const handleTaskToggle = (taskId: string, currentStatus: TaskStatus) => {
    const newStatus = currentStatus === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED;
    updateTask(taskId, { status: newStatus });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle color="success" />
                <Typography variant="h6">{completedToday}</Typography>
              </Box>
              <Typography color="text.secondary">Completed Today</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule color="primary" />
                <Typography variant="h6">{todayBlocks.length}</Typography>
              </Box>
              <Typography color="text.secondary">Time Blocks Today</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp color="warning" />
                <Typography variant="h6">{pendingTasks.length}</Typography>
              </Box>
              <Typography color="text.secondary">Pending Tasks</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule color="info" />
                <Typography variant="h6">{formatDuration(totalEstimatedTime)}</Typography>
              </Box>
              <Typography color="text.secondary">Estimated Work</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Pending Tasks */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, height: 400 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Pending Tasks</Typography>
              <Button 
                size="small" 
                startIcon={<Add />}
                onClick={() => setShowTaskForm(true)}
              >
                Add Task
              </Button>
            </Box>
            
            {pendingTasks.length === 0 ? (
              <Typography color="text.secondary">No pending tasks</Typography>
            ) : (
              <List>
                {pendingTasks.map((task) => (
                  <ListItem key={task.id} divider>
                    <ListItemIcon>
                      <Checkbox
                        checked={task.status === TaskStatus.COMPLETED}
                        onChange={() => handleTaskToggle(task.id, task.status)}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={task.title}
                      secondary={task.category}
                    />
                    <Chip 
                      size="small" 
                      label={task.priority} 
                      color={task.priority === TaskPriority.HIGH ? 'error' : 
                             task.priority === TaskPriority.MEDIUM ? 'warning' : 'info'}
                      variant="outlined" 
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
        
        {/* Quick Actions & Today's Summary */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Today's Schedule
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Time blocks scheduled: {todayBlocks.length}
              </Typography>
              
              {todayBlocks.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Next up:
                  </Typography>
                  {(() => {
                    const nextBlock = todayBlocks
                      .filter(block => new Date(block.start) > new Date())
                      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0];
                    
                    return nextBlock ? (
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {nextBlock.title} at {formatTime(nextBlock.start)}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        No more blocks today
                      </Typography>
                    );
                  })()}
                </Box>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => setShowTaskForm(true)}
                fullWidth
              >
                Add Task
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Schedule />}
                onClick={() => setShowTimeBlockForm(true)}
                fullWidth
              >
                Add Time Block
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Floating Action Buttons */}
      <Fab
        color="primary"
        aria-label="add time block"
        sx={{ position: 'fixed', bottom: 80, right: 16 }}
        onClick={() => setShowTimeBlockForm(true)}
      >
        <Schedule />
      </Fab>
      
      <Fab
        color="secondary"
        aria-label="add task"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setShowTaskForm(true)}
      >
        <Add />
      </Fab>

      {/* Forms */}
      <TaskForm
        open={showTaskForm}
        onClose={() => setShowTaskForm(false)}
      />
      
      <TimeBlockForm
        open={showTimeBlockForm}
        onClose={() => setShowTimeBlockForm(false)}
      />
    </Box>
  );
}