import { api, showSuccessToast } from './api';
import { TimeBlock } from '../types';
import dayjs from 'dayjs';

export const timeBlockService = {
  async getDayView(date: Date): Promise<TimeBlock[]> {
    const response = await api.get<TimeBlock[]>('/day-view', {
      params: { date: dayjs(date).format('YYYY-MM-DD') },
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
    const createdBlock = {
      ...response.data,
      start: new Date(response.data.start),
      end: new Date(response.data.end),
      actualEnd: response.data.actualEnd ? new Date(response.data.actualEnd) : undefined,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
    };
    showSuccessToast('Time block created successfully!');
    return createdBlock;
  },

  async updateTimeBlock(id: string, updates: Partial<TimeBlock>): Promise<TimeBlock> {
    const payload = { ...updates };
    if (updates.start) payload.start = updates.start.toISOString() as any;
    if (updates.end) payload.end = updates.end.toISOString() as any;
    if (updates.actualEnd) payload.actualEnd = updates.actualEnd.toISOString() as any;

    const response = await api.patch<TimeBlock>(`/timeblocks/${id}`, payload);
    const updatedBlock = {
      ...response.data,
      start: new Date(response.data.start),
      end: new Date(response.data.end),
      actualEnd: response.data.actualEnd ? new Date(response.data.actualEnd) : undefined,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
    };
    showSuccessToast('Time block updated successfully!');
    return updatedBlock;
  },

  async deleteTimeBlock(id: string): Promise<void> {
    await api.delete(`/timeblocks/${id}`);
    showSuccessToast('Time block deleted successfully!');
  },
};