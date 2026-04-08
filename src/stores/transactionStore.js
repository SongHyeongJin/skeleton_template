import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { transactionService } from '@/services/transactionService'

export const useTransactionStore = defineStore('transactionStore', () => {
  const transactions = ref([])
  const loading = ref(false)
  const error = ref('')

  const sortedTransactions = computed(() =>
    [...transactions.value].sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime()
      if (dateDiff !== 0) return dateDiff
      return String(b.id).localeCompare(String(a.id))
    }),
  )

  async function fetchTransactions() {
    loading.value = true
    error.value = ''
    try {
      transactions.value = await transactionService.getTransactions()
    } catch (err) {
      error.value = 'json-server에서 거래 데이터를 불러오지 못했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createTransaction(payload) {
    const transaction = await transactionService.createTransaction(payload)
    transactions.value = [transaction, ...transactions.value]
    return transaction
  }

  async function updateTransaction(id, payload) {
    const transaction = await transactionService.updateTransaction(id, payload)
    const index = transactions.value.findIndex((item) => String(item.id) === String(id))
    if (index >= 0) transactions.value[index] = transaction
    return transaction
  }

  async function deleteTransaction(id) {
    await transactionService.deleteTransaction(id)
    transactions.value = transactions.value.filter((item) => String(item.id) !== String(id))
  }

  function getTransactionById(id) {
    return transactions.value.find((item) => String(item.id) === String(id))
  }

  return {
    transactions,
    sortedTransactions,
    loading,
    error,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionById,
  }
})
