// все CRUD-операции для категорий

import apiClient from './axios'

export const categoriesApi = {
  getCategories() {
    return apiClient.get('/categories')
  },

  getCategory(id) {
    return apiClient.get(`/categories/${id}`)
  },

  createCategory(data) {
    return apiClient.post('/categories', data)
  },

  updateCategory(id, data) {
    return apiClient.put(`/categories/${id}`, data)
  },

  deleteCategory(id) {
    return apiClient.delete(`/categories/${id}`)
  }
}
