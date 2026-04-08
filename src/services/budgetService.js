import { apiClient } from './apiClient'

function sumCategoryBudgets(categoryBudgets = {}) {
  return Object.values(categoryBudgets).reduce((sum, amount) => sum + Number(amount || 0), 0)
}

export const budgetService = {
  async getBudgets() {
    const { data } = await apiClient.get('/budgets')
    return data
  },

  async saveBudget(month, budget) {
    const { data: budgets } = await apiClient.get('/budgets', { params: { month } })
    const current = budgets[0] || {}
    const categoryBudgets = budget.categoryBudgets || current.categoryBudgets || {}
    const payload = {
      ...current,
      ...budget,
      month,
      amount: sumCategoryBudgets(categoryBudgets),
      categoryBudgets,
      updatedAt: new Date().toISOString(),
    }

    if (budgets.length) {
      const { data } = await apiClient.patch(`/budgets/${budgets[0].id}`, payload)
      return data
    }

    const { data } = await apiClient.post('/budgets', {
      ...payload,
      id: month,
      createdAt: new Date().toISOString(),
    })
    return data
  },
}
