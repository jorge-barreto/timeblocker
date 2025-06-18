import { api, showSuccessToast } from './api';
import { AuthResponse } from '../types';

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  timezone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    showSuccessToast('Account created successfully! Welcome to TimeBlocker!');
    return response.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    showSuccessToast('Welcome back!');
    return response.data;
  },

  async loginDemo(): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/demo');
    showSuccessToast('Welcome to the TimeBlocker demo!');
    return response.data;
  },

  async updatePushSubscription(subscription: PushSubscriptionJSON): Promise<void> {
    await api.post('/auth/push-subscription', { subscription });
  },
};