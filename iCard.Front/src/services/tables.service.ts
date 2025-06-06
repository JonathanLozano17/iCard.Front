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

  async getTableByQrCode(qrCode: string) {
    const response = await axios.get(`${API_URL}/qr/${qrCode}`);
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

  async getQrCodeBase64(id: number) {
    const { token } = useAuthStore.getState();
    const response = await axios.get(`${API_URL}/${id}/qrcode`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.qrCodeImage;
  },

  async freeTable(tableId: number) {
    const { token } = useAuthStore.getState();
  
    const url = `${API_URL}/${tableId}/free`;
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const body = {}; // cuerpo vacío en este caso
  
    // Log para depuración
    console.log('PUT Request to:', url);
    console.log('Headers:', headers);
    console.log('Body:', body);
  
    const response = await axios.put(url, body, { headers });
    return response.data;
  }
  


}; 