<script setup>
import { computed, onMounted, ref } from 'vue'
import DonutChart from '@/components/DonutChart.vue'
import MonthlyBarChart from '@/components/MonthlyBarChart.vue'
import SummaryCard from '@/components/SummaryCard.vue'
import TransactionListItem from '@/components/TransactionListItem.vue'
import { useTransactionsStore } from '@/stores/transactions'
import { addMonths, formatMoney, getMonthKey } from '@/utils/format'
import { categorySummary, summarizeTransactions } from '@/utils/summary'

const store = useTransactionsStore()
const selectedMonth = ref(getMonthKey())

onMounted(() => {
  store.fetchAll().catch(() => {})
})

const monthTransactions = computed(() =>
  store.sortedTransactions.filter((transaction) => transaction.date.startsWith(selectedMonth.value)),
)

const summary = computed(() => summarizeTransactions(monthTransactions.value))
const recentTransactions = computed(() => store.sortedTransactions.slice(0, 5))
const expenseRows = computed(() => categorySummary(monthTransactions.value, 'expense'))
const currentBudget = computed(() => store.getBudgetByMonth(selectedMonth.value))
const budgetAmount = computed(() => Number(currentBudget.value?.amount || 0))
const budgetRate = computed(() =>
  budgetAmount.value > 0 ? Math.min(999, (summary.value.expense / budgetAmount.value) * 100) : 0,
)

const budgetStatus = computed(() => {
  if (!budgetAmount.value) return { tone: 'neutral', label: '미설정', text: '예산 페이지에서 전체 예산을 설정해 주세요.' }
  if (summary.value.expense > budgetAmount.value) return { tone: 'danger', label: '초과', text: '예산을 초과했습니다.' }
  if (budgetRate.value >= 90) return { tone: 'danger', label: '경고', text: '예산의 90% 이상을 사용했습니다.' }
  if (budgetRate.value >= 80) return { tone: 'warning', label: '주의', text: '예산의 80% 이상을 사용했습니다.' }
  return { tone: 'good', label: '정상', text: '예산 범위 안에서 관리 중입니다.' }
})

const trendRows = computed(() => {
  const base = new Date(`${selectedMonth.value}-01T00:00:00`)
  return Array.from({ length: 6 }, (_, index) => addMonths(base, index - 5)).map((date) => {
    const month = getMonthKey(date)
    const transactions = store.sortedTransactions.filter((transaction) => transaction.date.startsWith(month))
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

    <p v-if="store.error" class="alert">{{ store.error }} 터미널에서 `npm run server`를 실행해 주세요.</p>
    <p v-else-if="store.loading" class="loading">데이터를 불러오는 중입니다.</p>

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
