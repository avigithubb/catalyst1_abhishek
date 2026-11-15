import { ApiClient } from './client';
import { AuthResponse, User } from '@elderly-care/shared-types';

export const authApi = {
  login: async (credentials: { email: string; password?: string; passcode?: string }): Promise<AuthResponse> => {
    const data = await ApiClient.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    ApiClient.setToken(data.token);
    return data;
  },

  register: async (payload: { name: string; email: string; password?: string; passcode?: string; role: string }): Promise<AuthResponse> => {
    const data = await ApiClient.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    ApiClient.setToken(data.token);
    return data;
  },

  getProfile: async (): Promise<User> => {
    return ApiClient.request<User>('/auth/me');
  },

  logout: () => {
    ApiClient.setToken(null);
  }
};
