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
