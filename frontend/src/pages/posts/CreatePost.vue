<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold mb-6">Создание поста</h1>

      <!-- Загрузка категорий -->
      <div v-if="isCategoriesLoading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p class="mt-2 text-gray-600">Загрузка категорий...</p>
      </div>

      <!-- Форма создания -->
      <form v-else @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Название поста *</label>
          <input
            v-model="form.name"
            type="text"
            class="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
            :disabled="isPending"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Категория *</label>
          <select
            v-model="form.category_id"
            class="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
            :disabled="isPending"
          >
            <option value="">Выберите категорию</option>
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }} (ID: {{ category.id }})
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Содержание *</label>
          <textarea
            v-model="form.content"
            class="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-40"
            required
            :disabled="isPending"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">URL изображения</label>
          <input
            v-model="form.image_url"
            type="url"
            class="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="https://example.com/image.jpg"
            :disabled="isPending"
          />
          <p class="text-sm text-gray-500 mt-1">
            Можно использовать: https://picsum.photos/600/400
          </p>
        </div>

        <div class="flex space-x-2 pt-4">
          <button
            type="submit"
            :disabled="isPending"
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
          >
            {{ isPending ? 'Создание...' : 'Создать пост' }}
          </button>

          <router-link
            to="/posts"
            class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded transition-colors"
          >
            Отмена
          </router-link>
        </div>

        <div v-if="submitError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Ошибка: {{ submitError }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { useQuery, useMutation } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { postsApi, categoriesApi } from '@/api'
import { ref } from 'vue'

const router = useRouter()
const submitError = ref('')

const form = ref({
  name: '',
  content: '',
  image_url: '',
  category_id: ''
})

// Загрузка категорий через useQuery (ТРЕБОВАНИЕ)
const { data: categories, isLoading: isCategoriesLoading } = useQuery({
  queryKey: ['categories'],
  queryFn: () => categoriesApi.getCategories().then(res => res.data)
})

// Создание поста через useMutation (ТРЕБОВАНИЕ)
const { mutate: createPost, isPending } = useMutation({
  mutationFn: (data) => postsApi.createPost(data),
  onSuccess: (response) => {
    // После успеха - переход на созданный пост (ТРЕБОВАНИЕ)
    const slug = response.data.slug
    router.push(`/posts/${slug}/edit`)
  },
  onError: (error) => {
    // Обработка ошибок (ТРЕБОВАНИЕ)
    submitError.value = error.response?.data?.detail || 'Ошибка создания поста'
  }
})

const handleSubmit = () => {
  submitError.value = ''

  // Валидация
  if (!form.value.name.trim()) {
    submitError.value = 'Введите название поста'
    return
  }
  if (!form.value.content.trim()) {
    submitError.value = 'Введите содержание поста'
    return
  }
  if (!form.value.category_id) {
    submitError.value = 'Выберите категорию'
    return
  }

  createPost(form.value)
}
</script>
