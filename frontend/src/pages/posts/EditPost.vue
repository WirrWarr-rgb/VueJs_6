<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold">Редактирование поста</h1>
        </div>
        <button
          @click="handleDelete"
          class="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors flex items-center"
        >
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          Удалить пост
        </button>
      </div>

      <!-- состояния загрузки -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p class="mt-4 text-gray-600">Загрузка данных...</p>
      </div>

      <!-- ошибка загрузки -->
      <div v-else-if="isPostError" class="bg-red-50 border-l-4 border-red-500 p-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-8 w-8 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-red-800">Пост не найден</h3>
            <div class="mt-2 text-red-700">
              <p>Пост с slug "{{ slug }}" не существует.</p>
            </div>
            <div class="mt-4">
              <router-link
                to="/posts"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Вернуться к списку постов
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- форма -->
      <PostForm
        v-else
        :initial-data="form"
        :categories="categories"
        :is-loading-categories="isCategoriesLoading"
        :is-submitting="isSubmitting"
        :submit-error="submitError"
        submit-button-text="Сохранить изменения"
        mode="edit"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>

<script setup>
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { postsApi } from '@/api/posts'
import { usePostForm } from '@/composables/usePostForm'
import PostForm from '@/components/forms/PostForm.vue'

const props = defineProps({
  slug: {
    type: String,
    required: true
  }
})

const router = useRouter()
const queryClient = useQueryClient()

// используем композейбл с передачей slug
const {
  form,
  categories,
  isCategoriesLoading,
  isPostError,
  isLoading,
  isSubmitting: formIsSubmitting,
  submitError,
  handleCancel
} = usePostForm(props.slug)

// мутация для обновления поста - ИСПРАВЛЕННАЯ ВЕРСИЯ
const { mutate: updatePost } = useMutation({
  mutationFn: (data) => postsApi.updatePost(props.slug, data),
  onMutate: () => {
    formIsSubmitting.value = true
    submitError.value = ''
  },
  onSuccess: (response) => {
    try {
      // Получаем обновленный пост из ответа
      const updatedPost = response.data

      if (!updatedPost || !updatedPost.slug) {
        throw new Error('Неверный формат ответа от сервера')
      }

      const newSlug = updatedPost.slug
      const oldSlug = props.slug

      console.log(`Пост обновлен! Старый slug: ${oldSlug}, новый slug: ${newSlug}`)

      // Удаляем кэш со старым slug
      queryClient.removeQueries({ queryKey: ['post', oldSlug] })

      // Инвалидируем кэш постов
      queryClient.invalidateQueries({ queryKey: ['posts'] })

      // Если slug изменился, обновляем URL
      if (newSlug !== oldSlug) {
        console.log(`Slug изменился с "${oldSlug}" на "${newSlug}", обновляем URL...`)

        // Небольшая задержка для корректного обновления
        setTimeout(() => {
          router.replace({
            name: 'post-edit',
            params: { slug: newSlug }
          })
        }, 100)
      }

      showSuccessNotification('Пост успешно обновлен!')

    } catch (error) {
      console.error('Ошибка обработки ответа:', error)
      // В случае ошибки все равно инвалидируем кэш
      queryClient.invalidateQueries({ queryKey: ['post', props.slug] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    }
  },
  onError: (error) => {
    console.error('Ошибка обновления поста:', error)

    if (error.response) {
      if (error.response.status === 404) {
        submitError.value = 'Пост не найден. Возможно, он был удален.'
      } else if (error.response.status === 400) {
        submitError.value = error.response.data?.detail || 'Некорректные данные'
      } else {
        submitError.value = error.response.data?.detail || 'Ошибка обновления поста'
      }
    } else if (error.request) {
      submitError.value = 'Нет ответа от сервера. Проверьте подключение.'
    } else {
      submitError.value = 'Неизвестная ошибка'
    }
  },
  onSettled: () => {
    formIsSubmitting.value = false
  }
})

const showSuccessNotification = (message) => {
  console.log(message)
}

// мутация для удаления поста
const { mutate: deletePostMutation } = useMutation({
  mutationFn: () => postsApi.deletePost(props.slug),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['posts'] })
    router.push('/posts')
  },
  onError: (error) => {
    alert(`Ошибка удаления: ${error.response?.data?.detail || error.message}`)
  }
})

const handleSubmit = (formData) => {
  updatePost(formData)
}

const handleDelete = () => {
  if (confirm('Вы уверены, что хотите удалить этот пост? Это действие нельзя отменить.')) {
    deletePostMutation()
  }
}
</script>
