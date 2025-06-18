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

    try {
      if (task) {
        await updateTask(task.id, taskData);
      } else {
        await createTask(taskData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
    }
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