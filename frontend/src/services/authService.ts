import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    timezone: string;
  };
  token: string;
  isDemo?: boolean;
}

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
  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  async login(data: LoginData): Promise<LoginResponse> {
    const response = await api.post('/api/auth/login', data);
    return response.data;
  },

  async loginDemo(): Promise<LoginResponse> {
    const response = await api.post('/api/auth/demo');
    return response.data;
  },

  async updatePushSubscription(subscription: PushSubscription, token: string): Promise<void> {
    await api.post('/api/auth/push-subscription', 
      { subscription },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
};