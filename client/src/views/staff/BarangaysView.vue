<script setup lang="ts">
import { computed } from 'vue'
import AppButton from '../../components/common/AppButton.vue'
import StatusBadge from '../../components/common/StatusBadge.vue'
import IncidentMap, {
  type IncidentMarker,
  type CoverageZone,
} from '../../components/common/IncidentMap.vue'

const barangays = [
  { id: 1, name: 'Brgy. San Isidro', open: 4, total: 18, lat: 14.6042, lng: 121.0432, radius: 1.2, captain: 'Hon. R. Garcia', state: 'Active' },
  { id: 2, name: 'Brgy. Maligaya', open: 2, total: 11, lat: 14.5898, lng: 121.0511, radius: 1.0, captain: 'Hon. M. Diaz', state: 'Active' },
  { id: 3, name: 'Brgy. Bagong Silang', open: 5, total: 22, lat: 14.6121, lng: 121.0354, radius: 1.5, captain: 'Hon. P. Lim', state: 'Active' },
  { id: 4, name: 'Brgy. Sta. Maria', open: 1, total: 7, lat: 14.5972, lng: 121.0598, radius: 0.8, captain: 'Hon. J. Fernandez', state: 'Active' },
  { id: 5, name: 'Brgy. Mabini', open: 0, total: 3, lat: 14.5803, lng: 121.0411, radius: 0.6, captain: 'Hon. A. Reyes', state: 'Inactive' },
]

const markers = computed<IncidentMarker[]>(() =>
  barangays.map((b) => ({
    id: b.id,
    lat: b.lat,
    lng: b.lng,
    title: b.name,
    subtitle: `${b.open} open · ${b.total} total reports`,
  })),
)

const zones = computed<CoverageZone[]>(() =>
  barangays.map((b) => ({ lat: b.lat, lng: b.lng, radius: b.radius, label: b.name })),
)
</script>

<template>
  <div class="page fade-up">
    <div class="page-head">
      <div>
        <h1>Barangays</h1>
        <p class="muted">Coverage areas, response zones, and per-barangay activity.</p>
      </div>
      <div class="row" style="gap: 8px">
        <AppButton variant="secondary">Map view</AppButton>
        <AppButton variant="primary">+ Add Barangay</AppButton>
      </div>
    </div>

    <div class="grid layout">
      <div class="card">
        <table class="table">
          <thead>
            <tr>
              <th>Barangay</th>
              <th>Open</th>
              <th>Total</th>
              <th>Captain</th>
              <th>Coverage</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in barangays" :key="b.id">
              <td>
                <div class="brgy-cell">
                  <span class="brgy-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path></svg></span>
                  <div>
                    <strong>{{ b.name }}</strong>
                    <div class="muted small">{{ b.lat.toFixed(4) }}, {{ b.lng.toFixed(4) }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="open-pill" :class="{ hot: b.open >= 4 }">{{ b.open }}</span>
              </td>
              <td class="muted">{{ b.total }}</td>
              <td>{{ b.captain }}</td>
              <td>{{ b.radius }} km</td>
              <td><StatusBadge :status="b.state" /></td>
              <td><button class="row-link">Edit →</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <aside class="map-card card">
        <div class="card-head">
          <h3 style="margin: 0">Coverage map</h3>
          <span class="muted small">{{ barangays.length }} barangays</span>
        </div>
        <div class="map">
          <IncidentMap
            :markers="markers"
            :zones="zones"
            :center="[14.5995, 121.0498]"
            :zoom="13"
            height="380px"
            :show-legend="false"
          />
        </div>
        <div class="legend">
          <span><i class="zone-i" />Coverage zone</span>
          <span><i class="pin-i" />Barangay center</span>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.page-head { display: flex; align-items: end; justify-content: space-between; margin-bottom: var(--space-4); }
.page-head h1 { margin: 0; }
.layout { grid-template-columns: 1.6fr 1fr; align-items: start; }

.brgy-cell { display: flex; align-items: center; gap: var(--space-3); }
.brgy-icon {
  width: 36px; height: 36px;
  background: var(--color-primary-50);
  border-radius: var(--radius-md);
  display: inline-flex; align-items: center; justify-content: center;
  color: var(--color-primary-600);
}
.open-pill {
  display: inline-block;
  min-width: 28px;
  text-align: center;
  padding: 3px 9px;
  border-radius: var(--radius-full);
  background: var(--color-info-bg);
  color: var(--color-info);
  font-weight: 700;
  font-size: 13px;
}
.open-pill.hot {
  background: var(--color-danger-bg);
  color: var(--color-danger);
}
.row-link {
  background: none; border: none;
  color: var(--color-primary-700);
  cursor: pointer; font-weight: 600; font-size: 13px;
}

.map-card { padding: 0; position: sticky; top: 84px; }
.card-head { padding: 14px 18px; border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; }
.map { padding: 16px; }
.legend {
  display: flex;
  gap: 18px;
  padding: 0 16px 18px;
  font-size: 12px;
  color: var(--color-text-muted);
}
.legend i {
  display: inline-block;
  width: 12px; height: 12px;
  margin-right: 6px;
  vertical-align: middle;
}
.zone-i {
  border-radius: 50%;
  background: rgba(44,135,128,0.22);
  border: 2px dashed var(--color-primary-500);
}
.pin-i {
  border-radius: 50%;
  background: var(--color-primary-700);
}

@media (max-width: 1100px) {
  .layout { grid-template-columns: 1fr; }
  .map-card { position: static; }
}
@media (max-width: 720px) {
  .page-head { flex-direction: column; align-items: flex-start; gap: 10px; }
}
</style>
