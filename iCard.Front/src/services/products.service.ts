import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';

const API_URL = 'https://localhost:7252/api/products';

export const ProductService = {
  async getActiveProducts() {
    const response = await axios.get(`${API_URL}`);
    console.log('getActiveProducts', response.data);
    return response.data;
  },

  async getAllProducts() {
    const { token } = useAuthStore.getState();
    const response = await axios.get(`${API_URL}/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async getProductsByCategory(categoryId: number) {
    const response = await axios.get(`${API_URL}/category/${categoryId}`);
    return response.data;
  },

  async getProductById(id: number) {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  async createProduct(productData: any) {
    const { token } = useAuthStore.getState();
    console.log('createProduct', productData);
    const response = await axios.post(`${API_URL}`, productData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async updateProduct(id: number, productData: any) {
    const { token } = useAuthStore.getState();
    const response = await axios.put(`${API_URL}/${id}`, productData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async updateStock(id: number, stockData: { quantity: number; notes?: string }) {
    const { token } = useAuthStore.getState();
    const response = await axios.put(`${API_URL}/${id}/stock`, stockData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async toggleProductStatus(id: number) {
    const { token } = useAuthStore.getState();
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async recordStockChange(
    productId: number,
    previousStock: number,
    newStock: number,
    changeType: string,
    notes?: string
  ) {
    const { token } = useAuthStore.getState();
    const response = await axios.post(
      `${API_URL}/stock-history`,
      {
        productId,
        previousStock,
        newStock,
        changeType,
        notes,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },
};
 