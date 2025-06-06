import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';

const API_URL = 'https://localhost:7252/api/auth';

export const AuthService = {
  async login(email: string, password: string) {
    console.log('login', email, password);
    
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
  },

  async register(name: string, email: string, password: string, role: string) {
    const response = await axios.post(`${API_URL}/register`, { name, email, password, role });
    return response.data;
  },

  async getUsers() {
    const { token } = useAuthStore.getState();
    const response = await axios.get(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};