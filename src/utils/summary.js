export function summarizeTransactions(transactions) {
  const income = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0)
  const expense = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0)

  return {
    income,
    expense,
    net: income - expense,
    count: transactions.length,
  }
}

export function categorySummary(transactions, type) {
  const rows = transactions
    .filter((transaction) => !type || transaction.type === type)
    .reduce((acc, transaction) => {
      const key = `${transaction.type}-${transaction.category}`
      if (!acc[key]) {
        acc[key] = {
          type: transaction.type,
          category: transaction.category,
          amount: 0,
          count: 0,
        }
      }
      acc[key].amount += Number(transaction.amount)
      acc[key].count += 1
      return acc
    }, {})

  const total = Object.values(rows).reduce((sum, item) => sum + item.amount, 0)

  return Object.values(rows)
    .map((item) => ({
      ...item,
      percentage: total > 0 ? (item.amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
}
