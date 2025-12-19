import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { postsApi, categoriesApi } from '@/api'

export function usePostForm(slug = null) {
  const router = useRouter()

  const form = ref({
    name: '',
    content: '',
    image_url: '',
    category_id: ''
  })

  const submitError = ref('')
  const isSubmitting = ref(false)

  // Загрузка категорий
  const {
    data: categories,
    isLoading: isCategoriesLoading
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getCategories().then(res => res.data)
  })

  // Загрузка поста (только для редактирования)
  const {
    data: post,
    isLoading: isPostLoading,
    isError: isPostError
  } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => postsApi.getPost(slug).then(res => res.data),
    enabled: !!slug, // Только если передан slug
    staleTime: 1000 * 60 // 1 минута кэша
  })

  // Наполняем форму данными поста при загрузке
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

  const isLoading = ref(false)
  watch([isPostLoading, isCategoriesLoading], (values) => {
    isLoading.value = values.some(v => v)
  })

  // Функция для сброса формы
  const resetForm = () => {
    form.value = {
      name: '',
      content: '',
      image_url: '',
      category_id: ''
    }
    submitError.value = ''
  }

  // Функция для отмены
  const handleCancel = () => {
    router.push('/posts')
  }

  return {
    form,
    categories,
    isCategoriesLoading,
    isPostLoading,
    isPostError,
    isLoading,
    isSubmitting,
    submitError,
    resetForm,
    handleCancel
  }
}
