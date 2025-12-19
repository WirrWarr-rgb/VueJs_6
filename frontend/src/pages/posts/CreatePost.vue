<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Создание нового поста</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">Заполните форму ниже, чтобы создать новый пост</p>
      </div>

      <!-- Состояние загрузки категорий -->
      <div v-if="isCategoriesLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">Загрузка категорий...</p>
      </div>

      <!-- Форма -->
      <PostForm
        v-else
        :initial-data="form"
        :categories="categories"
        :is-loading-categories="isCategoriesLoading"
        :is-submitting="isSubmitting"
        :submit-error="submitError"
        submit-button-text="Создать пост"
        mode="create"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />

      <!-- Уведомление об успешном создании -->
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="transform opacity-0 translate-y-2"
        enter-to-class="transform opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="transform opacity-100 translate-y-0"
        leave-to-class="transform opacity-0 translate-y-2"
      >
        <div
          v-if="showSuccessNotification"
          class="fixed bottom-4 right-4 max-w-sm bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg shadow-lg p-4"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-green-800 dark:text-green-300">
                Пост успешно создан!
              </p>
              <p class="text-xs text-green-700 dark:text-green-400 mt-1">
                Переходим к списку постов...
              </p>
            </div>
            <div class="ml-auto pl-3">
              <button
                @click="showSuccessNotification = false"
                class="text-green-400 hover:text-green-600 dark:hover:text-green-300"
              >
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { postsApi } from '@/api/posts'
import { usePostForm } from '@/composables/usePostForm'
import PostForm from '@/components/forms/PostForm.vue'

const router = useRouter()
const queryClient = useQueryClient()

// Используем композейбл
const {
  form,
  categories,
  isCategoriesLoading,
  isSubmitting: formIsSubmitting,
  submitError,
  handleCancel: formHandleCancel
} = usePostForm() // ← Убрали resetForm

const showSuccessNotification = ref(false)

// Мутация для создания поста
const { mutate: createPost } = useMutation({
  mutationFn: (data) => postsApi.createPost(data),
  onMutate: () => {
    formIsSubmitting.value = true
    submitError.value = ''
  },
  onSuccess: () => {
    // Показываем уведомление об успехе
    showSuccessNotification.value = true

    // Инвалидируем кэш постов
    queryClient.invalidateQueries({ queryKey: ['posts'] })

    // Через 1.5 секунды переходим к списку постов
    setTimeout(() => {
      router.push('/posts')
    }, 1500)
  },
  onError: (error) => {
    submitError.value = error.response?.data?.detail || 'Ошибка создания поста'
    console.error('Ошибка создания поста:', error)
  },
  onSettled: () => {
    formIsSubmitting.value = false
  }
})

const handleSubmit = (formData) => {
  createPost(formData)
}

const handleCancel = () => {
  formHandleCancel()
  router.push('/posts')
}
</script>
