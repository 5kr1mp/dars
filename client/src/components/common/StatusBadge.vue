<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: string
  tone?: 'auto' | 'neutral' | 'info' | 'success' | 'warning' | 'danger'
}>()

const tone = computed(() => {
  if (props.tone && props.tone !== 'auto') return props.tone
  const s = props.status.toLowerCase()
  if (['reported', 'pending', 'assigned', 'queued'].includes(s)) return 'info'
  if (['dispatched', 'on the way', 'on_the_way', 'in progress', 'under investigation'].includes(s))
    return 'warning'
  if (['resolved', 'completed', 'closed'].includes(s)) return 'success'
  if (['critical', 'cancelled', 'failed', 'high'].includes(s)) return 'danger'
  return 'neutral'
})
</script>

<template>
  <span class="badge" :class="`badge--${tone}`">
    <span class="dot" />
    <slot>{{ status }}</slot>
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.01em;
  border: 1px solid transparent;
  text-transform: capitalize;
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.85;
}
.badge--neutral {
  background: #eef0f3;
  color: #525a68;
  border-color: #dee1e7;
}
.badge--info {
  background: var(--color-info-bg);
  color: var(--color-info);
  border-color: #cfdcef;
}
.badge--success {
  background: var(--color-success-bg);
  color: var(--color-success);
  border-color: #c5e6d3;
}
.badge--warning {
  background: var(--color-warning-bg);
  color: var(--color-warning);
  border-color: #f0deae;
}
.badge--danger {
  background: var(--color-danger-bg);
  color: var(--color-danger);
  border-color: #f3c8c1;
}
</style>
