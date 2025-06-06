import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';

const API_URL = 'https://localhost:7252/api/stock-history';

export const StockHistoryService = {
  async getProductStockHistory(productId: number) {
    const { token } = useAuthStore.getState();
    const response = await axios.get(`${API_URL}/product/${productId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};