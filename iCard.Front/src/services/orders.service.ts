import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';

const API_URL = 'https://localhost:7252/api/orders';

export const OrderService = {
  async getAllOrders(filters?: { startDate?: string, endDate?: string, status?: string }) {
    const { token } = useAuthStore.getState();
    const params = new URLSearchParams();
    
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.status) params.append('status', filters.status);

    const response = await axios.get(`${API_URL}?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async getOrdersByTable(tableId: number) {
    const { token } = useAuthStore.getState();
    const response = await axios.get(`${API_URL}/table/${tableId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async getOrderById(id: number) {
    const { token } = useAuthStore.getState();
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async createOrder(orderData: any) {
    const { token } = useAuthStore.getState();
    console.log('createOrder', orderData);
    const response = await axios.post(`${API_URL}`, orderData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async updateOrderStatus(id: number, status: string) {
    const { token } = useAuthStore.getState();
    const response = await axios.put(`${API_URL}/${id}/status`, { status }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async updateOrderPayment(id: number, paymentData: any) {
    const { token } = useAuthStore.getState();
    console.log('updateOrderPayment', id, paymentData);
    const response = await axios.put(`${API_URL}/${id}/payment`, paymentData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async cancelOrder(id: number) {
    const { token } = useAuthStore.getState();
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },


  async closeAccount(tableId: number, data: {
    paymentMethod: string;
    totalAmount: number;
  }) {
    const { token } = useAuthStore.getState();
    const response = await axios.post(`${API_URL}/table/${tableId}/close`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }
  

};


