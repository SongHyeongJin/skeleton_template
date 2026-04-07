<script setup>
import { formatDate, formatFullDate, formatMoney } from '@/utils/format'

defineProps({
  transaction: { type: Object, required: true },
  compact: { type: Boolean, default: false },
  actions: { type: Boolean, default: false },
})

const emit = defineEmits(['delete'])
</script>

<template>
  <article class="transaction-item">
    <div class="transaction-item__badge" :class="`transaction-item__badge--${transaction.type}`">
      {{ transaction.type === 'income' ? '수입' : '지출' }}
    </div>

    <div class="transaction-item__body">
      <div class="transaction-item__title">
        <strong>{{ transaction.category }}</strong>
        <span>{{ compact ? formatDate(transaction.date) : formatFullDate(transaction.date) }}</span>
      </div>
      <p v-if="transaction.memo">{{ transaction.memo }}</p>
    </div>

    <strong class="transaction-item__amount" :class="`transaction-item__amount--${transaction.type}`">
      {{ transaction.type === 'income' ? '+' : '-' }}{{ formatMoney(transaction.amount) }}
    </strong>

    <div v-if="actions" class="transaction-item__actions">
      <RouterLink class="button button--ghost" :to="`/transactions/${transaction.id}/edit`">수정</RouterLink>
      <button class="button button--danger-ghost" type="button" @click="emit('delete', transaction.id)">
        삭제
      </button>
    </div>
  </article>
</template>
