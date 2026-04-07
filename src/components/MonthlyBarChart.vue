<script setup>
import { computed } from 'vue'
import { formatMoney } from '@/utils/format'

const props = defineProps({
  rows: { type: Array, required: true },
})

const maxAmount = computed(() =>
  Math.max(1, ...props.rows.flatMap((row) => [row.income, row.expense])),
)
</script>

<template>
  <section class="card">
    <div class="card__header">
      <h3>월별 수입/지출 추이</h3>
    </div>
    <div class="bar-chart" aria-label="월별 수입 지출 추이">
      <div v-for="row in rows" :key="row.month" class="bar-chart__group">
        <div class="bar-chart__bars">
          <span
            class="bar-chart__bar bar-chart__bar--income"
            :style="{ height: `${Math.max(4, (row.income / maxAmount) * 100)}%` }"
            :title="`수입 ${formatMoney(row.income)}`"
          ></span>
          <span
            class="bar-chart__bar bar-chart__bar--expense"
            :style="{ height: `${Math.max(4, (row.expense / maxAmount) * 100)}%` }"
            :title="`지출 ${formatMoney(row.expense)}`"
          ></span>
        </div>
        <strong>{{ row.label }}</strong>
      </div>
    </div>
    <div class="chart-legend">
      <span><i class="legend-dot legend-dot--income"></i>수입</span>
      <span><i class="legend-dot legend-dot--expense"></i>지출</span>
    </div>
  </section>
</template>
