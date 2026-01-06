// frontend/src/api/adminProductApi.js
import axios from '../axios';

const adminProductApi = {
  // Get all products for admin
  getAllProducts: (page = 1, limit = 20, search = '', extra = {}) => 
    axios.get('/admin/products', { params: { page, limit, search, ...extra } }),
  
  // Get product detail
  getProduct: (id) => axios.get(`/admin/products/${id}`),
  
  // Create product
  createProduct: (formData) => axios.post('/admin/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Update product
  updateProduct: (id, formData) => axios.put(`/admin/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Delete product
  deleteProduct: (id) => axios.delete(`/admin/products/${id}`),
  
  // Toggle product active status
  toggleProductStatus: (id) => axios.patch(`/admin/products/${id}/toggle-status`, {}, {
    headers: { 'Content-Type': 'application/json' }
  }),
  
  // Upload media to Cloudinary
  uploadMedia: (formData) => axios.post('/admin/products/upload-media', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Delete media from Cloudinary
  deleteMedia: (publicId) => axios.delete('/admin/products/delete-media', {
    data: { publicId }
  }),
};

export default adminProductApi;
