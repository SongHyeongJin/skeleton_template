<script setup>
import { formatMoney } from '@/utils/format'

defineProps({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  tone: { type: String, default: 'neutral' },
  helper: { type: String, default: '' },
  format: { type: String, default: 'money' },
})
</script>

<template>
  <article class="summary-card" :class="`summary-card--${tone}`">
    <p>{{ title }}</p>
    <strong>{{ format === 'number' ? amount.toLocaleString() : formatMoney(amount) }}</strong>
    <span v-if="helper">{{ helper }}</span>
  </article>
</template>
