import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';

const API_URL = 'https://localhost:7252/api/categories';

export const CategoryService = {
  async getActiveCategories() {
    const response = await axios.get(`${API_URL}`);
    return response.data;
  },

  async getAllCategories() {
    const { token } = useAuthStore.getState();
    const response = await axios.get(`${API_URL}/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async getCategoryById(id: number) {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  async createCategory(categoryData: any) {
    const { token } = useAuthStore.getState();
    console.log('createCategory', categoryData);
    const response = await axios.post(`${API_URL}`, categoryData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async updateCategory(id: number, categoryData: any) {
    const { token } = useAuthStore.getState();
    const response = await axios.put(`${API_URL}/${id}`, categoryData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async toggleCategoryStatus(id: number) {
    const { token } = useAuthStore.getState();
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};