<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Редактирование поста</h1>
        <button
          @click="handleDelete"
          class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
        >
          Удалить пост
        </button>
      </div>

      <!-- Состояния загрузки -->
      <div v-if="isPostLoading || isCategoriesLoading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p class="mt-2 text-gray-600">Загрузка данных...</p>
      </div>

      <!-- Форма редактирования -->
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
            Текущее изображение:
            <img v-if="form.image_url" :src="form.image_url" class="w-32 h-32 object-cover mt-2 rounded" />
          </p>
        </div>

        <div class="flex space-x-2 pt-4">
          <button
            type="submit"
            :disabled="isPending"
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
          >
            {{ isPending ? 'Сохранение...' : 'Сохранить изменения' }}
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { postsApi } from '@/api/posts'
import { categoriesApi } from '@/api/categories'
import { ref, watch } from 'vue'

const props = defineProps({
  slug: {
    type: String,
    required: true
  }
})

const router = useRouter()
const queryClient = useQueryClient()
const submitError = ref('')

const form = ref({
  name: '',
  content: '',
  image_url: '',
  category_id: ''
})

// Загрузка поста через useQuery (ТРЕБОВАНИЕ)
const { data: post, isLoading: isPostLoading } = useQuery({
  queryKey: ['post', props.slug],
  queryFn: () => postsApi.getPost(props.slug).then(res => res.data),
  enabled: !!props.slug
})

// Загрузка категорий
const { data: categories, isLoading: isCategoriesLoading } = useQuery({
  queryKey: ['categories'],
  queryFn: () => categoriesApi.getCategories().then(res => res.data)
})

// Наполняем форму при загрузке данных
watch(post, (newPost) => {
  if (newPost) {
    form.value = {
      name: newPost.name,
      content: newPost.content,
      image_url: newPost.image_url || '',
      category_id: newPost.category_id
    }
  }
})

// Обновление поста через useMutation (ТРЕБОВАНИЕ)
const { mutate: updatePost, isPending } = useMutation({
  mutationFn: (data) => postsApi.updatePost(props.slug, data),
  onSuccess: () => {
    // Refetch после обновления (ТРЕБОВАНИЕ)
    queryClient.invalidateQueries({ queryKey: ['post', props.slug] })
    queryClient.invalidateQueries({ queryKey: ['posts'] })
    submitError.value = ''
    alert('Пост успешно обновлен!')
  },
  onError: (error) => {
    submitError.value = error.response?.data?.detail || 'Ошибка обновления поста'
  }
})

// Удаление поста через useMutation (ТРЕБОВАНИЕ)
const { mutate: deletePostMutation } = useMutation({
  mutationFn: () => postsApi.deletePost(props.slug),
  onSuccess: () => {
    // После удаления - переход на список постов (ТРЕБОВАНИЕ)
    queryClient.invalidateQueries({ queryKey: ['posts'] })
    router.push('/posts')
  },
  onError: (error) => {
    alert(`Ошибка удаления: ${error.response?.data?.detail || error.message}`)
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

  updatePost(form.value)
}

const handleDelete = () => {
  if (confirm('Вы уверены, что хотите удалить этот пост? Это действие нельзя отменить.')) {
    deletePostMutation()
  }
}
</script>
