import { ref } from 'vue'
import { defineStore } from 'pinia'
import { budgetService } from '@/services/budgetService'

export const useBudgetStore = defineStore('budgetStore', () => {
  const budgets = ref([])
  const loading = ref(false)
  const error = ref('')

  async function fetchBudgets() {
    loading.value = true
    error.value = ''
    try {
      budgets.value = await budgetService.getBudgets()
    } catch (err) {
      error.value = 'json-server에서 예산 데이터를 불러오지 못했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  function getBudgetByMonth(month) {
    return budgets.value.find((item) => item.month === month)
  }

  async function saveBudget(month, payload) {
    const budget = await budgetService.saveBudget(month, payload)
    const index = budgets.value.findIndex((item) => item.month === month)
    if (index >= 0) budgets.value[index] = budget
    else budgets.value.push(budget)
    return budget
  }

  return {
    budgets,
    loading,
    error,
    fetchBudgets,
    getBudgetByMonth,
    saveBudget,
  }
})
