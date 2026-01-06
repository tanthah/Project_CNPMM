// frontend/src/api/commentApi.js
import axios from './axios'

const commentApi = {
  getProductComments: (productId, page = 1, limit = 10) =>
    axios.get(`/comments/product/${productId}`, { params: { page, limit } }),

  createComment: (data) => axios.post('/comments/create', data),

  toggleLike: (commentId) => axios.put(`/comments/${commentId}/like`),

  deleteComment: (commentId) => axios.delete(`/comments/${commentId}`)
}

export default commentApi

