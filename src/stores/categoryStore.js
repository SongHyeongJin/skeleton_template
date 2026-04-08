import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { categoryService } from '@/services/categoryService'

export const useCategoryStore = defineStore('categoryStore', () => {
  const categories = ref([])
  const loading = ref(false)
  const error = ref('')

  const incomeCategories = computed(() =>
    categories.value.filter((category) => category.type === 'income'),
  )

  const expenseCategories = computed(() =>
    categories.value.filter((category) => category.type === 'expense'),
  )

  async function fetchCategories() {
    loading.value = true
    error.value = ''
    try {
      categories.value = await categoryService.getCategories()
    } catch (err) {
      error.value = 'json-server에서 카테고리 데이터를 불러오지 못했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    categories,
    incomeCategories,
    expenseCategories,
    loading,
    error,
    fetchCategories,
  }
})
