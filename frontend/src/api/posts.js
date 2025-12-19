import apiClient from './axios'

export const postsApi = {
  getPosts(search = '') {
    const params = search ? { search } : {}
    return apiClient.get('/posts', { params })
  },

  getPost(slug) {
    return apiClient.get(`/posts/${slug}`)
  },

  createPost(data) {
    return apiClient.post('/posts', data)
  },

  updatePost(slug, data) {
    return apiClient.put(`/posts/${slug}`, data)
  },

  deletePost(slug) {
    return apiClient.delete(`/posts/${slug}`)
  }
}

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
