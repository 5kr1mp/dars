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
      <div class="row" style="gap: var(--space-2)">
        <button class="ctrl"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px; display: inline;"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>Search</button>
        <button class="ctrl"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px; display: inline;"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24,7.76 14,12 16.24,16.24 12,14 7.76,16.24 10,12 7.76,7.76 12,10"></polygon></svg>Center</button>
        <button class="ctrl active"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px; display: inline;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" x2="12" y1="9" y2="13"></line><line x1="12" x2="12.01" y1="17" y2="17"></line></svg>Active only</button>
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
.page-head { display: flex; align-items: end; justify-content: space-between; margin-bottom: var(--space-4); }
.page-head h1 { margin: 0; }
.ctrl {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}
.ctrl.active { background: var(--color-primary-50); color: var(--color-primary-700); border-color: var(--color-primary-300); }

.layout { grid-template-columns: 1fr 320px; align-items: start; }

.map-card { padding: var(--space-3); overflow: hidden; }
.map-card :deep(.map-wrap) { border-radius: var(--radius-md); }

.incidents { padding: 0; position: sticky; top: var(--topbar-h); max-height: calc(100vh - 96px); overflow-y: auto; }
.card-head { padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; }
.incident-list { list-style: none; padding: var(--space-2); margin: 0; display: flex; flex-direction: column; gap: var(--space-1-5, 6px); }
.incident-list li {
  padding: var(--space-3) var(--space-4);
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
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: 11px;
}

@media (max-width: 1100px) {
  .layout { grid-template-columns: 1fr; }
  .incidents { position: static; }
}
</style>
