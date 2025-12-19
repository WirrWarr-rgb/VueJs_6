import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { postsApi, categoriesApi } from '@/api/posts'

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
    queryFn: () => categoriesApi.getCategories().then(res => res.data),
    staleTime: 1000 * 60
  })

  // Загрузка поста (только для редактирования)
  const {
    data: post,
    isLoading: isPostLoading,
    isError: isPostError
  } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => postsApi.getPost(slug).then(res => {
      console.log('Post data loaded:', res.data) // Логирование
      return res.data
    }),
    enabled: !!slug, // Только если передан slug
    staleTime: 1000 * 60,
    onSuccess: (data) => {
      // Наполняем форму сразу при успешной загрузке
      if (data) {
        form.value = {
          name: data.name || '',
          content: data.content || '',
          image_url: data.image_url || '',
          category_id: data.category_id || ''
        }
        console.log('Form filled with data:', form.value) // Логирование
      }
    }
  })

  // Дублируем watch для надежности
  watch(post, (newPost) => {
    if (newPost) {
      form.value = {
        name: newPost.name || '',
        content: newPost.content || '',
        image_url: newPost.image_url || '',
        category_id: newPost.category_id || ''
      }
      console.log('Watch triggered, form updated:', form.value)
    }
  }, { immediate: true })

  const isLoading = computed(() => isPostLoading.value || isCategoriesLoading.value)

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
    post,
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
