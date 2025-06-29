import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { TimeBlock } from '../../types';
import { useTimeBlockStore } from '../../store/timeblock.store';
import { useTaskStore } from '../../store/task.store';
import { roundToNearest15Minutes } from '../../utils/date.utils';

interface TimeBlockFormProps {
  open: boolean;
  onClose: () => void;
  timeBlock?: TimeBlock;
  defaultStart?: Date;
  defaultEnd?: Date;
}

export const TimeBlockForm: React.FC<TimeBlockFormProps> = ({ 
  open, 
  onClose, 
  timeBlock, 
  defaultStart,
  defaultEnd 
}) => {
  const { createTimeBlock, updateTimeBlock } = useTimeBlockStore();
  const { tasks } = useTaskStore();
  
  const [title, setTitle] = useState(timeBlock?.title || '');
  const [notes, setNotes] = useState(timeBlock?.notes || '');
  const [start, setStart] = useState<Dayjs>(
    dayjs(timeBlock?.start || defaultStart || roundToNearest15Minutes(new Date()))
  );
  const [end, setEnd] = useState<Dayjs>(
    dayjs(timeBlock?.end || defaultEnd || roundToNearest15Minutes(new Date(Date.now() + 60 * 60 * 1000)))
  );
  const [taskId, setTaskId] = useState(timeBlock?.taskId || '');

  // Reset form when modal closes or timeBlock changes
  useEffect(() => {
    if (!open) {
      // Reset form fields when modal closes
      setTitle('');
      setNotes('');
      setStart(dayjs(defaultStart || roundToNearest15Minutes(new Date())));
      setEnd(dayjs(defaultEnd || roundToNearest15Minutes(new Date(Date.now() + 60 * 60 * 1000))));
      setTaskId('');
    } else if (timeBlock) {
      // Populate form with timeBlock data when editing
      setTitle(timeBlock.title || '');
      setNotes(timeBlock.notes || '');
      setStart(dayjs(timeBlock.start));
      setEnd(dayjs(timeBlock.end));
      setTaskId(timeBlock.taskId || '');
    } else {
      // Reset to defaults when creating new time block
      setTitle('');
      setNotes('');
      setStart(dayjs(defaultStart || roundToNearest15Minutes(new Date())));
      setEnd(dayjs(defaultEnd || roundToNearest15Minutes(new Date(Date.now() + 60 * 60 * 1000))));
      setTaskId('');
    }
  }, [open, timeBlock, defaultStart, defaultEnd]);

  const handleSubmit = async () => {
    const roundedStart = roundToNearest15Minutes(start.toDate());
    const roundedEnd = roundToNearest15Minutes(end.toDate());

    if (roundedEnd <= roundedStart) {
      alert('End time must be after start time');
      return;
    }

    const blockData = {
      title,
      notes,
      start: roundedStart,
      end: roundedEnd,
      taskId: taskId || undefined,
    };

    try {
      if (timeBlock) {
        await updateTimeBlock(timeBlock.id, blockData);
      } else {
        await createTimeBlock(blockData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving time block:', error);
    }
  };

  const duration = Math.round(end.diff(start, 'minute'));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{timeBlock ? 'Edit Time Block' : 'Create Time Block'}</DialogTitle>
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

          <DateTimePicker
            label="Start Time"
            value={start}
            onChange={(newValue) => newValue && setStart(newValue)}
            slotProps={{ textField: { fullWidth: true } }}
          />

          <DateTimePicker
            label="End Time"
            value={end}
            onChange={(newValue) => newValue && setEnd(newValue)}
            slotProps={{ textField: { fullWidth: true } }}
          />

          <Typography variant="body2" color="text.secondary">
            Duration: {Math.floor(duration / 60)}h {duration % 60}m
          </Typography>

          <FormControl fullWidth>
            <InputLabel>Link to Task (Optional)</InputLabel>
            <Select
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              label="Link to Task (Optional)"
            >
              <MenuItem value="">
                <em>No task</em>
              </MenuItem>
              {tasks.map((task) => (
                <MenuItem key={task.id} value={task.id}>
                  {task.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!title}>
          {timeBlock ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};