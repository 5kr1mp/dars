<script setup lang="ts">
import StatusBadge from '../../components/common/StatusBadge.vue'
import AppButton from '../../components/common/AppButton.vue'

const responders = [
  { name: 'PNP-WCPD San Isidro', agency: 'PNP', area: 'San Isidro', status: 'Available', cases: 1, contact: '+63 917 555 0142' },
  { name: 'DSWD Crisis Team A', agency: 'DSWD', area: 'Multi', status: 'On The Way', cases: 1, contact: '+63 917 555 0211' },
  { name: 'Brgy. Maligaya VAWC', agency: 'Barangay', area: 'Maligaya', status: 'Available', cases: 0, contact: '+63 917 555 0134' },
  { name: 'PNP-WCPD Bagong Silang', agency: 'PNP', area: 'Bagong Silang', status: 'On Scene', cases: 2, contact: '+63 917 555 0190' },
  { name: 'Haven for Women', agency: 'NGO', area: 'Multi', status: 'Available', cases: 0, contact: '+63 917 555 0177' },
  { name: 'BFP Sta. Maria', agency: 'BFP', area: 'Sta. Maria', status: 'Off Duty', cases: 0, contact: '+63 917 555 0162' },
]

const agencies = [
  { name: 'PNP', count: 14, color: '#2c5fb8' },
  { name: 'DSWD', count: 6, color: '#9c5bb8' },
  { name: 'Barangay VAWC', count: 23, color: '#2c8780' },
  { name: 'BFP', count: 4, color: '#d96e2a' },
  { name: 'NGO Partner', count: 8, color: '#5fa470' },
]
</script>

<template>
  <div class="page fade-up">
    <div class="page-head">
      <div>
        <h1>Responders</h1>
        <p class="muted">Agencies and individuals who respond to incidents.</p>
      </div>
      <div class="row" style="gap: 8px">
        <AppButton variant="secondary">Import</AppButton>
        <AppButton variant="primary">+ Add Responder</AppButton>
      </div>
    </div>

    <div class="grid summary">
      <div v-for="a in agencies" :key="a.name" class="agency-card">
        <span class="agency-dot" :style="{ background: a.color }" />
        <div>
          <strong>{{ a.name }}</strong>
          <div class="muted small">{{ a.count }} units</div>
        </div>
      </div>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>Responder</th>
            <th>Agency</th>
            <th>Coverage</th>
            <th>Status</th>
            <th>Active Cases</th>
            <th>Contact</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in responders" :key="r.name">
            <td>
              <div class="resp-cell">
                <span class="avatar">{{ r.name.split(' ').map(p => p[0]).join('').slice(0,2) }}</span>
                <strong>{{ r.name }}</strong>
              </div>
            </td>
            <td><span class="agency-tag">{{ r.agency }}</span></td>
            <td>{{ r.area }}</td>
            <td><StatusBadge :status="r.status" /></td>
            <td>{{ r.cases }}</td>
            <td class="muted">{{ r.contact }}</td>
            <td>
              <button class="row-link">Manage →</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.page-head { display: flex; align-items: end; justify-content: space-between; margin-bottom: var(--space-4); }
.page-head h1 { margin: 0; }

.summary {
  grid-template-columns: repeat(5, 1fr);
  margin-bottom: var(--space-4);
}
.agency-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.agency-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
}

.resp-cell {
  display: flex;
  align-items: center;
  gap: var(--space-2-5, 10px);
}
.avatar {
  width: 32px; height: 32px;
  background: linear-gradient(135deg, var(--color-primary-400), var(--color-primary-700));
  color: #fff;
  border-radius: 50%;
  font-weight: 700; font-size: 12px;
  display: inline-flex; align-items: center; justify-content: center;
}
.agency-tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  padding: var(--space-1) var(--space-2-5, 9px);
  border-radius: var(--radius-full);
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
}
.row-link {
  background: none; border: none;
  color: var(--color-primary-700);
  cursor: pointer; font-weight: 600; font-size: 13px;
}

@media (max-width: 1100px) {
  .summary { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 720px) {
  .page-head { flex-direction: column; align-items: flex-start; gap: 10px; }
  .summary { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 480px) {
  .summary { grid-template-columns: 1fr; }
}
</style>
