<template>
  <form @submit.prevent="handleSubmit" class="space-y-4 max-w-md">
    <div>
      <label class="block text-sm font-medium mb-1">Название категории</label>
      <input
        v-model="form.name"
        type="text"
        class="w-full p-2 border rounded"
        required
      />
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
        to="/categories"
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
    default: () => ({ name: '' })
  },
  onSubmit: {
    type: Function,
    required: true
  },
  isPending: {
    type: Boolean,
    default: false
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
