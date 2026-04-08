// 사용하지 않는 파일: 참고용으로 남겨둔 이전 통합 store입니다.
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/services/api'

export const useTransactionsStore = defineStore('transactions', () => {
  const transactions = ref([])
  const categories = ref([])
  const budgets = ref([])
  const loading = ref(false)
  const error = ref('')

  const sortedTransactions = computed(() =>
    [...transactions.value].sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime()
      if (dateDiff !== 0) return dateDiff
      return String(b.id).localeCompare(String(a.id))
    }),
  )

  const incomeCategories = computed(() =>
    categories.value.filter((category) => category.type === 'income'),
  )

  const expenseCategories = computed(() =>
    categories.value.filter((category) => category.type === 'expense'),
  )

  async function fetchAll() {
    loading.value = true
    error.value = ''

    try {
      const [transactionData, categoryData, budgetData] = await Promise.all([
        api.getTransactions(),
        api.getCategories(),
        api.getBudgets(),
      ])
      transactions.value = transactionData
      categories.value = categoryData
      budgets.value = budgetData
    } catch (err) {
      error.value = 'json-server에서 데이터를 불러오지 못했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchCategories() {
    categories.value = await api.getCategories()
  }

  async function fetchBudgets() {
    budgets.value = await api.getBudgets()
  }

  async function createTransaction(payload) {
    const transaction = await api.createTransaction(payload)
    transactions.value = [transaction, ...transactions.value]
    return transaction
  }

  async function updateTransaction(id, payload) {
    const transaction = await api.updateTransaction(id, payload)
    const index = transactions.value.findIndex((item) => String(item.id) === String(id))
    if (index >= 0) transactions.value[index] = transaction
    return transaction
  }

  async function deleteTransaction(id) {
    await api.deleteTransaction(id)
    transactions.value = transactions.value.filter((item) => String(item.id) !== String(id))
  }

  function getTransactionById(id) {
    return transactions.value.find((item) => String(item.id) === String(id))
  }

  function getBudgetByMonth(month) {
    return budgets.value.find((item) => item.month === month)
  }

  async function saveBudget(month, payload) {
    const budget = await api.saveBudget(month, payload)
    const index = budgets.value.findIndex((item) => item.month === month)
    if (index >= 0) budgets.value[index] = budget
    else budgets.value.push(budget)
    return budget
  }

  return {
    transactions,
    sortedTransactions,
    categories,
    budgets,
    incomeCategories,
    expenseCategories,
    loading,
    error,
    fetchAll,
    fetchCategories,
    fetchBudgets,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionById,
    getBudgetByMonth,
    saveBudget,
  }
})
