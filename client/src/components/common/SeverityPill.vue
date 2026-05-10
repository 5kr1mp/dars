<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ severity: number }>()

const meta = computed(() => {
  const s = props.severity
  if (s <= 3) return { label: 'Low', color: 'var(--sev-low)' }
  if (s <= 6) return { label: 'Moderate', color: 'var(--sev-mod)' }
  if (s <= 8) return { label: 'High', color: 'var(--sev-high)' }
  return { label: 'Critical', color: 'var(--sev-crit)' }
})
</script>

<template>
  <span class="pill" :style="{ '--pill-color': meta.color }">
    <span class="bar"><span :style="{ width: `${Math.min(severity, 10) * 10}%` }" /></span>
    <span class="label">{{ meta.label }}</span>
  </span>
</template>

<style scoped>
.pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--pill-color);
}
.bar {
  display: inline-block;
  width: 60px;
  height: 6px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 999px;
  overflow: hidden;
}
.bar > span {
  display: block;
  height: 100%;
  background: var(--pill-color);
  border-radius: 999px;
}
</style>
