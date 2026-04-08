import { apiClient } from './apiClient'

export const transactionService = {
  async getTransactions() {
    const { data } = await apiClient.get('/transactions', {
      params: { _sort: '-date,-id' },
    })
    return data
  },

  async getTransaction(id) {
    const { data } = await apiClient.get(`/transactions/${id}`)
    return data
  },

  async createTransaction(transaction) {
    const { data } = await apiClient.post('/transactions', {
      ...transaction,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    return data
  },

  async updateTransaction(id, transaction) {
    const { data } = await apiClient.patch(`/transactions/${id}`, {
      ...transaction,
      updatedAt: new Date().toISOString(),
    })
    return data
  },

  async deleteTransaction(id) {
    await apiClient.delete(`/transactions/${id}`)
  },
}
