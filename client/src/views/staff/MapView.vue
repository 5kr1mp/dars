<script setup lang="ts">
import { computed } from 'vue'
import StatusBadge from '../../components/common/StatusBadge.vue'
import SeverityPill from '../../components/common/SeverityPill.vue'
import IncidentMap, { type IncidentMarker } from '../../components/common/IncidentMap.vue'

const incidents = [
  { id: 'SR-9KX2T1', sev: 8, status: 'On the way', brgy: 'San Isidro', lat: 14.6042, lng: 121.0432 },
  { id: 'SR-7VL83Q', sev: 5, status: 'Dispatched', brgy: 'Maligaya', lat: 14.5898, lng: 121.0511 },
  { id: 'SR-5BG7QR', sev: 9, status: 'Reported', brgy: 'Bagong Silang', lat: 14.6121, lng: 121.0354 },
  { id: 'SR-2KM18A', sev: 3, status: 'Under Investigation', brgy: 'Sta. Maria', lat: 14.5972, lng: 121.0598 },
  { id: 'SR-A4DE19', sev: 10, status: 'Resolved', brgy: 'San Isidro', lat: 14.6088, lng: 121.0476 },
]

const markers = computed<IncidentMarker[]>(() =>
  incidents.map((i) => ({
    id: i.id,
    lat: i.lat,
    lng: i.lng,
    severity: i.sev,
    status: i.status,
    title: i.id,
    subtitle: `Brgy. ${i.brgy}`,
  })),
)
</script>

<template>
  <div class="page fade-up">
    <div class="page-head">
      <div>
        <h1>Live map</h1>
        <p class="muted">Real-time view of incidents across all barangays.</p>
      </div>
      <div class="row" style="gap: 8px">
        <button class="ctrl">🔍 Search</button>
        <button class="ctrl">📍 Center</button>
        <button class="ctrl active">🚨 Active only</button>
      </div>
    </div>

    <div class="grid layout">
      <div class="card map-card">
        <IncidentMap :markers="markers" :center="[14.5995, 121.0498]" :zoom="13" height="70vh" />
      </div>

      <aside class="incidents card">
        <div class="card-head">
          <h3 style="margin: 0">Active incidents</h3>
          <span class="muted small">{{ incidents.length }}</span>
        </div>
        <ul class="incident-list">
          <li v-for="p in incidents" :key="p.id">
            <div class="row row--between" style="margin-bottom: 4px">
              <code class="code-id">{{ p.id }}</code>
              <SeverityPill :severity="p.sev" />
            </div>
            <div class="muted small">Brgy. {{ p.brgy }}</div>
            <StatusBadge :status="p.status" />
          </li>
        </ul>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.page-head { display: flex; align-items: end; justify-content: space-between; margin-bottom: 18px; }
.page-head h1 { margin: 0; }
.ctrl {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: 8px 12px;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}
.ctrl.active { background: var(--color-primary-50); color: var(--color-primary-700); border-color: var(--color-primary-300); }

.layout { grid-template-columns: 1fr 320px; align-items: start; }

.map-card { padding: 12px; overflow: hidden; }
.map-card :deep(.map-wrap) { border-radius: var(--radius-md); }

.incidents { padding: 0; position: sticky; top: 84px; max-height: calc(100vh - 96px); overflow-y: auto; }
.card-head { padding: 14px 18px; border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; }
.incident-list { list-style: none; padding: 8px; margin: 0; display: flex; flex-direction: column; gap: 6px; }
.incident-list li {
  padding: 12px 14px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface-alt);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.incident-list li:hover {
  border-color: var(--color-primary-300);
  background: var(--color-primary-50);
}
.code-id {
  font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
  background: #fff;
  border: 1px solid var(--color-border);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

@media (max-width: 1100px) {
  .layout { grid-template-columns: 1fr; }
  .incidents { position: static; }
}
</style>
