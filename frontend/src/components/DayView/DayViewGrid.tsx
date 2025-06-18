import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, IconButton, Button } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { DndContext, DragEndEvent, DragOverlay } from '@dnd-kit/core';
import { format, addDays, subDays, startOfDay, setHours, setMinutes } from 'date-fns';
import { TimeBlock } from './TimeBlock';
import { TimeSlot } from './TimeSlot';
import { useTimeBlockStore } from '../../store/timeblock.store';
import { TimeBlock as TimeBlockType } from '../../types';

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM
const MINUTES = [0, 15, 30, 45];

export const DayViewGrid: React.FC = () => {
  const { timeBlocks, selectedDate, setSelectedDate, updateTimeBlock, fetchDayView } = useTimeBlockStore();
  const [draggedBlock, setDraggedBlock] = useState<TimeBlockType | null>(null);
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
    const newStart = setMinutes(setHours(startOfDay(selectedDate), hour), minute);
    const duration = draggedBlock.end.getTime() - draggedBlock.start.getTime();
    const newEnd = new Date(newStart.getTime() + duration);

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

  const handlePrevDay = () => setSelectedDate(subDays(selectedDate, 1));
  const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1));
  const handleToday = () => setSelectedDate(new Date());

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
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
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
          <Box ref={gridRef} sx={{ position: 'relative', minHeight: '1080px' }}>
            {/* Time slots */}
            {HOURS.map(hour => (
              <Box key={hour}>
                {MINUTES.map(minute => (
                  <TimeSlot
                    key={`${hour}-${minute}`}
                    hour={hour}
                    minute={minute}
                    date={selectedDate}
                  />
                ))}
              </Box>
            ))}

            {/* Time blocks */}
            {timeBlocks
              .filter(block => {
                const blockDate = startOfDay(block.start);
                const selectedStartOfDay = startOfDay(selectedDate);
                return blockDate.getTime() === selectedStartOfDay.getTime();
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
                  {format(draggedBlock.start, 'h:mm a')} - {format(draggedBlock.end, 'h:mm a')}
                </Typography>
              </Box>
            )}
          </DragOverlay>
        </DndContext>
      </Paper>
    </Box>
  );
};