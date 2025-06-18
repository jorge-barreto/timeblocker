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