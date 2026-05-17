<script setup lang="ts">
import { computed, ref } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import type { Report } from '@/types'

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler)

const props = defineProps<{ reports: Report[] }>()

const timeframe = ref<'week' | 'month'>('week')

const ABUSE_COLORS: Record<string, string> = {
  Physical:      '#e05c5c',
  Psychological: '#f0a500',
  Sexual:        '#8b5cf6',
  Economic:      '#3b82f6',
  Stalking:      '#10b981',
}

function colorFor(name: string): string {
  return ABUSE_COLORS[name] ?? '#888'
}

function getDateLabels(tf: 'week' | 'month'): { labels: string[]; dateKeys: string[] } {
  const days = tf === 'week' ? 7 : 30
  const labels: string[] = []
  const dateKeys: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dateKeys.push(d.toISOString().slice(0, 10))
    labels.push(
      tf === 'week'
        ? d.toLocaleDateString('en-US', { weekday: 'short' })
        : `${d.getMonth() + 1}/${d.getDate()}`
    )
  }
  return { labels, dateKeys }
}

function buildDatasets(reports: Report[], dateKeys: string[]) {
  const abuseTypes = [...new Set(reports.map(r => r.abuse_name))]

  return abuseTypes.map(abuse => {
    const countsByDay: Record<string, number> = {}
    for (const key of dateKeys) countsByDay[key] = 0
    for (const r of reports) {
      const day = r.reported_at.slice(0, 10)
      if (day in countsByDay && r.abuse_name === abuse) countsByDay[day]!++
    }
    const color = colorFor(abuse)
    return {
      label: abuse,
      data: dateKeys.map(k => countsByDay[k] ?? 0),
      borderColor: color,
      backgroundColor: color + '22',
      borderWidth: 2,
      pointRadius: 3,
      tension: 0.3,
      fill: false,
    }
  })
}

const chartData = computed(() => {
  const { labels, dateKeys } = getDateLabels(timeframe.value)
  return {
    labels,
    datasets: buildDatasets(props.reports, dateKeys),
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' as const, labels: { boxWidth: 12, font: { size: 12 } } },
    tooltip: { mode: 'index' as const, intersect: false },
  },
  scales: {
    y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } },
    x: { grid: { display: false } },
  },
}
</script>

<template>
  <div class="card card--padded">
    <div class="card-head" style="padding: 0; margin-bottom: var(--space-4)">
      <h2>Reports trend</h2>
      <div class="tabs">
        <button :class="{ active: timeframe === 'week' }" @click="timeframe = 'week'">Week</button>
        <button :class="{ active: timeframe === 'month' }" @click="timeframe = 'month'">Month</button>
      </div>
    </div>
    <div class="chart-wrap">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<style scoped>
.card--padded {
  padding: var(--space-5);
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-head h2 {
  margin: 0;
  font-size: 16px;
}

.chart-wrap {
  height: 240px;
  position: relative;
}

.tabs {
  display: flex;
  gap: 2px;
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 3px;
}

.tabs button {
  background: none;
  border: none;
  padding: var(--space-1) var(--space-3);
  border-radius: calc(var(--radius-md) - 2px);
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-soft);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.tabs button.active {
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
</style>
