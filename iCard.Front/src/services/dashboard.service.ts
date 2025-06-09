// src/services/dashboard.service.ts
import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';

const API_URL = 'https://localhost:7252/api/dashboard';

export const DashboardService = {
  async getSummary() {
    const { token } = useAuthStore.getState();
    const response = await axios.get(`${API_URL}/summary`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async getSalesReport(startDate: Date, endDate: Date) {
    const { token } = useAuthStore.getState();
    const response = await axios.get(`${API_URL}/sales`, {
      params: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async getTopProducts(top: number = 5, startDate?: Date, endDate?: Date) {
    const { token } = useAuthStore.getState();
    const params: any = { top };
    
    if (startDate) params.startDate = startDate.toISOString().split('T')[0];
    if (endDate) params.endDate = endDate.toISOString().split('T')[0];

    const response = await axios.get(`${API_URL}/top-products`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};