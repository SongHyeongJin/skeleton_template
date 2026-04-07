import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
})

export const api = {
  async getTransactions() {
    const { data } = await client.get('/transactions', {
      params: { _sort: '-date,-id' },
    })
    return data
  },

  async getTransaction(id) {
    const { data } = await client.get(`/transactions/${id}`)
    return data
  },

  async createTransaction(transaction) {
    const { data } = await client.post('/transactions', {
      ...transaction,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    return data
  },

  async updateTransaction(id, transaction) {
    const { data } = await client.patch(`/transactions/${id}`, {
      ...transaction,
      updatedAt: new Date().toISOString(),
    })
    return data
  },

  async deleteTransaction(id) {
    await client.delete(`/transactions/${id}`)
  },

  async getCategories() {
    const { data } = await client.get('/categories')
    return data
  },

  async getBudgets() {
    const { data } = await client.get('/budgets')
    return data
  },

  async saveBudget(month, budget) {
    const { data: budgets } = await client.get('/budgets', { params: { month } })
    const current = budgets[0] || {}
    const payload = {
      ...current,
      ...budget,
      month,
      amount: Object.values(budget.categoryBudgets || current.categoryBudgets || {}).reduce(
        (sum, amount) => sum + Number(amount || 0),
        0,
      ),
      categoryBudgets: budget.categoryBudgets || current.categoryBudgets || {},
      updatedAt: new Date().toISOString(),
    }

    if (budgets.length) {
      const { data } = await client.patch(`/budgets/${budgets[0].id}`, payload)
      return data
    }

    const { data } = await client.post('/budgets', {
      ...payload,
      id: month,
      createdAt: new Date().toISOString(),
    })
    return data
  },
}
