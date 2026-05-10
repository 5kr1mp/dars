<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
  type?: 'button' | 'submit'
}>()
</script>

<template>
  <button
    :type="type ?? 'button'"
    class="btn"
    :class="[`btn--${variant ?? 'primary'}`, `btn--${size ?? 'md'}`, { 'btn--block': block }]"
  >
    <slot name="icon-left" />
    <span class="btn__label"><slot /></span>
    <slot name="icon-right" />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.05s, background 0.15s, border-color 0.15s, box-shadow 0.15s;
  white-space: nowrap;
}
.btn:active {
  transform: translateY(1px);
}
.btn--block {
  width: 100%;
}

.btn--sm {
  font-size: 13px;
  padding: 7px 12px;
}
.btn--md {
  font-size: 14px;
  padding: 10px 16px;
}
.btn--lg {
  font-size: 15px;
  padding: 13px 22px;
}

.btn--primary {
  background: var(--color-primary-600);
  color: #fff;
}
.btn--primary:hover {
  background: var(--color-primary-700);
}

.btn--secondary {
  background: var(--color-surface);
  border-color: var(--color-border-strong);
  color: var(--color-text);
}
.btn--secondary:hover {
  background: var(--color-surface-alt);
  border-color: var(--color-primary-400);
}

.btn--ghost {
  background: transparent;
  color: var(--color-text);
}
.btn--ghost:hover {
  background: var(--color-surface-alt);
}

.btn--danger {
  background: var(--color-danger);
  color: #fff;
}
.btn--danger:hover {
  background: #a3311f;
}

.btn--accent {
  background: var(--color-accent-500);
  color: #fff;
}
.btn--accent:hover {
  background: var(--color-accent-600);
}
</style>
