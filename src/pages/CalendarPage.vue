<script setup>
import { computed, onMounted, ref } from 'vue'
import TransactionListItem from '@/components/TransactionListItem.vue'
import { useTransactionStore } from '@/stores/transactionStore'
import { addMonths, buildMonthDays, formatFullDate, formatMonth, toDateInputValue } from '@/utils/format'
import { summarizeTransactions } from '@/utils/summary'

const transactionStore = useTransactionStore()
const currentDate = ref(new Date())
const selectedDate = ref(toDateInputValue())

const weekdayLabels = ['일', '월', '화', '수', '목', '금', '토']

onMounted(() => {
  transactionStore.fetchTransactions().catch(() => {})
})

const monthDays = computed(() => buildMonthDays(currentDate.value))
const emptyCells = computed(() => monthDays.value[0]?.getDay() || 0)

const selectedTransactions = computed(() =>
  transactionStore.sortedTransactions.filter((transaction) => transaction.date === selectedDate.value),
)

const selectedSummary = computed(() => summarizeTransactions(selectedTransactions.value))

function transactionsByDay(day) {
  const dateValue = toDateInputValue(day)
  return transactionStore.sortedTransactions.filter((transaction) => transaction.date === dateValue)
}

function daySummary(day) {
  return summarizeTransactions(transactionsByDay(day))
}

function changeMonth(amount) {
  currentDate.value = addMonths(currentDate.value, amount)
}

function moveToday() {
  currentDate.value = new Date()
  selectedDate.value = toDateInputValue()
}
</script>

<template>
  <section class="page">
    <div class="page-heading page-heading--row">
      <div>
        <p class="eyebrow">달력</p>
        <h1>{{ formatMonth(currentDate) }}</h1>
      </div>
      <div class="month-controls">
        <button class="button button--ghost" type="button" @click="changeMonth(-1)">이전</button>
        <button class="button button--ghost" type="button" @click="moveToday">오늘</button>
        <button class="button button--ghost" type="button" @click="changeMonth(1)">다음</button>
      </div>
    </div>

    <div class="calendar-layout">
      <section class="card calendar-card">
        <div class="calendar-grid calendar-grid--weekdays">
          <strong v-for="day in weekdayLabels" :key="day">{{ day }}</strong>
        </div>
        <div class="calendar-grid">
          <span v-for="index in emptyCells" :key="`empty-${index}`"></span>
          <button
            v-for="day in monthDays"
            :key="day.toISOString()"
            class="calendar-day"
            :class="{ active: selectedDate === toDateInputValue(day), today: toDateInputValue(day) === toDateInputValue() }"
            type="button"
            @click="selectedDate = toDateInputValue(day)"
          >
            <b>{{ day.getDate() }}</b>
            <small v-if="daySummary(day).income">+{{ Math.round(daySummary(day).income / 10000) }}만</small>
            <small v-if="daySummary(day).expense" class="expense">-{{ Math.round(daySummary(day).expense / 10000) }}만</small>
          </button>
        </div>
      </section>

      <aside class="card">
        <div class="card__header">
          <h2>{{ formatFullDate(selectedDate) }}</h2>
          <p>수입 {{ selectedSummary.income.toLocaleString() }}원 · 지출 {{ selectedSummary.expense.toLocaleString() }}원</p>
        </div>
        <div v-if="selectedTransactions.length" class="list-stack">
          <TransactionListItem
            v-for="transaction in selectedTransactions"
            :key="transaction.id"
            :transaction="transaction"
            compact
          />
        </div>
        <p v-else class="empty-state">선택한 날짜의 거래가 없습니다.</p>
      </aside>
    </div>
  </section>
</template>
