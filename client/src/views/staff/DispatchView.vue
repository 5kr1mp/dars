<script setup lang="ts">
import StatusBadge from '../../components/common/StatusBadge.vue'
import SeverityPill from '../../components/common/SeverityPill.vue'
import AppButton from '../../components/common/AppButton.vue'

interface DispatchCard {
  id: string
  sev: number
  type: string
  brgy: string
  age: string
  responder?: string
}
interface DispatchColumn {
  key: string
  title: string
  color: string
  cards: DispatchCard[]
}

const columns: DispatchColumn[] = [
  {
    key: 'queue',
    title: 'New / Triage',
    color: 'var(--color-info)',
    cards: [
      { id: 'SR-5BG7QR', sev: 9, type: 'Physical', brgy: 'Bagong Silang', age: '22m' },
      { id: 'SR-X8MN31', sev: 6, type: 'Emotional', brgy: 'Maligaya', age: '34m' },
    ],
  },
  {
    key: 'assigned',
    title: 'Assigned',
    color: 'var(--color-warning)',
    cards: [
      { id: 'SR-7VL83Q', sev: 5, type: 'Emotional', brgy: 'Maligaya', age: '14m', responder: 'DSWD Crisis A' },
      { id: 'SR-T9Z2P0', sev: 9, type: 'Child Abuse', brgy: 'Maligaya', age: '1h', responder: 'PNP-WCPD' },
    ],
  },
  {
    key: 'enroute',
    title: 'On the Way',
    color: 'var(--color-warning)',
    cards: [
      { id: 'SR-9KX2T1', sev: 8, type: 'Physical', brgy: 'San Isidro', age: '2m', responder: 'PNP-WCPD' },
    ],
  },
  {
    key: 'onsite',
    title: 'On Scene',
    color: 'var(--color-info)',
    cards: [
      { id: 'SR-2KM18A', sev: 3, type: 'Verbal', brgy: 'Sta. Maria', age: '1h', responder: 'Brgy. VAWC' },
    ],
  },
  {
    key: 'completed',
    title: 'Completed',
    color: 'var(--color-success)',
    cards: [
      { id: 'SR-A4DE19', sev: 10, type: 'Sexual', brgy: 'San Isidro', age: '3h', responder: 'PNP-WCPD' },
      { id: 'SR-Q11W3X', sev: 4, type: 'Economic', brgy: 'Mabini', age: '13h', responder: 'DSWD' },
    ],
  },
]
</script>

<template>
  <div class="page fade-up">
    <div class="page-head">
      <div>
        <h1>Dispatch board</h1>
        <p class="muted">Drag cases between columns to update their dispatch status.</p>
      </div>
      <div class="row" style="gap: 8px">
        <AppButton variant="secondary">Filter</AppButton>
        <AppButton variant="primary">+ New Dispatch</AppButton>
      </div>
    </div>

    <div class="board">
      <div v-for="col in columns" :key="col.key" class="col">
        <div class="col__head" :style="{ '--accent': col.color }">
          <span class="col__title">{{ col.title }}</span>
          <span class="col__count">{{ col.cards.length }}</span>
        </div>
        <div class="col__list">
          <article v-for="c in col.cards" :key="c.id" class="card-item">
            <div class="row row--between">
              <code class="code-id">{{ c.id }}</code>
              <span class="muted small">{{ c.age }} ago</span>
            </div>
            <h3>{{ c.type }} · {{ c.brgy }}</h3>
            <SeverityPill :severity="c.sev" />
            <div v-if="c.responder" class="responder-tag">
              <span class="resp-avatar">{{ c.responder!.split(' ').map((p: string) => p[0]).join('').slice(0,2) }}</span>
              <span>{{ c.responder }}</span>
            </div>
            <div v-else class="responder-tag empty">
              <span>Unassigned · </span>
              <button class="link">Assign responder</button>
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-head { display: flex; align-items: end; justify-content: space-between; margin-bottom: 18px; }
.page-head h1 { margin: 0; }

.board {
  display: grid;
  grid-template-columns: repeat(5, minmax(260px, 1fr));
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 10px;
  scroll-snap-type: x proximity;
}
.col { scroll-snap-align: start; }
@media (max-width: 720px) {
  .page-head { flex-direction: column; align-items: flex-start; gap: 10px; }
  .board { grid-auto-flow: column; grid-template-columns: none; grid-auto-columns: 86%; }
}

.col {
  display: flex;
  flex-direction: column;
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  min-height: 70vh;
}
.col__head {
  padding: 14px 16px 10px;
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid var(--color-border);
  position: relative;
}
.col__head::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 4px; height: 100%;
  background: var(--accent);
  border-radius: var(--radius-lg) 0 0 0;
}
.col__title { font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.04em; }
.col__count {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  padding: 1px 9px;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-muted);
}

.col__list {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.card-item {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: grab;
  transition: transform 0.1s, box-shadow 0.15s, border-color 0.15s;
}
.card-item:hover {
  border-color: var(--color-primary-300);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}
.card-item h3 {
  font-size: 14px;
  margin: 0;
}
.code-id {
  font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
  font-size: 11px;
  background: var(--color-surface-alt);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid var(--color-border);
}
.responder-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: var(--color-surface-alt);
  border-radius: var(--radius-md);
  font-size: 12px;
  color: var(--color-text-muted);
}
.responder-tag.empty {
  color: var(--color-text-soft);
  border: 1px dashed var(--color-border-strong);
  background: transparent;
}
.resp-avatar {
  width: 22px; height: 22px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary-400), var(--color-primary-700));
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: inline-flex; align-items: center; justify-content: center;
}
.link {
  background: none; border: none;
  color: var(--color-primary-700);
  cursor: pointer;
  font-weight: 600;
  font-size: 12px;
  padding: 0;
}
</style>
