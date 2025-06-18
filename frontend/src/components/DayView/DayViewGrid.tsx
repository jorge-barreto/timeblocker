import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, IconButton, Button, Fab } from '@mui/material';
import { ChevronLeft, ChevronRight, Add } from '@mui/icons-material';
import { DndContext, DragEndEvent, DragOverlay } from '@dnd-kit/core';
import dayjs from 'dayjs';
import { TimeBlock } from './TimeBlock';
import { TimeSlot } from './TimeSlot';
import { TimeBlockForm } from './TimeBlockForm';
import { useTimeBlockStore } from '../../store/timeblock.store';
import { TimeBlock as TimeBlockType } from '../../types';

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM
const MINUTES = [0, 15, 30, 45];

interface DragSelection {
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

export const DayViewGrid: React.FC = () => {
  const { timeBlocks, selectedDate, setSelectedDate, updateTimeBlock, fetchDayView } = useTimeBlockStore();
  const [draggedBlock, setDraggedBlock] = useState<TimeBlockType | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [dragSelection, setDragSelection] = useState<DragSelection | null>(null);
  const [showTimeBlockForm, setShowTimeBlockForm] = useState(false);
  const [newBlockStart, setNewBlockStart] = useState<Date | undefined>();
  const [newBlockEnd, setNewBlockEnd] = useState<Date | undefined>();
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDayView(selectedDate);
  }, [selectedDate, fetchDayView]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { over } = event;
    
    if (!over || !draggedBlock) {
      setDraggedBlock(null);
      return;
    }

    const [hour, minute] = over.id.toString().split('-').map(Number);
    const newStart = dayjs(selectedDate).startOf('day').hour(hour).minute(minute).toDate();
    const duration = dayjs(draggedBlock.end).diff(dayjs(draggedBlock.start), 'millisecond');
    const newEnd = dayjs(newStart).add(duration, 'millisecond').toDate();

    try {
      await updateTimeBlock(draggedBlock.id, {
        start: newStart,
        end: newEnd,
      });
    } catch (error) {
      console.error('Error updating time block:', error);
    }

    setDraggedBlock(null);
  };

  const handleDragStart = (event: any) => {
    const block = timeBlocks.find(b => b.id === event.active.id);
    if (block) setDraggedBlock(block);
  };

  const handlePrevDay = () => setSelectedDate(dayjs(selectedDate).subtract(1, 'day').toDate());
  const handleNextDay = () => setSelectedDate(dayjs(selectedDate).add(1, 'day').toDate());
  const handleToday = () => setSelectedDate(new Date());

  // Drag-to-create functionality (mouse and touch)
  const handleSelectionStart = (hour: number, minute: number) => {
    setIsSelecting(true);
    setDragSelection({
      startHour: hour,
      startMinute: minute,
      endHour: hour,
      endMinute: minute + 15, // Default to 15-minute minimum
    });
  };

  const handleSelectionMove = (hour: number, minute: number) => {
    if (isSelecting && dragSelection) {
      const newEndHour = hour;
      const newEndMinute = minute + 15; // Always include the current slot
      
      // Ensure end is after start
      const startTime = dragSelection.startHour * 60 + dragSelection.startMinute;
      const endTime = newEndHour * 60 + newEndMinute;
      
      if (endTime > startTime) {
        setDragSelection({
          ...dragSelection,
          endHour: newEndHour,
          endMinute: newEndMinute,
        });
      }
    }
  };

  const handleSelectionEnd = () => {
    if (isSelecting && dragSelection) {
      // Create time block with selected range
      const startDate = dayjs(selectedDate)
        .hour(dragSelection.startHour)
        .minute(dragSelection.startMinute)
        .toDate();
      const endDate = dayjs(selectedDate)
        .hour(dragSelection.endHour)
        .minute(dragSelection.endMinute)
        .toDate();

      setNewBlockStart(startDate);
      setNewBlockEnd(endDate);
      setShowTimeBlockForm(true);
    }
    
    setIsSelecting(false);
    setDragSelection(null);
  };

  // Touch event handlers for mobile
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSelecting) return;
    
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const timeSlot = element?.closest('[data-time-slot]');
    
    if (timeSlot) {
      const hour = parseInt(timeSlot.getAttribute('data-hour') || '0');
      const minute = parseInt(timeSlot.getAttribute('data-minute') || '0');
      handleSelectionMove(hour, minute);
    }
  };

  const handleAddTimeBlock = () => {
    // Open form with current time defaults
    const now = new Date();
    const startTime = dayjs(selectedDate)
      .hour(now.getHours())
      .minute(Math.floor(now.getMinutes() / 15) * 15)
      .toDate();
    const endTime = dayjs(startTime).add(1, 'hour').toDate();
    
    setNewBlockStart(startTime);
    setNewBlockEnd(endTime);
    setShowTimeBlockForm(true);
  };

  const isSlotInSelection = (hour: number, minute: number) => {
    if (!dragSelection) return false;
    
    const slotTime = hour * 60 + minute;
    const startTime = dragSelection.startHour * 60 + dragSelection.startMinute;
    const endTime = dragSelection.endHour * 60 + dragSelection.endMinute;
    
    return slotTime >= startTime && slotTime < endTime;
  };

  const getBlockPosition = (block: TimeBlockType) => {
    const startHour = block.start.getHours();
    const startMinute = block.start.getMinutes();
    const endHour = block.end.getHours();
    const endMinute = block.end.getMinutes();

    // Each hour is 60px, each 15-minute slot is 15px
    const top = ((startHour - 6) * 60 + (startMinute / 15) * 15);
    const height = ((endHour - startHour) * 60 + ((endMinute - startMinute) / 15) * 15);

    return { top, height };
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={handlePrevDay}>
          <ChevronLeft />
        </IconButton>
        <Typography variant="h6" sx={{ flex: 1, textAlign: 'center' }}>
          {dayjs(selectedDate).format('dddd, MMMM D, YYYY')}
        </Typography>
        <IconButton onClick={handleNextDay}>
          <ChevronRight />
        </IconButton>
        <Button variant="outlined" onClick={handleToday}>
          Today
        </Button>
      </Box>

      {/* Grid */}
      <Paper sx={{ flex: 1, overflow: 'auto', position: 'relative', mx: 2, mb: 2 }}>
        <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
          <Box 
            ref={gridRef} 
            sx={{ position: 'relative', minHeight: '1080px' }}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleSelectionEnd}
          >
            {/* Time slots */}
            {HOURS.map(hour => (
              <Box key={hour}>
                {MINUTES.map(minute => (
                  <TimeSlot
                    key={`${hour}-${minute}`}
                    hour={hour}
                    minute={minute}
                    date={selectedDate}
                    onSelectionStart={() => handleSelectionStart(hour, minute)}
                    onSelectionMove={() => handleSelectionMove(hour, minute)}
                    onSelectionEnd={handleSelectionEnd}
                    isSelected={isSlotInSelection(hour, minute)}
                    isSelecting={isSelecting}
                  />
                ))}
              </Box>
            ))}

            {/* Time blocks */}
            {timeBlocks
              .filter(block => {
                return dayjs(block.start).isSame(dayjs(selectedDate), 'day');
              })
              .map(block => {
                const { top, height } = getBlockPosition(block);
                return (
                  <TimeBlock
                    key={block.id}
                    block={block}
                    style={{
                      position: 'absolute',
                      top: `${top}px`,
                      height: `${Math.max(height, 15)}px`,
                      left: '65px',
                      right: '8px',
                      zIndex: 1,
                    }}
                  />
                );
              })}
          </Box>

          <DragOverlay>
            {draggedBlock && (
              <Box
                sx={{
                  width: '200px',
                  p: 1,
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderRadius: 1,
                  opacity: 0.8,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {draggedBlock.title}
                </Typography>
                <Typography variant="caption">
                  {dayjs(draggedBlock.start).format('h:mm A')} - {dayjs(draggedBlock.end).format('h:mm A')}
                </Typography>
              </Box>
            )}
          </DragOverlay>
        </DndContext>
      </Paper>

      {/* Floating Add Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
        onClick={handleAddTimeBlock}
      >
        <Add />
      </Fab>

      {/* Time Block Form */}
      <TimeBlockForm
        open={showTimeBlockForm}
        onClose={() => {
          setShowTimeBlockForm(false);
          setNewBlockStart(undefined);
          setNewBlockEnd(undefined);
        }}
        defaultStart={newBlockStart}
        defaultEnd={newBlockEnd}
      />
    </Box>
  );
};