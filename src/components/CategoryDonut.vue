<script setup>
import { computed } from 'vue'
import { formatMoney } from '@/utils/format'

const props = defineProps({
  title: { type: String, required: true },
  rows: { type: Array, required: true },
})

const colors = ['#2563eb', '#0f766e', '#ea580c', '#dc2626', '#7c3aed', '#0891b2', '#4b5563']

const gradient = computed(() => {
  if (!props.rows.length) return '#e5e7eb'

  let cursor = 0
  const stops = props.rows.map((row, index) => {
    const start = cursor
    cursor += row.percentage
    return `${colors[index % colors.length]} ${start}% ${cursor}%`
  })

  return `conic-gradient(${stops.join(', ')})`
})
</script>

<template>
  <section class="card">
    <div class="card__header">
      <h3>{{ title }}</h3>
    </div>
    <div v-if="rows.length" class="donut-wrap">
      <div class="donut" :style="{ background: gradient }">
        <span>비율</span>
      </div>
      <div class="donut-list">
        <div v-for="(row, index) in rows" :key="`${row.type}-${row.category}`" class="donut-row">
          <span class="dot" :style="{ backgroundColor: colors[index % colors.length] }"></span>
          <span>{{ row.category }}</span>
          <strong>{{ row.percentage.toFixed(1) }}%</strong>
          <small>{{ formatMoney(row.amount) }}</small>
        </div>
      </div>
    </div>
    <p v-else class="empty-state">표시할 데이터가 없습니다.</p>
  </section>
</template>
