<script setup lang="ts">
defineProps<{
  steps: { title: string; description?: string }[]
  current: number
}>()
</script>

<template>
  <ol class="steps">
    <li
      v-for="(s, i) in steps"
      :key="i"
      class="step"
      :class="{
        'step--done': i < current,
        'step--active': i === current,
      }"
    >
      <div class="step__circle">
        <svg
          v-if="i < current"
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span v-else>{{ i + 1 }}</span>
      </div>
      <div class="step__body">
        <div class="step__title">{{ s.title }}</div>
        <div v-if="s.description" class="step__desc">{{ s.description }}</div>
      </div>
    </li>
  </ol>
</template>

<style scoped>
.steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 6px;
  width: 100%;
}
.step {
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border-radius: var(--radius-md);
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
}
.step--active {
  background: var(--color-primary-50);
  border-color: var(--color-primary-200);
}
.step--done {
  background: var(--color-success-bg);
  border-color: #c5e6d3;
}
.step__circle {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
}
.step--active .step__circle {
  background: var(--color-primary-600);
  color: #fff;
  border-color: var(--color-primary-600);
}
.step--done .step__circle {
  background: var(--color-success);
  color: #fff;
  border-color: var(--color-success);
}
.step__title {
  font-weight: 600;
  font-size: 13px;
}
.step__desc {
  font-size: 12px;
  color: var(--color-text-soft);
}

@media (max-width: 640px) {
  .steps {
    flex-direction: column;
  }
}
</style>
