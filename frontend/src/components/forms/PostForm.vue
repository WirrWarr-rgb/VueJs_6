<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div>
      <label class="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
        Название поста <span class="text-red-500">*</span>
      </label>
      <input
        v-model="form.name"
        type="text"
        :disabled="isPending || isSubmitting"
        :class="[
          'w-full p-3 border rounded-lg transition-colors',
          'dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100',
          'dark:placeholder-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/50',
          errorFields.name
            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-500'
            : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
        ]"
        placeholder="Введите название поста"
      />
      <div v-if="errorFields.name" class="mt-1 text-sm text-red-600 dark:text-red-400">
        {{ errorFields.name }}
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
        Категория <span class="text-red-500">*</span>
      </label>
      <select
        v-model="form.category_id"
        :disabled="isPending || isSubmitting || isLoadingCategories"
        :class="[
          'w-full p-3 border rounded-lg transition-colors',
          'dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100',
          'dark:focus:border-blue-500 dark:focus:ring-blue-500/50',
          errorFields.category_id
            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-500'
            : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
        ]"
      >
        <option value="" class="dark:bg-gray-800 dark:text-gray-100">Выберите категорию</option>
        <option
          v-for="category in categories"
          :key="category.id"
          :value="category.id"
          class="dark:bg-gray-800 dark:text-gray-100"
        >
          {{ category.name }} (ID: {{ category.id }})
        </option>
      </select>
      <div v-if="errorFields.category_id" class="mt-1 text-sm text-red-600 dark:text-red-400">
        {{ errorFields.category_id }}
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
        Содержание <span class="text-red-500">*</span>
      </label>
      <textarea
        v-model="form.content"
        :disabled="isPending || isSubmitting"
        :class="[
          'w-full p-3 border rounded-lg transition-colors min-h-[200px]',
          'dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100',
          'dark:placeholder-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/50',
          errorFields.content
            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-500'
            : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
        ]"
        placeholder="Напишите содержание поста..."
      ></textarea>
      <div v-if="errorFields.content" class="mt-1 text-sm text-red-600 dark:text-red-400">
        {{ errorFields.content }}
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
        URL изображения
      </label>
      <input
        v-model="form.image_url"
        type="url"
        :disabled="isPending || isSubmitting"
        :class="[
          'w-full p-3 border rounded-lg transition-colors',
          'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
          'dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100',
          'dark:placeholder-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/50'
        ]"
        placeholder="https://example.com/image.jpg"
      />
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Подсказка: можно использовать
        <code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-gray-800 dark:text-gray-300">
          https://picsum.photos/600/400
        </code>
      </p>

      <!-- Предпросмотр изображения -->
      <div v-if="form.image_url" class="mt-4">
        <p class="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">Предпросмотр:</p>
        <img
          :src="form.image_url"
          alt="Предпросмотр изображения"
          class="max-w-full h-auto max-h-64 rounded-lg border border-gray-200 dark:border-gray-700"
          @error="handleImageError"
        />
      </div>
    </div>

    <!-- Общие ошибки -->
    <div v-if="submitError"
      :class="[
        'border-l-4 p-4',
        'bg-red-50 border-red-500 dark:bg-red-900/20 dark:border-red-500'
      ]"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700 dark:text-red-300">{{ submitError }}</p>
        </div>
      </div>
    </div>

    <!-- Кнопки -->
    <div class="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
      <div class="text-sm text-gray-500 dark:text-gray-400">
        <span v-if="isSubmitting" class="flex items-center">
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Сохранение...
        </span>
      </div>

      <div class="flex space-x-3">
        <button
          type="button"
          @click="handleCancel"
          :disabled="isSubmitting"
          :class="[
            'px-5 py-2.5 border rounded-lg transition-colors',
            'border-gray-300 text-gray-700 hover:bg-gray-50',
            'dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500',
            'dark:focus:ring-offset-gray-900 disabled:opacity-50'
          ]"
        >
          Отмена
        </button>

        <button
          type="submit"
          :disabled="isPending || isSubmitting || isLoadingCategories"
          :class="[
            'px-5 py-2.5 rounded-lg transition-colors flex items-center',
            'bg-blue-600 text-white hover:bg-blue-700',
            'dark:bg-blue-700 dark:hover:bg-blue-600',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
            'dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
          ]"
        >
          <span v-if="isSubmitting" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white dark:text-gray-100" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Сохранение...
          </span>
          <span v-else>{{ submitButtonText }}</span>
        </button>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  // Данные формы
  initialData: {
    type: Object,
    default: () => ({
      name: '',
      content: '',
      image_url: '',
      category_id: ''
    })
  },

  // Категории для select
  categories: {
    type: Array,
    default: () => []
  },

  // Состояния загрузки
  isLoadingCategories: {
    type: Boolean,
    default: false
  },
  isPending: {
    type: Boolean,
    default: false
  },
  isSubmitting: {
    type: Boolean,
    default: false
  },

  // Ошибки
  submitError: {
    type: String,
    default: ''
  },

  // Текст кнопки отправки
  submitButtonText: {
    type: String,
    default: 'Сохранить'
  },

  // Режим (create/edit)
  mode: {
    type: String,
    default: 'create',
    validator: (value) => ['create', 'edit'].includes(value)
  }
})

const emit = defineEmits(['submit', 'cancel'])

const form = ref({ ...props.initialData })
const errorFields = ref({
  name: '',
  content: '',
  category_id: ''
})

// Наблюдаем за изменениями initialData
watch(() => props.initialData, (newData) => {
  form.value = { ...newData }
}, { deep: true })

// Валидация формы
const validateForm = () => {
  let isValid = true
  errorFields.value = { name: '', content: '', category_id: '' }

  if (!form.value.name.trim()) {
    errorFields.value.name = 'Введите название поста'
    isValid = false
  }

  if (!form.value.content.trim()) {
    errorFields.value.content = 'Введите содержание поста'
    isValid = false
  }

  if (!form.value.category_id) {
    errorFields.value.category_id = 'Выберите категорию'
    isValid = false
  }

  return isValid
}

// Обработка отправки формы
const handleSubmit = () => {
  if (validateForm()) {
    emit('submit', form.value)
  }
}

// Обработка отмены
const handleCancel = () => {
  emit('cancel')
}

// Обработка ошибки загрузки изображения
const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/600x400?text=Изображение+не+загружено'
}
</script>
