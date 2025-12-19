<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-md mx-auto">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Редактирование категории</h1>
      </div>

      <!-- состояния загрузки -->
      <div v-if="isLoading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 dark:border-blue-400"></div>
        <p class="mt-2 text-gray-600 dark:text-gray-400">Загрузка категории...</p>
      </div>

      <!-- форма редактирования -->
      <div v-else-if="category">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
              Название категории *
            </label>
            <input
              v-model="form.name"
              type="text"
              class="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
              :disabled="formIsSubmitting"
            />
          </div>

          <!-- ошибка -->
          <div v-if="submitError" class="bg-red-50 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
            Ошибка: {{ submitError }}
          </div>

          <div class="flex space-x-2 pt-4">
            <button
              type="submit"
              :disabled="formIsSubmitting"
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
            >
              {{ formIsSubmitting ? 'Сохранение...' : 'Сохранить' }}
            </button>

            <button
              type="button"
              @click="$router.push('/categories')"
              :disabled="formIsSubmitting"
              class="bg-gray-300 hover:bg-gray-400 text-gray-800 dark:text-gray-200 px-4 py-2 rounded transition-colors"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>

      <!-- ошибка загрузки -->
      <div v-else class="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-lg font-medium text-red-800 dark:text-red-300">Категория не найдена</h3>
            <p class="mt-1 text-sm text-red-700 dark:text-red-400">
              Категория с ID {{ id }} не существует.
            </p>
            <div class="mt-3">
              <router-link
                to="/categories"
                class="inline-flex items-center text-sm px-3 py-1.5 border border-transparent rounded-md text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-300 dark:bg-red-900/30 dark:hover:bg-red-900/50"
              >
                Вернуться к списку
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { categoriesApi } from '@/api/categories'
import { useCategoryForm } from '@/composables/useCategoryForm'

const props = defineProps({
  id: {
    type: [String, Number],
    required: true
  }
})

const router = useRouter()
const queryClient = useQueryClient()

// используем композейбл
const {
  form,
  category,
  isLoading,
  isSubmitting: formIsSubmitting,
  submitError,
} = useCategoryForm(props.id)

// мутация для обновления категории
const { mutate: updateCategory } = useMutation({
  mutationFn: (data) => categoriesApi.updateCategory(props.id, data),
  onMutate: () => {
    formIsSubmitting.value = true
  },
  onSuccess: () => {
    // Инвалидируем кэши
    queryClient.invalidateQueries({ queryKey: ['categories'] })
    queryClient.invalidateQueries({ queryKey: ['category', props.id] })

    // Перенаправляем
    router.push('/categories')
  },
  onError: (error) => {
    submitError.value = error.response?.data?.detail || 'Ошибка обновления категории'
  },
  onSettled: () => {
    formIsSubmitting.value = false
  }
})

// Функция обработки отправки формы
const handleSubmit = () => {
  if (!form.value.name.trim()) {
    submitError.value = 'Введите название категории'
    return
  }

  updateCategory(form.value)
}
</script>
