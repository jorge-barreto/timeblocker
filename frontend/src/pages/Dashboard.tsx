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

  const todayBlocks = timeBlocks.filter(block => {
    const today = new Date();
    const blockDate = new Date(block.start);
    return blockDate.toDateString() === today.toDateString();
  });

  const pendingTasks = tasks.filter(task => task.status === TaskStatus.PENDING).slice(0, 5);
  const completedToday = tasks.filter(task => 
    task.status === TaskStatus.COMPLETED && 
    new Date(task.updatedAt).toDateString() === new Date().toDateString()
  ).length;

  const totalEstimatedTime = tasks
    .filter(task => task.status !== TaskStatus.COMPLETED)
    .reduce((sum, task) => sum + (task.estimatedMinutes || 0), 0);

  const upcomingBlocks = todayBlocks
    .filter(block => new Date(block.start) > new Date())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 3);

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
        {/* Upcoming Time Blocks */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: 400 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Upcoming Time Blocks</Typography>
              <Button 
                size="small" 
                startIcon={<Add />}
                onClick={() => setShowTimeBlockForm(true)}
              >
                Add Block
              </Button>
            </Box>
            
            {upcomingBlocks.length === 0 ? (
              <Typography color="text.secondary">No upcoming time blocks for today</Typography>
            ) : (
              <List>
                {upcomingBlocks.map((block) => (
                  <ListItem key={block.id} divider>
                    <ListItemText
                      primary={block.title}
                      secondary={`${formatTime(block.start)} - ${formatTime(block.end)}`}
                    />
                    {block.task && (
                      <Chip 
                        size="small" 
                        label={block.task.title} 
                        color="primary" 
                        variant="outlined" 
                      />
                    )}
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
        
        {/* Recent Tasks */}
        <Grid item xs={12} md={6}>
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