import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';

const API_URL = 'https://localhost:7252/api/tables';

export const TableService = {
  async getAllTables() {
    const { token } = useAuthStore.getState();
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async getTableById(id: number) {
    const { token } = useAuthStore.getState();
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async createTable(tableData: any) {
    const { token } = useAuthStore.getState();
    const response = await axios.post(API_URL, tableData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async updateTable(id: number, tableData: any) {
    const { token } = useAuthStore.getState();
    const response = await axios.put(`${API_URL}/${id}`, tableData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async toggleTableStatus(id: number) {
    const { token } = useAuthStore.getState();
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async getTableStatus(id: number) {
    const { token } = useAuthStore.getState();
    const response = await axios.get(`${API_URL}/${id}/status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async getTableHistory(tableId: number, fromDate?: string) {
    const { token } = useAuthStore.getState();
    const response = await axios.get(`${API_URL.replace('/tables', '/orders/table')}/${tableId}/history${fromDate ? `?fromDate=${fromDate}` : ''}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
  
};
