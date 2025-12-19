<template>
  <div :class="isDarkMode ? 'dark' : ''">
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <nav class="bg-white dark:bg-gray-800 shadow">
        <div class="container mx-auto px-4">
          <div class="flex justify-between h-16 items-center">
            <div class="flex space-x-8">
              <router-link
                to="/posts"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium
                       hover:text-blue-600 dark:hover:text-blue-400
                       transition-colors"
                :class="{
                  'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400':
                  $route.path.startsWith('/posts')
                }"
              >
                Посты
              </router-link>
              <router-link
                to="/categories"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium
                       hover:text-blue-600 dark:hover:text-blue-400
                       transition-colors"
                :class="{
                  'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400':
                  $route.path.startsWith('/categories')
                }"
              >
                Категории
              </router-link>
            </div>
          </div>
        </div>
      </nav>

      <main class="py-8">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
// import { useRoute } from 'vue-router'

// const route = useRoute()
const isDarkMode = ref(false)

watch(isDarkMode, (newValue) => {
  if (newValue) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('darkMode', JSON.stringify(newValue))
})

onMounted(() => {
  const savedTheme = localStorage.getItem('darkMode')
  if (savedTheme) {
    isDarkMode.value = JSON.parse(savedTheme)
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark')
    }
  }
})
</script>
