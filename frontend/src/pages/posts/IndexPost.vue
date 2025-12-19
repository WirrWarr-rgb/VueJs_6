<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Посты</h1>
      <router-link
        to="/posts/create"
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
      >
        Создать пост
      </router-link>
    </div>

    <!-- Поиск с debounce (ТРЕБОВАНИЕ) -->
    <div class="mb-6 max-w-md">
      <input
        v-model="searchInput"
        @input="handleSearch"
        type="text"
        placeholder="Поиск по названию поста..."
        class="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
      <p class="text-sm text-gray-500 mt-1">Поиск работает в реальном времени</p>
    </div>

    <!-- Таблица постов -->
    <DataTable
      v-if="!isLoading"
      :columns="columns"
      :data="posts"
    >
      <!-- Слот для изображения (ТРЕБОВАНИЕ) -->
      <template #image_url="{ value }">
        <img
          v-if="value"
          :src="value"
          alt="Изображение поста"
          class="w-16 h-16 object-cover rounded"
        />
        <span v-else class="text-gray-400 text-sm">Нет изображения</span>
      </template>

      <!-- Слот для названия с RouterLink (ТРЕБОВАНИЕ) -->
      <template #name="{ row }">
        <router-link
          :to="{ name: 'post-edit', params: { slug: row.slug } }"
          class="text-blue-500 hover:text-blue-700 hover:underline"
        >
          {{ row.name }}
        </router-link>
      </template>

      <!-- Слот для действий -->
      <template #actions="{ row }">
        <button
          @click="handleDelete(row.slug)"
          class="text-red-500 hover:text-red-700 hover:underline"
        >
          Удалить
        </button>
      </template>
    </DataTable>

    <!-- Состояния загрузки -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <p class="mt-2 text-gray-600">Загрузка постов{{ searchQuery ? ` (поиск: "${searchQuery}")` : '' }}...</p>
    </div>

    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      Ошибка загрузки: {{ error.message }}
    </div>

    <div v-if="!isLoading && posts.length === 0" class="text-center py-8 text-gray-500">
      {{ searchQuery ? 'Посты не найдены' : 'Постов пока нет' }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// import { ref, computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDebounceFn } from '@vueuse/core'
import { postsApi } from '@/api/posts'
import DataTable from '@/components/ui/DataTable.vue'

const searchQuery = ref('')
const searchInput = ref('')

// Debounce поиска через VueUse (ТРЕБОВАНИЕ - 500ms)
const handleSearch = useDebounceFn(() => {
  searchQuery.value = searchInput.value.trim()
}, 500)

// Получение постов через useQuery (ТРЕБОВАНИЕ)
const { data: posts, isLoading, error } = useQuery({
  queryKey: ['posts', searchQuery],
  queryFn: () => postsApi.getPosts(searchQuery.value).then(res => res.data),
  staleTime: 1000 * 60 // 1 минута кэша
})

const queryClient = useQueryClient()

// Удаление поста через useMutation (ТРЕБОВАНИЕ)
const { mutate: deletePost } = useMutation({
  mutationFn: (slug) => postsApi.deletePost(slug),
  onSuccess: () => {
    // Инвалидация кэша (ТРЕБОВАНИЕ)
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
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Название' },
  { key: 'image_url', label: 'Изображение' },
  { key: 'category_id', label: 'Категория ID' },
  { key: 'actions', label: 'Действия' }
]
</script>
