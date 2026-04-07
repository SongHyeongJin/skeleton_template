<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import SummaryCard from '@/components/SummaryCard.vue'
import { useTransactionsStore } from '@/stores/transactions'
import { formatMoney, getMonthKey } from '@/utils/format'
import { summarizeTransactions } from '@/utils/summary'

const store = useTransactionsStore()
const selectedMonth = ref(getMonthKey())
const message = ref('')
const addForm = reactive({ category: '', amount: '' })
const editingCategory = ref('')
const editAmount = ref('')

onMounted(async () => {
  await store.fetchAll().catch(() => {})
  resetAddForm()
})

watch(selectedMonth, () => {
  message.value = ''
  editingCategory.value = ''
  editAmount.value = ''
  resetAddForm()
})

const monthTransactions = computed(() =>
  store.sortedTransactions.filter((transaction) => transaction.date.startsWith(selectedMonth.value)),
)

const monthSummary = computed(() => summarizeTransactions(monthTransactions.value))
const currentBudget = computed(() => store.getBudgetByMonth(selectedMonth.value))
const categoryBudgetMap = computed(() => currentBudget.value?.categoryBudgets || {})
const totalBudget = computed(() =>
  Object.values(categoryBudgetMap.value).reduce((sum, amount) => sum + Number(amount || 0), 0),
)

const totalBudgetStatus = computed(() => getBudgetStatus(monthSummary.value.expense, totalBudget.value))

const configuredRows = computed(() =>
  Object.entries(categoryBudgetMap.value)
    .map(([categoryName, amount]) => {
      const spent = monthTransactions.value
        .filter((transaction) => transaction.type === 'expense' && transaction.category === categoryName)
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0)
      const budget = Number(amount || 0)
      return {
        category: categoryName,
        spent,
        budget,
        remaining: Math.max(0, budget - spent),
        rate: budget > 0 ? (spent / budget) * 100 : 0,
        status: getBudgetStatus(spent, budget),
      }
    })
    .sort((a, b) => a.category.localeCompare(b.category, 'ko-KR')),
)

const availableCategories = computed(() =>
  store.expenseCategories.filter((category) => !categoryBudgetMap.value[category.name]),
)

function getBudgetStatus(spent, budget) {
  if (!budget) return { tone: 'neutral', label: '미설정', text: '예산을 설정해 주세요.' }
  if (spent > budget) return { tone: 'danger', label: '초과', text: '예산을 초과했습니다.' }
  const rate = (spent / budget) * 100
  if (rate >= 90) return { tone: 'danger', label: '경고', text: '예산의 90% 이상을 사용했습니다.' }
  if (rate >= 80) return { tone: 'warning', label: '주의', text: '예산의 80% 이상을 사용했습니다.' }
  return { tone: 'good', label: '정상', text: '예산 범위 안에서 관리 중입니다.' }
}

function parseMoney(value) {
  if (value === '' || value === null || value === undefined) return null
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) return null
  return amount
}

function resetAddForm() {
  addForm.category = availableCategories.value[0]?.name || ''
  addForm.amount = ''
}

async function persistCategoryBudgets(categoryBudgets, successMessage) {
  try {
    await store.saveBudget(selectedMonth.value, { categoryBudgets })
    message.value = successMessage
    resetAddForm()
  } catch (error) {
    message.value = '예산 저장에 실패했습니다. json-server 실행 상태를 확인해 주세요.'
  }
}

async function addBudget() {
  message.value = ''
  const amount = parseMoney(addForm.amount)

  if (!addForm.category) {
    message.value = '예산을 설정할 카테고리를 선택해 주세요.'
    return
  }
  if (amount === null) {
    message.value = '예산은 0보다 큰 숫자로 입력해 주세요.'
    return
  }

  await persistCategoryBudgets(
    {
      ...categoryBudgetMap.value,
      [addForm.category]: amount,
    },
    `${addForm.category} 예산이 추가되었습니다.`,
  )
}

function startEdit(row) {
  editingCategory.value = row.category
  editAmount.value = String(row.budget)
  message.value = ''
}

function cancelEdit() {
  editingCategory.value = ''
  editAmount.value = ''
}

async function saveEdit(categoryName) {
  const amount = parseMoney(editAmount.value)
  if (amount === null) {
    message.value = '수정할 예산은 0보다 큰 숫자로 입력해 주세요.'
    return
  }

  await persistCategoryBudgets(
    {
      ...categoryBudgetMap.value,
      [categoryName]: amount,
    },
    `${categoryName} 예산이 수정되었습니다.`,
  )
  cancelEdit()
}

async function deleteBudget(categoryName) {
  if (!confirm(`${categoryName} 예산을 삭제하시겠습니까?`)) return
  const nextBudgets = { ...categoryBudgetMap.value }
  delete nextBudgets[categoryName]
  await persistCategoryBudgets(nextBudgets, `${categoryName} 예산이 삭제되었습니다.`)
}
</script>

<template>
  <section class="page">
    <div class="page-heading">
      <div>
        <p class="eyebrow">예산 관리</p>
        <h1>월별 예산 설정</h1>
      </div>
      <label class="month-picker">
        예산 월
        <input v-model="selectedMonth" type="month" />
      </label>
    </div>

    <section class="card budget-card">
      <div class="card__header card__header--split">
        <div>
          <h2>전체 예산</h2>
          <p>설정한 카테고리별 예산 합계로 자동 계산됩니다.</p>
        </div>
        <strong class="budget-total">{{ formatMoney(totalBudget) }}</strong>
      </div>

      <div class="budget-metrics">
        <SummaryCard title="현재 지출" :amount="monthSummary.expense" tone="expense" />
        <SummaryCard title="남은 예산" :amount="Math.max(0, totalBudget - monthSummary.expense)" :tone="monthSummary.expense > totalBudget && totalBudget ? 'expense' : 'income'" />
        <SummaryCard title="예산 소진율" :amount="Number(Math.min(999, totalBudget ? (monthSummary.expense / totalBudget) * 100 : 0).toFixed(1))" tone="neutral" format="number" helper="%" />
      </div>

      <div class="budget-progress">
        <span :style="{ width: `${Math.min(100, totalBudget ? (monthSummary.expense / totalBudget) * 100 : 0)}%` }"></span>
      </div>
      <p class="budget-alert" :class="`budget-alert--${totalBudgetStatus.tone}`">
        {{ totalBudgetStatus.label }}: {{ totalBudgetStatus.text }}
      </p>
      <p v-if="message" class="form-message">{{ message }}</p>
    </section>

    <section class="card">
      <div class="card__header">
        <h2>예산 항목 추가</h2>
        <p>아직 예산을 설정하지 않은 지출 카테고리만 선택할 수 있습니다.</p>
      </div>

      <form v-if="availableCategories.length" class="budget-add-form" @submit.prevent="addBudget">
        <label>
          카테고리
          <select v-model="addForm.category">
            <option v-for="category in availableCategories" :key="category.id" :value="category.name">
              {{ category.name }}
            </option>
          </select>
        </label>
        <label>
          예산
          <input v-model="addForm.amount" type="text" inputmode="numeric" pattern="[0-9]*" placeholder="예산 입력" />
        </label>
        <button class="button button--primary" type="submit">추가</button>
      </form>
      <p v-else class="empty-state">모든 지출 카테고리에 예산이 설정되었습니다.</p>
    </section>

    <section class="card">
      <div class="card__header">
        <h2>카테고리별 예산 항목</h2>
        <p>설정된 항목만 표시됩니다. 수정 또는 삭제할 수 있습니다.</p>
      </div>

      <div v-if="configuredRows.length" class="budget-category-list">
        <article v-for="row in configuredRows" :key="row.category" class="budget-category">
          <div class="budget-category__header budget-category__header--managed">
            <div>
              <strong>{{ row.category }}</strong>
              <p>{{ row.status.label }} · {{ row.status.text }}</p>
            </div>

            <label v-if="editingCategory === row.category">
              수정 예산
              <input v-model="editAmount" type="text" inputmode="numeric" pattern="[0-9]*" />
            </label>
            <div v-else class="budget-category__amount">
              <span>설정 예산</span>
              <strong>{{ formatMoney(row.budget) }}</strong>
            </div>

            <div class="budget-category__actions">
              <template v-if="editingCategory === row.category">
                <button class="button button--primary" type="button" @click="saveEdit(row.category)">저장</button>
                <button class="button button--ghost" type="button" @click="cancelEdit">취소</button>
              </template>
              <template v-else>
                <button class="button button--ghost" type="button" @click="startEdit(row)">수정</button>
                <button class="button button--danger-ghost" type="button" @click="deleteBudget(row.category)">삭제</button>
              </template>
            </div>
          </div>

          <div class="budget-category__numbers">
            <span>현재 지출 {{ formatMoney(row.spent) }}</span>
            <span>남은 예산 {{ formatMoney(row.remaining) }}</span>
            <span>소진율 {{ row.rate.toFixed(1) }}%</span>
          </div>
          <div class="budget-progress">
            <span :style="{ width: `${Math.min(100, row.rate)}%` }"></span>
          </div>
        </article>
      </div>
      <p v-else class="empty-state">설정된 카테고리 예산이 없습니다.</p>
    </section>
  </section>
</template>
