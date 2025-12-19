<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Категории</h1>
      <router-link
        to="/categories/create"
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
      >
        Создать категорию
      </router-link>
    </div>

    <!-- таблица категорий -->
    <DataTable
      v-if="!isLoading"
      :columns="columns"
      :data="categories"
    >
      <!-- слот для кнопки удаления -->
      <template #actions="{ row }">
        <div class="flex space-x-2">
          <router-link
            :to="`/categories/${row.id}/edit`"
            class="text-blue-500 hover:text-blue-700 hover:underline"
          >
            Редактировать
          </router-link>
          <button
            @click="handleDelete(row.id)"
            class="text-red-500 hover:text-red-700 hover:underline"
          >
            Удалить
          </button>
        </div>
      </template>
    </DataTable>

    <!-- состояния загрузки -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <p class="mt-2 text-gray-600">Загрузка категорий...</p>
    </div>

    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      Ошибка загрузки: {{ error.message }}
    </div>
  </div>
</template>

<script setup>
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { categoriesApi } from '@/api/categories'
import DataTable from '@/components/ui/DataTable.vue'

const queryClient = useQueryClient()

// загрузка категорий через useQuery
const { data: categories, isLoading, error } = useQuery({
  queryKey: ['categories'],
  queryFn: () => categoriesApi.getCategories().then(res => res.data),
  staleTime: 1000 * 60 // 1 минута кэша
})

// удаление категории через useMutation
const { mutate: deleteCategory } = useMutation({
  mutationFn: (id) => categoriesApi.deleteCategory(id),
  onSuccess: () => {
    // инвалидация кэша
    queryClient.invalidateQueries({ queryKey: ['categories'] })
  },
  onError: (error) => {
    alert(`Ошибка удаления: ${error.response?.data?.detail || error.message}`)
  }
})

const handleDelete = (id) => {
  if (confirm('Вы уверены, что хотите удалить эту категорию?')) {
    deleteCategory(id)
  }
}

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Название' },
  { key: 'actions', label: 'Действия' }
]
</script>
