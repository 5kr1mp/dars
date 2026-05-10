<script setup lang="ts">
import AppButton from '../../components/common/AppButton.vue'
import SeverityPill from '../../components/common/SeverityPill.vue'

const types = [
  { name: 'Physical', severity: 8, law: 'RA 9262, Sec. 5(a)', count: 42 },
  { name: 'Sexual', severity: 10, law: 'RA 9262, Sec. 5(b)', count: 11 },
  { name: 'Psychological', severity: 6, law: 'RA 9262, Sec. 5(i)', count: 27 },
  { name: 'Emotional', severity: 5, law: 'RA 9262, Sec. 5(i)', count: 19 },
  { name: 'Verbal', severity: 3, law: 'RA 9262, Sec. 5(i)', count: 14 },
  { name: 'Economic', severity: 5, law: 'RA 9262, Sec. 5(e)', count: 8 },
  { name: 'Child Abuse', severity: 9, law: 'RA 7610', count: 17 },
  { name: 'Online Harassment', severity: 4, law: 'RA 11313', count: 6 },
]
</script>

<template>
  <div class="page fade-up">
    <div class="page-head">
      <div>
        <h1>Abuse types</h1>
        <p class="muted">Categories used when classifying reports.</p>
      </div>
      <AppButton variant="primary">+ Add Type</AppButton>
    </div>

    <div class="grid types-grid">
      <article v-for="t in types" :key="t.name" class="type-card card">
        <div class="row row--between" style="margin-bottom: 10px">
          <h3 style="margin: 0">{{ t.name }}</h3>
          <span class="count">{{ t.count }}</span>
        </div>
        <SeverityPill :severity="t.severity" />
        <div class="law muted small" style="margin-top: 12px">📜 {{ t.law }}</div>
        <div class="row" style="gap: 6px; margin-top: 14px">
          <button class="link">Edit</button>
          <button class="link danger">Archive</button>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.page-head { display: flex; align-items: end; justify-content: space-between; margin-bottom: 18px; }
.page-head h1 { margin: 0; }

.types-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
.type-card { padding: 18px 20px; transition: transform 0.15s, border-color 0.15s; }
.type-card:hover { transform: translateY(-2px); border-color: var(--color-primary-300); }
.count {
  background: var(--color-primary-50);
  color: var(--color-primary-700);
  font-weight: 700;
  font-size: 13px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
}
.link {
  background: none;
  border: none;
  color: var(--color-primary-700);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}
.link.danger { color: var(--color-danger); }
.link:hover { background: var(--color-surface-alt); }
</style>
