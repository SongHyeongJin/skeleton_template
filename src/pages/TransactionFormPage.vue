<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { transactionService } from '@/services/transactionService'
import { useBudgetStore } from '@/stores/budgetStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { getMonthKey, toDateInputValue } from '@/utils/format'
import { getBudgetNotices } from '@/utils/budget'
import { isValidDate, parsePositiveNumber } from '@/utils/validators'

const route = useRoute()
const router = useRouter()
const transactionStore = useTransactionStore()
const categoryStore = useCategoryStore()
const budgetStore = useBudgetStore()

const saving = ref(false)
const message = ref('')
const isEdit = computed(() => Boolean(route.params.id))

const form = reactive({
  date: toDateInputValue(),
  type: 'expense',
  category: '',
  amount: '',
  memo: '',
})

const filteredCategories = computed(() =>
  categoryStore.categories.filter((category) => category.type === form.type),
)

onMounted(async () => {
  if (!categoryStore.categories.length) await categoryStore.fetchCategories()
  if (!budgetStore.budgets.length) await budgetStore.fetchBudgets().catch(() => {})

  if (isEdit.value) {
    const cached = transactionStore.getTransactionById(route.params.id)
    const transaction = cached || (await transactionService.getTransaction(route.params.id))
    form.date = transaction.date
    form.type = transaction.type
    form.category = transaction.category
    form.amount = String(transaction.amount)
    form.memo = transaction.memo || ''
  } else {
    form.category = filteredCategories.value[0]?.name || ''
  }
})

function selectType(type) {
  form.type = type
  form.category = categoryStore.categories.find((category) => category.type === type)?.name || ''
}

function validateForm() {
  if (!form.type || !['income', 'expense'].includes(form.type)) return '거래 유형을 선택해 주세요.'
  if (!isValidDate(form.date)) return '유효한 날짜를 입력해 주세요.'
  if (!form.category) return '카테고리를 선택해 주세요.'
  if (parsePositiveNumber(form.amount) === null) return '0보다 큰 금액을 입력해 주세요.'
  return ''
}

function budgetNotice(payload) {
  const month = getMonthKey(new Date(`${payload.date}T00:00:00`))
  return getBudgetNotices({
    transactions: transactionStore.transactions,
    payload,
    budget: budgetStore.getBudgetByMonth(month),
    editingId: isEdit.value ? route.params.id : '',
  }).join('\n')
}

async function submit() {
  message.value = validateForm()
  if (message.value) return

  saving.value = true
  const payload = {
    date: form.date,
    type: form.type,
    category: form.category,
    amount: Number(form.amount),
    memo: form.memo.trim(),
  }

  try {
    if (isEdit.value) await transactionStore.updateTransaction(route.params.id, payload)
    else await transactionStore.createTransaction(payload)

    const notice = budgetNotice(payload)
    if (notice) window.alert(notice)
    router.push('/transactions')
  } catch (error) {
    message.value = '저장에 실패했습니다. json-server 실행 상태를 확인해 주세요.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="page page--narrow">
    <button class="button button--ghost" type="button" @click="router.back()">이전화면</button>

    <section class="card">
      <div class="card__header">
        <h1>{{ isEdit ? '거래 수정' : '새 거래 등록' }}</h1>
      </div>

      <form class="transaction-form" @submit.prevent="submit">
        <div class="segmented">
          <button type="button" :class="{ active: form.type === 'income' }" @click="selectType('income')">
            수입
          </button>
          <button type="button" :class="{ active: form.type === 'expense' }" @click="selectType('expense')">
            지출
          </button>
        </div>

        <label>
          날짜
          <input v-model="form.date" type="date" required />
        </label>

        <label>
          카테고리
          <select v-model="form.category" required>
            <option value="" disabled>카테고리 선택</option>
            <option v-for="category in filteredCategories" :key="category.id" :value="category.name">
              {{ category.name }}
            </option>
          </select>
        </label>

        <label>
          금액
          <input v-model="form.amount" type="text" inputmode="numeric" pattern="[0-9]*" placeholder="0" required />
        </label>

        <label>
          메모
          <textarea v-model="form.memo" rows="4" placeholder="메모를 입력하세요"></textarea>
        </label>

        <p v-if="message" class="alert">{{ message }}</p>

        <div class="form-actions">
          <button class="button button--ghost" type="button" @click="router.back()">취소</button>
          <button class="button button--primary" type="submit" :disabled="saving">
            {{ saving ? '저장 중' : '저장' }}
          </button>
        </div>
      </form>
    </section>
  </section>
</template>
