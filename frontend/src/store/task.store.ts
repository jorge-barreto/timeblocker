import { create } from 'zustand';
import { Task, TaskStatus } from '../types';
import { taskService } from '../services/task.service';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const tasks = await taskService.getTasks();
      set({ tasks, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createTask: async (taskData) => {
    const tempId = `temp-${Date.now()}`;
    const newTask: Task = {
      ...taskData,
      id: tempId,
      status: TaskStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      _syncStatus: 'pending',
    } as Task;

    // Optimistic update
    set(state => ({ tasks: [...state.tasks, newTask] }));

    try {
      const createdTask = await taskService.createTask(taskData);
      set(state => ({
        tasks: state.tasks.map(t => t.id === tempId ? createdTask : t)
      }));
      return createdTask;
    } catch (error: any) {
      // Remove optimistic update on error
      set(state => ({
        tasks: state.tasks.filter(t => t.id !== tempId),
        error: error.message
      }));
      throw error;
    }
  },

  updateTask: async (id, updates) => {
    // Optimistic update
    set(state => ({
      tasks: state.tasks.map(t => 
        t.id === id ? { ...t, ...updates, _syncStatus: 'pending' } : t
      )
    }));

    try {
      const updatedTask = await taskService.updateTask(id, updates);
      set(state => ({
        tasks: state.tasks.map(t => 
          t.id === id ? updatedTask : t
        )
      }));
    } catch (error: any) {
      // Revert optimistic update on error
      set(state => ({
        tasks: state.tasks.map(t => 
          t.id === id ? { ...t, _syncStatus: 'error' } : t
        ),
        error: error.message
      }));
      throw error;
    }
  },

  deleteTask: async (id) => {
    // Optimistic update
    set(state => ({
      tasks: state.tasks.filter(t => t.id !== id)
    }));

    try {
      await taskService.deleteTask(id);
    } catch (error: any) {
      // Revert optimistic update on error
      await get().fetchTasks();
      set({ error: error.message });
      throw error;
    }
  },
}));