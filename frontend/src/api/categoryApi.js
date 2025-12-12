// frontend/src/api/categoryApi.js
import axios from './axios';

const categoryApi = {
    // Lấy tất cả danh mục
    getAll: () => axios.get('/category'),
    
    // Lấy chi tiết danh mục
    getDetail: (id) => axios.get(`/category/${id}`),
    
    // Lấy sản phẩm theo danh mục với pagination
    getProducts: (id, page = 1, limit = 12) => 
        axios.get(`/category/${id}/products`, {
            params: { page, limit }
        }),
};

export default categoryApi;