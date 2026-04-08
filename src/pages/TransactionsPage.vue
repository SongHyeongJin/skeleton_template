<script setup>
import { computed, onMounted, reactive, watch } from 'vue'
import SummaryCard from '@/components/SummaryCard.vue'
import TransactionListItem from '@/components/TransactionListItem.vue'
import { useCategoryStore } from '@/stores/categoryStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { endOfMonth, endOfWeek, startOfMonth, startOfWeek, toDateInputValue } from '@/utils/format'
import { categorySummary, summarizeTransactions } from '@/utils/summary'

const transactionStore = useTransactionStore()
const categoryStore = useCategoryStore()

const filters = reactive({
  type: 'all',
  category: 'all',
  range: 'all',
  startDate: '',
  endDate: '',
  sortKey: 'date',
  sortDirection: 'desc',
})

onMounted(() => {
  Promise.all([
    transactionStore.fetchTransactions(),
    categoryStore.fetchCategories(),
  ]).catch(() => {})
})

watch(
  () => filters.range,
  (range) => {
    const today = new Date()
    if (range === 'today') {
      filters.startDate = toDateInputValue(today)
      filters.endDate = toDateInputValue(today)
    } else if (range === 'week') {
      filters.startDate = toDateInputValue(startOfWeek(today))
      filters.endDate = toDateInputValue(endOfWeek(today))
    } else if (range === 'month') {
      filters.startDate = toDateInputValue(startOfMonth(today))
      filters.endDate = toDateInputValue(endOfMonth(today))
    } else if (range === 'all') {
      filters.startDate = ''
      filters.endDate = ''
    }
  },
)

watch(
  () => filters.type,
  () => {
    filters.category = 'all'
  },
)

const availableCategories = computed(() =>
  categoryStore.categories.filter((category) => filters.type === 'all' || category.type === filters.type),
)

const filteredTransactions = computed(() => {
  const rows = transactionStore.sortedTransactions.filter((transaction) => {
    if (filters.type !== 'all' && transaction.type !== filters.type) return false
    if (filters.category !== 'all' && transaction.category !== filters.category) return false
    if (filters.startDate && transaction.date < filters.startDate) return false
    if (filters.endDate && transaction.date > filters.endDate) return false
    return true
  })

  return rows.sort((a, b) => {
    const direction = filters.sortDirection === 'asc' ? 1 : -1
    if (filters.sortKey === 'amount') return (Number(a.amount) - Number(b.amount)) * direction
    return (new Date(a.date).getTime() - new Date(b.date).getTime()) * direction
  })
})

const summary = computed(() => summarizeTransactions(filteredTransactions.value))
const categoryRows = computed(() => categorySummary(filteredTransactions.value))

function resetFilters() {
  filters.type = 'all'
  filters.category = 'all'
  filters.range = 'all'
  filters.startDate = ''
  filters.endDate = ''
  filters.sortKey = 'date'
  filters.sortDirection = 'desc'
}

async function deleteTransaction(id) {
  if (!confirm('이 거래를 삭제하시겠습니까?')) return
  await transactionStore.deleteTransaction(id)
}
</script>

<template>
  <section class="page">
    <div class="page-heading">
      <div>
        <p class="eyebrow">거래내역</p>
        <h1>전체 거래 조회</h1>
      </div>
      <button class="button button--ghost" type="button" @click="resetFilters">필터 초기화</button>
    </div>

    <section class="card filter-card">
      <div class="form-grid form-grid--wide">
        <label>
          유형
          <select v-model="filters.type">
            <option value="all">전체</option>
            <option value="income">수입</option>
            <option value="expense">지출</option>
          </select>
        </label>

        <label>
          카테고리
          <select v-model="filters.category">
            <option value="all">전체</option>
            <option v-for="category in availableCategories" :key="category.id" :value="category.name">
              {{ category.name }}
            </option>
          </select>
        </label>

        <label>
          기간
          <select v-model="filters.range">
            <option value="all">전체</option>
            <option value="today">일별</option>
            <option value="week">주별</option>
            <option value="month">월별</option>
            <option value="custom">사용자 지정</option>
          </select>
        </label>

        <label>
          시작일
          <input v-model="filters.startDate" type="date" :disabled="filters.range !== 'custom'" />
        </label>

        <label>
          종료일
          <input v-model="filters.endDate" type="date" :disabled="filters.range !== 'custom'" />
        </label>

        <label>
          정렬 기준
          <select v-model="filters.sortKey">
            <option value="date">날짜</option>
            <option value="amount">금액</option>
          </select>
        </label>

        <label>
          정렬 방향
          <select v-model="filters.sortDirection">
            <option value="desc">내림차순</option>
            <option value="asc">오름차순</option>
          </select>
        </label>
      </div>
    </section>

    <div class="summary-grid summary-grid--compact">
      <SummaryCard title="필터 수입" :amount="summary.income" tone="income" />
      <SummaryCard title="필터 지출" :amount="summary.expense" tone="expense" />
      <SummaryCard title="거래 건수" :amount="summary.count" tone="neutral" helper="건" format="number" />
    </div>

    <section class="card">
      <div class="card__header">
        <h2>카테고리별 요약</h2>
      </div>
      <div v-if="categoryRows.length" class="category-summary">
        <div
          v-for="row in categoryRows"
          :key="`${row.type}-${row.category}`"
          class="category-summary__row"
          :class="`category-summary__row--${row.type}`"
        >
          <span>{{ row.type === 'income' ? '수입' : '지출' }}</span>
          <strong>{{ row.category }}</strong>
          <em>{{ row.count }}건</em>
          <b>{{ row.percentage.toFixed(1) }}%</b>
        </div>
      </div>
      <p v-else class="empty-state">필터 조건에 맞는 요약이 없습니다.</p>
    </section>

    <section class="card">
      <div class="card__header">
        <h2>거래 목록</h2>
      </div>
      <div v-if="filteredTransactions.length" class="list-stack">
        <TransactionListItem
          v-for="transaction in filteredTransactions"
          :key="transaction.id"
          :transaction="transaction"
          actions
          @delete="deleteTransaction"
        />
      </div>
      <p v-else class="empty-state">조건에 맞는 거래가 없습니다.</p>
    </section>
  </section>
</template>
