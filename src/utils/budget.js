export function sumCategoryBudgets(categoryBudgets = {}) {
  return Object.values(categoryBudgets).reduce((sum, amount) => sum + Number(amount || 0), 0)
}

export function getBudgetStatus(spent, budget) {
  if (!budget) return { tone: 'neutral', label: '미설정', text: '예산을 설정해 주세요.' }
  if (spent > budget) return { tone: 'danger', label: '초과', text: '예산을 초과했습니다.' }

  const rate = (spent / budget) * 100
  if (rate >= 90) return { tone: 'danger', label: '경고', text: '예산의 90% 이상을 사용했습니다.' }
  if (rate >= 80) return { tone: 'warning', label: '주의', text: '예산의 80% 이상을 사용했습니다.' }

  return { tone: 'good', label: '정상', text: '예산 범위 안에서 관리 중입니다.' }
}

export function getBudgetRate(spent, budget) {
  return budget > 0 ? (spent / budget) * 100 : 0
}

export function getBudgetNotices({ transactions, payload, budget, editingId }) {
  if (payload.type !== 'expense' || !budget) return []

  const monthTransactions = transactions.filter((transaction) => {
    if (!transaction.date.startsWith(payload.date.slice(0, 7)) || transaction.type !== 'expense') {
      return false
    }
    return !editingId || String(transaction.id) !== String(editingId)
  })
  const nextTransactions = [...monthTransactions, payload]
  const notices = []

  if (budget.amount) {
    const totalExpense = nextTransactions.reduce((sum, transaction) => sum + Number(transaction.amount), 0)
    const totalStatus = getBudgetStatus(totalExpense, Number(budget.amount))
    if (['warning', 'danger'].includes(totalStatus.tone)) {
      notices.push(`전체 예산: ${totalStatus.text}`)
    }
  }

  const categoryBudget = Number(budget.categoryBudgets?.[payload.category] || 0)
  if (categoryBudget) {
    const categoryExpense = nextTransactions
      .filter((transaction) => transaction.category === payload.category)
      .reduce((sum, transaction) => sum + Number(transaction.amount), 0)
    const categoryStatus = getBudgetStatus(categoryExpense, categoryBudget)
    if (['warning', 'danger'].includes(categoryStatus.tone)) {
      notices.push(`${payload.category}: ${categoryStatus.text}`)
    }
  }

  return notices
}
