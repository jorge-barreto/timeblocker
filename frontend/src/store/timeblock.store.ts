import { create } from 'zustand';
import { TimeBlock } from '../types';
import { timeBlockService } from '../services/timeblock.service';

interface TimeBlockState {
  timeBlocks: TimeBlock[];
  selectedDate: Date;
  loading: boolean;
  error: string | null;
  setSelectedDate: (date: Date) => void;
  fetchDayView: (date: Date) => Promise<void>;
  createTimeBlock: (block: Omit<TimeBlock, 'id' | 'createdAt' | 'updatedAt'>) => Promise<TimeBlock>;
  updateTimeBlock: (id: string, updates: Partial<TimeBlock>) => Promise<void>;
  deleteTimeBlock: (id: string) => Promise<void>;
}

export const useTimeBlockStore = create<TimeBlockState>((set, get) => ({
  timeBlocks: [],
  selectedDate: new Date(),
  loading: false,
  error: null,

  setSelectedDate: (date) => {
    set({ selectedDate: date });
    get().fetchDayView(date);
  },

  fetchDayView: async (date) => {
    set({ loading: true, error: null });
    try {
      const blocks = await timeBlockService.getDayView(date);
      set({ timeBlocks: blocks, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createTimeBlock: async (blockData) => {
    const tempId = `temp-${Date.now()}`;
    const newBlock: TimeBlock = {
      ...blockData,
      id: tempId,
      createdAt: new Date(),
      updatedAt: new Date(),
      _syncStatus: 'pending',
    } as TimeBlock;

    // Optimistic update
    set(state => ({ timeBlocks: [...state.timeBlocks, newBlock] }));

    try {
      const createdBlock = await timeBlockService.createTimeBlock(blockData);
      set(state => ({
        timeBlocks: state.timeBlocks.map(b => b.id === tempId ? createdBlock : b)
      }));
      return createdBlock;
    } catch (error: any) {
      // Remove optimistic update on error
      set(state => ({
        timeBlocks: state.timeBlocks.filter(b => b.id !== tempId),
        error: error.message
      }));
      throw error;
    }
  },

  updateTimeBlock: async (id, updates) => {
    // Optimistic update
    set(state => ({
      timeBlocks: state.timeBlocks.map(b => 
        b.id === id ? { ...b, ...updates, _syncStatus: 'pending' } : b
      )
    }));

    try {
      const updatedBlock = await timeBlockService.updateTimeBlock(id, updates);
      set(state => ({
        timeBlocks: state.timeBlocks.map(b => 
          b.id === id ? updatedBlock : b
        )
      }));
    } catch (error: any) {
      // Revert optimistic update on error
      set(state => ({
        timeBlocks: state.timeBlocks.map(b => 
          b.id === id ? { ...b, _syncStatus: 'error' } : b
        ),
        error: error.message
      }));
      throw error;
    }
  },

  deleteTimeBlock: async (id) => {
    // Optimistic update
    set(state => ({
      timeBlocks: state.timeBlocks.filter(b => b.id !== id)
    }));

    try {
      await timeBlockService.deleteTimeBlock(id);
    } catch (error: any) {
      // Revert optimistic update on error
      await get().fetchDayView(get().selectedDate);
      set({ error: error.message });
      throw error;
    }
  },
}));