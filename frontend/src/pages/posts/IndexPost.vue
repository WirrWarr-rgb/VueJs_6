<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Посты</h1>
        <p class="mt-1 text-gray-600 dark:text-gray-400">
          Всего постов: {{ posts?.length || 0 }}
          <span v-if="searchQuery" class="text-blue-600 dark:text-blue-400">
            (найдено по запросу "{{ searchQuery }}")
          </span>
        </p>
      </div>
      <router-link
        to="/posts/create"
        class="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
      >
        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Создать пост
      </router-link>
    </div>

    <!-- поиск с debounce -->
    <div class="mb-6 max-w-md">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
        </div>
        <input
          v-model="searchInput"
          @input="handleSearch"
          type="text"
          placeholder="Поиск по названию поста..."
          class="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg
                 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/50
                 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 transition-colors"
        />
      </div>
      <p class="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
        Поиск работает в реальном времени с задержкой 500ms
      </p>
    </div>

    <!-- таблица постов -->
    <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <DataTable
        v-if="!isLoading"
        :columns="columns"
        :data="postsWithCategories"
      >
        <!-- слот для изображения -->
        <template #image_url="{ value }">
          <div class="flex justify-center">
            <img
              v-if="value"
              :src="value"
              alt="Изображение поста"
              class="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
            />
            <div v-else class="w-20 h-20 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <svg class="w-8 h-8 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </template>

        <!-- слот для названия с RouterLink -->
        <template #name="{ row }">
          <div>
            <router-link
              :to="{ name: 'post-edit', params: { slug: row.slug } }"
              class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium"
            >
              {{ row.name }}
            </router-link>
            <p v-if="row.content" class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {{ truncateContent(row.content, 60) }}
            </p>
          </div>
        </template>

        <!-- слот для категории -->
        <template #category="{ row }">
          <div class="flex items-center">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
              :class="getCategoryColor(row.category_id)">
              {{ getCategoryName(row.category_id) }}
            </span>
          </div>
        </template>

        <!-- слот для действий -->
        <template #actions="{ row }">
          <div class="flex space-x-2">
            <router-link
              :to="{ name: 'post-edit', params: { slug: row.slug } }"
              class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline text-sm"
              title="Редактировать"
            >
              Редактировать
            </router-link>
            <button
              @click="handleDelete(row.slug)"
              class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:underline text-sm"
              title="Удалить"
            >
              Удалить
            </button>
          </div>
        </template>
      </DataTable>

      <!-- состояния загрузки -->
      <div v-if="isLoading" class="py-12 text-center">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 dark:border-blue-500"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">
          Загрузка постов{{ searchQuery ? ` (поиск: "${searchQuery}")` : '' }}...
        </p>
      </div>

      <div v-if="error" class="p-6 border-t border-gray-200 dark:border-gray-700">
        <div class="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700 dark:text-red-300">
                Ошибка загрузки: {{ error.message }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!isLoading && posts.length === 0" class="py-12 text-center">
        <svg class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          {{ searchQuery ? 'Посты не найдены' : 'Постов пока нет' }}
        </h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
          {{ searchQuery
            ? 'Попробуйте изменить поисковый запрос'
            : 'Создайте свой первый пост, чтобы начать работу'
          }}
        </p>
        <router-link
          v-if="!searchQuery"
          to="/posts/create"
          class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Создать первый пост
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDebounceFn } from '@vueuse/core'
import { postsApi, categoriesApi } from '@/api/posts'
import DataTable from '@/components/ui/DataTable.vue'

const searchQuery = ref('')
const searchInput = ref('')

// debounce поиска
const handleSearch = useDebounceFn(() => {
  searchQuery.value = searchInput.value.trim()
}, 500)

// получение постов
const { data: posts, isLoading, error } = useQuery({
  queryKey: ['posts', searchQuery],
  queryFn: () => postsApi.getPosts(searchQuery.value).then(res => res.data),
  staleTime: 1000 * 60
})

// получение категорий
const { data: categories } = useQuery({
  queryKey: ['categories'],
  queryFn: () => categoriesApi.getCategories().then(res => res.data),
  staleTime: 1000 * 60
})

// объединяем посты с названиями категорий
const postsWithCategories = computed(() => {
  if (!posts.value || !categories.value) return []

  return posts.value.map(post => ({
    ...post,
    category_name: getCategoryName(post.category_id)
  }))
})

// функция для получения названия категории
const getCategoryName = (categoryId) => {
  if (!categories.value) return `Категория #${categoryId}`
  const category = categories.value.find(c => c.id === categoryId)
  return category ? category.name : `Категория #${categoryId}`
}

// функция для получения цвета категории
const getCategoryColor = (categoryId) => {
  const colors = [
    'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300',
    'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300'
  ]
  const index = (categoryId - 1) % colors.length
  return colors[index] || colors[0]
}

// функция для обрезки контента
const truncateContent = (text, maxLength) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const queryClient = useQueryClient()

// удаление поста
const { mutate: deletePost } = useMutation({
  mutationFn: (slug) => postsApi.deletePost(slug),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['posts'] })
  },
  onError: (error) => {
    alert(`Ошибка удаления: ${error.response?.data?.detail || error.message}`)
  }
})

const handleDelete = (slug) => {
  if (confirm('Вы уверены, что хотите удалить этот пост?')) {
    deletePost(slug)
  }
}

const columns = [
  { key: 'id', label: 'ID', width: '80px' },
  { key: 'name', label: 'Название поста' },
  { key: 'image_url', label: 'Изображение', width: '120px' },
  { key: 'category', label: 'Категория', width: '150px' },
  { key: 'actions', label: 'Действия', width: '150px' }
]
</script>
