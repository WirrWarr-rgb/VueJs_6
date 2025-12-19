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

  // загрузка категорий
  const {
    data: categories,
    isLoading: isCategoriesLoading
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getCategories().then(res => res.data),
    staleTime: 1000 * 60
  })

  // загрузка поста (только для редактирования)
  const {
    data: post,
    isLoading: isPostLoading,
    isError: isPostError
  } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => postsApi.getPost(slug).then(res => {
      return res.data
    }),
    enabled: !!slug,
    staleTime: 1000 * 60,
    onSuccess: (data) => {
      // наполняем форму сразу при успешной загрузке
      if (data) {
        form.value = {
          name: data.name || '',
          content: data.content || '',
          image_url: data.image_url || '',
          category_id: data.category_id || ''
        }
      }
    }
  })

  // дублируем watch для надежности
  watch(post, (newPost) => {
    if (newPost) {
      form.value = {
        name: newPost.name || '',
        content: newPost.content || '',
        image_url: newPost.image_url || '',
        category_id: newPost.category_id || ''
      }
    }
  }, { immediate: true })

  const isLoading = computed(() => isPostLoading.value || isCategoriesLoading.value)

  // функция для сброса формы
  const resetForm = () => {
    form.value = {
      name: '',
      content: '',
      image_url: '',
      category_id: ''
    }
    submitError.value = ''
  }

  // функция для отмены
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
