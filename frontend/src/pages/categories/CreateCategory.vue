<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-md mx-auto">
      <h1 class="text-3xl font-bold mb-6">Создание категории</h1>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Название категории *</label>
          <input
            v-model="form.name"
            type="text"
            class="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
            :disabled="isPending"
          />
        </div>

        <div class="flex space-x-2 pt-4">
          <button
            type="submit"
            :disabled="isPending"
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
          >
            {{ isPending ? 'Создание...' : 'Создать' }}
          </button>

          <router-link
            to="/categories"
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
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { categoriesApi } from '@/api/categories'
import { ref } from 'vue'

const router = useRouter()
const queryClient = useQueryClient()
const submitError = ref('')

const form = ref({
  name: ''
})

// Создание категории через useMutation (ТРЕБОВАНИЕ)
const { mutate: createCategory, isPending } = useMutation({
  mutationFn: (data) => categoriesApi.createCategory(data),
  onSuccess: () => {
    // Инвалидация кэша (ТРЕБОВАНИЕ)
    queryClient.invalidateQueries({ queryKey: ['categories'] })
    router.push('/categories')
  },
  onError: (error) => {
    submitError.value = error.response?.data?.detail || 'Ошибка создания категории'
  }
})

const handleSubmit = () => {
  submitError.value = ''
  if (!form.value.name.trim()) {
    submitError.value = 'Введите название категории'
    return
  }

  createCategory(form.value)
}
</script>
