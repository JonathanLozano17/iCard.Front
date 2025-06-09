import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';

const API_URL = 'https://localhost:7252/api/orders';

export const OrderService = {
  getOrdersByTable: async (tableId: number) => {
    const { token } = useAuthStore.getState();
    const response = await axios.get(`${API_URL}/table/${tableId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getOrderById: async (id: number) => {
    const { token } = useAuthStore.getState();
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  createOrder: async (orderData: any) => {
    const { token } = useAuthStore.getState();
    console.log('data', orderData);
    
    const response = await axios.post(`${API_URL}`, orderData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  completeOrder: async (orderId: number) => {
    const { token } = useAuthStore.getState();
    const response = await axios.put(`${API_URL}/${orderId}/complete`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  processPayment: async (orderId: number, paymentDto: any) => {
    const { token } = useAuthStore.getState();
    const response = await axios.post(`${API_URL}/${orderId}/pay`, paymentDto, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getTableHistory: async (tableId: number) => {
    const { token } = useAuthStore.getState();
    const response = await axios.get(`${API_URL}/table/${tableId}/history`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
};
