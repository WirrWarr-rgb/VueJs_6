// composables/useCategoryForm.js
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { categoriesApi } from '@/api/categories'

export function useCategoryForm(id = null) {
  const router = useRouter()

  const form = ref({
    name: ''
  })

  const submitError = ref('')
  const isSubmitting = ref(false)

  // загрузка категории (только для редактирования)
  const {
    data: category,
    isLoading: isCategoryLoading,
    isError: isCategoryError
  } = useQuery({
    queryKey: ['category', id],
    queryFn: () => categoriesApi.getCategory(id).then(res => {
      if (!res.data) {
        throw new Error('Категория не найдена')
      }
      return res.data
    }),
    enabled: !!id,
    staleTime: 1000 * 60,
    onSuccess: (data) => {
      if (data) {
        form.value = {
          name: data.name || ''
        }
      }
    }
  })

  // дублируем watch для надежности
  watch(category, (newCategory) => {
    if (newCategory) {
      form.value = {
        name: newCategory.name || ''
      }
    }
  }, { immediate: true })

  // функция для сброса формы
  const resetForm = () => {
    form.value = {
      name: ''
    }
    submitError.value = ''
  }

  // функция для отмены
  const handleCancel = () => {
    router.push('/categories')
  }

  return {
    form,
    category,
    isLoading: computed(() => isCategoryLoading.value),
    isError: computed(() => isCategoryError.value),
    isSubmitting,
    submitError,
    resetForm,
    handleCancel
  }
}
