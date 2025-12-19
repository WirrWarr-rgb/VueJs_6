import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/posts'
    },
    // посты
    {
      path: '/posts',
      name: 'posts',
      component: () => import('@/pages/posts/IndexPost.vue')
    },
    {
      path: '/posts/create',
      name: 'post-create',
      component: () => import('@/pages/posts/CreatePost.vue')
    },
    {
      path: '/posts/:slug/edit',
      name: 'post-edit',
      component: () => import('@/pages/posts/EditPost.vue'),
      props: true
    },
    // категории
    {
      path: '/categories',
      name: 'categories',
      component: () => import('@/pages/categories/IndexCategory.vue')
    },
    {
      path: '/categories/create',
      name: 'category-create',
      component: () => import('@/pages/categories/CreateCategory.vue')
    },
    {
      path: '/categories/:id/edit',
      name: 'category-edit',
      component: () => import('@/pages/categories/EditCategory.vue'),
      props: true
    }
  ]
})

export default router
