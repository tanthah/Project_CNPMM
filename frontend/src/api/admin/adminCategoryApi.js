// frontend/src/api/adminCategoryApi.js
import axios from '../axios';

const adminCategoryApi = {
  // Get all categories
  getAllCategories: (page = 1, limit = 20) => 
    axios.get('/admin/categories', { params: { page, limit } }),
  
  // Get category detail
  getCategory: (id) => axios.get(`/admin/categories/${id}`),
  
  // Create category
  createCategory: (formData) => axios.post('/admin/categories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Update category
  updateCategory: (id, formData) => axios.put(`/admin/categories/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Delete category
  deleteCategory: (id) => axios.delete(`/admin/categories/${id}`),
  
  // Toggle category active status
  toggleCategoryStatus: (id) => axios.patch(`/admin/categories/${id}/toggle-status`, {}, {
    headers: { 'Content-Type': 'application/json' }
  }),
};

export default adminCategoryApi;
