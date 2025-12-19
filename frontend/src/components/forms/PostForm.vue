<template>
  <form @submit.prevent="handleSubmit" class="space-y-4 max-w-2xl">
    <div>
      <label class="block text-sm font-medium mb-1">Название поста *</label>
      <input
        v-model="form.name"
        type="text"
        class="w-full p-2 border rounded"
        required
      />
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Категория *</label>
      <select
        v-model="form.category_id"
        class="w-full p-2 border rounded"
        required
      >
        <option value="">Выберите категорию</option>
        <option v-for="category in categories" :key="category.id" :value="category.id">
          {{ category.name }}
        </option>
      </select>
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Содержание *</label>
      <textarea
        v-model="form.content"
        class="w-full p-2 border rounded h-40"
        required
      ></textarea>
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">URL изображения</label>
      <input
        v-model="form.image_url"
        type="url"
        class="w-full p-2 border rounded"
        placeholder="https://example.com/image.jpg"
      />
      <p class="text-sm text-gray-500 mt-1">Можно использовать: https://picsum.photos/600/400</p>
    </div>

    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {{ error }}
    </div>

    <div class="flex space-x-2">
      <button
        type="submit"
        :disabled="isPending"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {{ isPending ? 'Сохранение...' : 'Сохранить' }}
      </button>

      <router-link
        to="/posts"
        class="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
      >
        Отмена
      </router-link>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({
      name: '',
      content: '',
      image_url: '',
      category_id: ''
    })
  },
  onSubmit: {
    type: Function,
    required: true
  },
  isPending: {
    type: Boolean,
    default: false
  },
  categories: {
    type: Array,
    required: true
  },
  error: {
    type: String,
    default: ''
  }
})

const form = ref({ ...props.initialData })

watch(() => props.initialData, (newVal) => {
  form.value = { ...newVal }
}, { deep: true })

const handleSubmit = () => {
  props.onSubmit(form.value)
}
</script>
