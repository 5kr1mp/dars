<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  delta?: string
  trend?: 'up' | 'down' | 'flat'
  tone?: 'primary' | 'warning' | 'danger' | 'success'
  icon?: string
}>()
</script>

<template>
  <div class="stat" :class="`stat--${tone ?? 'primary'}`">
    <div class="stat__head">
      <span class="stat__label">{{ label }}</span>
      <span class="stat__icon" v-if="icon" v-html="icon"></span>
    </div>
    <div class="stat__value">{{ value }}</div>
    <div v-if="delta" class="stat__delta" :class="`stat__delta--${trend ?? 'flat'}`">
      <span v-if="trend === 'up'">▲</span>
      <span v-else-if="trend === 'down'">▼</span>
      <span v-else>—</span>
      {{ delta }}
    </div>
  </div>
</template>

<style scoped>
.stat {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
  overflow: hidden;
}
.stat::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--bar);
}
.stat--primary {
  --bar: var(--color-primary-500);
}
.stat--warning {
  --bar: var(--color-warning);
}
.stat--danger {
  --bar: var(--color-accent-500);
}
.stat--success {
  --bar: var(--color-success);
}
.stat__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.stat__label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-soft);
  font-weight: 600;
}
.stat__icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  color: var(--color-primary-700);
}
.stat__icon svg {
  width: 1.2em;
  height: 1.2em;
}
.stat__value {
  font-size: 30px;
  font-weight: 700;
  font-family: var(--font-display);
  color: var(--color-text);
  letter-spacing: -0.02em;
}
.stat__delta {
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.stat__delta--up {
  color: var(--color-success);
}
.stat__delta--down {
  color: var(--color-danger);
}
.stat__delta--flat {
  color: var(--color-text-soft);
}
</style>
