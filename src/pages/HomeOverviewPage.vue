<script setup>
import { computed, onMounted, ref } from 'vue'
import DonutChart from '@/components/DonutChart.vue'
import MonthlyBarChart from '@/components/MonthlyBarChart.vue'
import SummaryCard from '@/components/SummaryCard.vue'
import TransactionListItem from '@/components/TransactionListItem.vue'
import { useBudgetStore } from '@/stores/budgetStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { addMonths, formatMoney, getMonthKey } from '@/utils/format'
import { getBudgetRate, getBudgetStatus } from '@/utils/budget'
import { categorySummary, summarizeTransactions } from '@/utils/summary'

const transactionStore = useTransactionStore()
const budgetStore = useBudgetStore()
const selectedMonth = ref(getMonthKey())

onMounted(() => {
  Promise.all([
    transactionStore.fetchTransactions(),
    budgetStore.fetchBudgets(),
  ]).catch(() => {})
})

const monthTransactions = computed(() =>
  transactionStore.sortedTransactions.filter((transaction) => transaction.date.startsWith(selectedMonth.value)),
)

const summary = computed(() => summarizeTransactions(monthTransactions.value))
const recentTransactions = computed(() => transactionStore.sortedTransactions.slice(0, 5))
const expenseRows = computed(() => categorySummary(monthTransactions.value, 'expense'))
const currentBudget = computed(() => budgetStore.getBudgetByMonth(selectedMonth.value))
const budgetAmount = computed(() => Number(currentBudget.value?.amount || 0))
const budgetRate = computed(() => Math.min(999, getBudgetRate(summary.value.expense, budgetAmount.value)))

const budgetStatus = computed(() => {
  if (!budgetAmount.value) return { tone: 'neutral', label: '미설정', text: '예산 페이지에서 전체 예산을 설정해 주세요.' }
  return getBudgetStatus(summary.value.expense, budgetAmount.value)
})

const trendRows = computed(() => {
  const base = new Date(`${selectedMonth.value}-01T00:00:00`)
  return Array.from({ length: 6 }, (_, index) => addMonths(base, index - 5)).map((date) => {
    const month = getMonthKey(date)
    const transactions = transactionStore.sortedTransactions.filter((transaction) => transaction.date.startsWith(month))
    const rowSummary = summarizeTransactions(transactions)
    return {
      month,
      label: `${date.getMonth() + 1}월`,
      income: rowSummary.income,
      expense: rowSummary.expense,
    }
  })
})
</script>

<template>
  <section class="page">
    <div class="page-heading">
      <div>
        <p class="eyebrow">홈</p>
        <h1>월별 재정 요약</h1>
      </div>
      <label class="month-picker">
        조회 월
        <input v-model="selectedMonth" type="month" />
      </label>
    </div>

    <p v-if="transactionStore.error || budgetStore.error" class="alert">json-server에서 데이터를 불러오지 못했습니다. 터미널에서 `npm run server`를 실행해 주세요.</p>
    <p v-else-if="transactionStore.loading || budgetStore.loading" class="loading">데이터를 불러오는 중입니다.</p>

    <div class="summary-grid">
      <SummaryCard title="총 수입" :amount="summary.income" tone="income" />
      <SummaryCard title="총 지출" :amount="summary.expense" tone="expense" />
      <SummaryCard title="순이익" :amount="summary.net" :tone="summary.net >= 0 ? 'income' : 'expense'" />
    </div>

    <section class="card budget-card">
      <div class="card__header card__header--split">
        <div>
          <h2>전체 예산 알림</h2>
          <p>{{ selectedMonth }} 전체 예산 {{ formatMoney(budgetAmount) }}</p>
        </div>
        <RouterLink class="button button--ghost" to="/budgets">예산 관리</RouterLink>
      </div>

      <div class="budget-metrics">
        <SummaryCard title="현재 지출" :amount="summary.expense" tone="expense" />
        <SummaryCard title="남은 예산" :amount="Math.max(0, budgetAmount - summary.expense)" :tone="summary.expense > budgetAmount && budgetAmount ? 'expense' : 'income'" />
        <SummaryCard title="예산 소진율" :amount="Number(budgetRate.toFixed(1))" tone="neutral" format="number" helper="%" />
      </div>

      <div class="budget-progress">
        <span :style="{ width: `${Math.min(100, budgetRate)}%` }"></span>
      </div>
      <p class="budget-alert" :class="`budget-alert--${budgetStatus.tone}`">
        {{ budgetStatus.label }}: {{ budgetStatus.text }}
      </p>
    </section>

    <div class="two-column">
      <DonutChart title="카테고리별 지출 비율" :rows="expenseRows" />
      <MonthlyBarChart :rows="trendRows" />
    </div>

    <section class="card">
      <div class="card__header card__header--split">
        <div>
          <h2>최근 거래</h2>
          <p>최근 작성일수록 위에 표시됩니다.</p>
        </div>
        <RouterLink to="/transactions" class="text-link">전체보기</RouterLink>
      </div>

      <div v-if="recentTransactions.length" class="list-stack">
        <TransactionListItem
          v-for="transaction in recentTransactions"
          :key="transaction.id"
          :transaction="transaction"
          compact
        />
      </div>
      <p v-else class="empty-state">아직 등록된 거래가 없습니다.</p>
    </section>
  </section>
</template>
