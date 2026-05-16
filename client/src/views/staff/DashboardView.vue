<script setup lang="ts">
import type {Report} from '@/types';
import { computed , onMounted, ref, toRefs} from 'vue'
import StatCard from '../../components/common/StatCard.vue'
import StatusBadge from '../../components/common/StatusBadge.vue'
import SeverityPill from '../../components/common/SeverityPill.vue'
import AppButton from '../../components/common/AppButton.vue'
import { useAuth } from '@/services/auth'
import { api } from '@/services/api'
import IncidentMap, { type IncidentMarker } from '../../components/common/IncidentMap.vue'

const {user , barangay} = useAuth();

const userShortName = computed( () => {
  if (!user.value) return ''
  return `${user.value.first_name[0]}. ${user.value.last_name}`
})

const reports = ref<Report[]>([])
const loading = ref(false);
const error = ref('')

onMounted(() => {
  loadReports()
})

const mapMarkers: IncidentMarker[] = [
  { lat: 14.6042, lng: 121.0432, severity: 8, status: 'On the way', title: 'SR-9KX2T1', subtitle: 'Brgy. San Isidro' },
  { lat: 14.5898, lng: 121.0511, severity: 5, status: 'Dispatched', title: 'SR-7VL83Q', subtitle: 'Brgy. Maligaya' },
  { lat: 14.6121, lng: 121.0354, severity: 9, status: 'Reported', title: 'SR-5BG7QR', subtitle: 'Brgy. Bagong Silang' },
  { lat: 14.5972, lng: 121.0598, severity: 3, status: 'Investigating', title: 'SR-2KM18A', subtitle: 'Brgy. Sta. Maria' },
  { lat: 14.6088, lng: 121.0476, severity: 10, status: 'Resolved', title: 'SR-A4DE19', subtitle: 'Brgy. San Isidro' },
]

const recentReports = [
  { id: 'SR-9KX2T1', victim: 'Confidential', barangay: 'San Isidro', type: 'Physical', severity: 8, status: 'On the way', time: '2 min ago' },
  { id: 'SR-7VL83Q', victim: 'M. Reyes', barangay: 'Maligaya', type: 'Emotional', severity: 5, status: 'Dispatched', time: '14 min ago' },
  { id: 'SR-5BG7QR', victim: 'Anonymous', barangay: 'Bagong Silang', type: 'Physical', severity: 9, status: 'Reported', time: '22 min ago' },
  { id: 'SR-2KM18A', victim: 'L. Santos', barangay: 'Sta. Maria', type: 'Verbal', severity: 3, status: 'Under Investigation', time: '1 hr ago' },
  { id: 'SR-A4DE19', victim: 'Confidential', barangay: 'San Isidro', type: 'Sexual', severity: 10, status: 'Resolved', time: '3 hr ago' },
]

const barangayActivity = [
  { name: 'Brgy. San Isidro', open: 4, total: 18, severity: 'high' },
  { name: 'Brgy. Maligaya', open: 2, total: 11, severity: 'mod' },
  { name: 'Brgy. Bagong Silang', open: 5, total: 22, severity: 'high' },
  { name: 'Brgy. Sta. Maria', open: 1, total: 7, severity: 'low' },
  { name: 'Brgy. Mabini', open: 0, total: 3, severity: 'low' },
]

const responders = [
  { name: 'PNP-WCPD San Isidro', agency: 'PNP', status: 'Available', cases: 1 },
  { name: 'DSWD Crisis Team A', agency: 'DSWD', status: 'On The Way', cases: 1 },
  { name: 'Brgy. Maligaya VAWC', agency: 'Barangay', status: 'Available', cases: 0 },
  { name: 'PNP-WCPD Bagong Silang', agency: 'PNP', status: 'On Scene', cases: 2 },
]

async function loadReports(){
  loading.value = true;
  error.value = '';

  try {

    // if (!user.value){
    //   throw new Error("User Not Authenticated")
    // }

    // const result = await api.get<Report[]>(`/reports?barangay_id=${encodeURIComponent(user.value!.barangay_id)}`)
    const result = await api.get<Report[]>(`/reports?barangay_id=${encodeURIComponent(1)}`)

    if (result.status === 'error'){
      throw new Error(result.message);
    }

    reports.value = result.data;
  } catch (err:any) {
    error.value = err.message || "Something went wrong."
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="dashboard fade-up">
    <div v-if="loading" class="muted">Loading dashboard…</div>

    <div v-else-if="error" class="error-message">{{ error }}</div>

    <template v-else>
      <div class="row row--between" style="margin-bottom: var(--space-4)">
        <div v-if="user">
          <h1>{{ userShortName }}</h1>
          <p class="muted" style="margin: var(--space-1) 0 0">
            Here's what's happening across {{ barangay }}.
          </p>
        </div>
      </div>
  
      <!-- Top stats -->
      <div class="grid stats">
        <StatCard label="Active Reports" :value="12" delta="3 vs yesterday" trend="up" tone="primary" :icon="`<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z'></path><path d='M2 10h20'></path></svg>`" />
        <StatCard label="Avg. Response" value="22m" delta="4m faster" trend="down" tone="success" :icon="`<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'></circle><polyline points='12,6 12,12 16,14'></polyline></svg>`" />
        <StatCard label="Critical Cases" :value="3" delta="1 escalated" trend="up" tone="danger" :icon="`<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z'></path><line x1='12' x2='12' y1='9' y2='13'></line><line x1='12' x2='12.01' y1='17' y2='17'></line></svg>`" />
        <StatCard label="Resolved Today" :value="8" delta="On track" trend="flat" tone="success" :icon="`<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M22 11.08V12a10 10 0 1 1-5.93-9.14'></path><polyline points='22,4 12,14.01 9,11.01'></polyline></svg>`" />
      </div>
  
      <div class="grid main-grid">
        <!-- Recent Reports -->
        <div class="card recent-reports">
          <div class="card-head">
            <div>
              <h2>Recent reports</h2>
              <p class="muted small">Updated in real time</p>
            </div>
            <div class="row" style="gap: var(--space-2)">
              <select class="select-mini">
                <option>All barangays</option>
                <option>Brgy. San Isidro</option>
                <option>Brgy. Maligaya</option>
              </select>
              <select class="select-mini">
                <option>All status</option>
                <option>Reported</option>
                <option>Dispatched</option>
                <option>Resolved</option>
              </select>
            </div>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Victim</th>
                <th>Barangay</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Time</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in recentReports" :key="r.id">
                <td><code class="code-id">{{ r.id }}</code></td>
                <td>{{ r.victim }}</td>
                <td>{{ r.barangay }}</td>
                <td>{{ r.type }}</td>
                <td><SeverityPill :severity="r.severity" /></td>
                <td><StatusBadge :status="r.status" /></td>
                <td class="muted">{{ r.time }}</td>
                <td>
                  <button class="row-link">View →</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <!-- Side column -->
        <div class="col" style="gap: var(--space-4)">
          <!-- Live map preview -->
          <div class="card map-preview">
            <div class="card-head">
              <h2>Live map</h2>
              <span class="muted small">{{ mapMarkers.length }} active</span>
            </div>
            <div class="map">
              <IncidentMap
                :markers="mapMarkers"
                :center="[14.5995, 121.0498]"
                :zoom="13"
                height="240px"
              />
            </div>
          </div>
  
          <!-- Responders -->
          <div class="card">
            <div class="card-head">
              <h2>Responders</h2>
              <a href="#" class="muted small">Manage →</a>
            </div>
            <ul class="resp-list">
              <li v-for="r in responders" :key="r.name">
                <div>
                  <strong>{{ r.name }}</strong>
                  <div class="muted small">{{ r.agency }} · {{ r.cases }} active</div>
                </div>
                <StatusBadge :status="r.status" />
              </li>
            </ul>
          </div>
        </div>
      </div>
  
      <!-- Bottom: barangay & trend -->
      <div class="grid bottom-grid">
        <div class="card card--padded">
          <div class="card-head" style="padding: 0; margin-bottom: var(--space-4)">
            <h2>Barangay activity</h2>
            <span class="muted small">This week</span>
          </div>
          <ul class="brgy-list">
            <li v-for="b in barangayActivity" :key="b.name">
              <div class="brgy-row">
                <span class="brgy-name">{{ b.name }}</span>
                <span class="brgy-meta muted small">{{ b.open }} open · {{ b.total }} total</span>
              </div>
              <div class="bar">
                <span :style="{ width: (b.total / 22) * 100 + '%', background: b.severity === 'high' ? 'var(--sev-high)' : b.severity === 'mod' ? 'var(--sev-mod)' : 'var(--sev-low)' }" />
              </div>
            </li>
          </ul>
        </div>
  
        <div class="card card--padded">
          <div class="card-head" style="padding: 0; margin-bottom: var(--space-4)">
            <h2>Reports trend</h2>
            <span class="muted small">Last 7 days</span>
          </div>
          <div class="chart">
            <div class="chart__grid">
              <span></span><span></span><span></span><span></span>
            </div>
            <svg viewBox="0 0 320 130" preserveAspectRatio="none" class="chart__svg">
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#2c8780" stop-opacity="0.4" />
                  <stop offset="100%" stop-color="#2c8780" stop-opacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,90 L46,72 L92,84 L138,52 L184,60 L230,30 L276,42 L320,18 L320,130 L0,130 Z"
                fill="url(#g1)"
              />
              <path
                d="M0,90 L46,72 L92,84 L138,52 L184,60 L230,30 L276,42 L320,18"
                fill="none"
                stroke="#2c8780"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <g fill="#2c8780">
                <circle cx="0" cy="90" r="3.5"/>
                <circle cx="46" cy="72" r="3.5"/>
                <circle cx="92" cy="84" r="3.5"/>
                <circle cx="138" cy="52" r="3.5"/>
                <circle cx="184" cy="60" r="3.5"/>
                <circle cx="230" cy="30" r="3.5"/>
                <circle cx="276" cy="42" r="3.5"/>
                <circle cx="320" cy="18" r="3.5"/>
              </g>
            </svg>
            <div class="chart__axis">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span>
              <span>Fri</span><span>Sat</span><span>Sun</span><span>Today</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.dashboard {
  display: grid;
  gap: var(--space-6);
}

.error-message {
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: rgba(255, 0, 0, 0.08);
  color: var(--color-danger);
  font-weight: 600;
}

.dashboard h1 {
  font-size: 28px;
  margin: 0;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.main-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: var(--space-5);
  margin-bottom: var(--space-6);
  align-items: start;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border);
}
.card-head h2 {
  margin: 0;
  font-size: 16px;
}

.recent-reports .table {
  font-size: 13px;
}

.code-id {
  font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: 12px;
}

.row-link {
  background: none;
  border: none;
  color: var(--color-primary-700);
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
}

.select-mini {
  min-width: 140px;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-size: 13px;
  color: var(--color-text);
}

.map {
  padding: var(--space-4);
}

.resp-list {
  list-style: none;
  margin: 0;
  padding: var(--space-3);
}
.resp-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--color-border);
}
.resp-list li:last-child {
  border-bottom: none;
}

.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: var(--space-5);
}

.brgy-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: var(--space-4);
}
.brgy-row {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
  font-size: 14px;
}
.brgy-name {
  font-weight: 600;
}
.bar {
  height: var(--space-2);
  background: var(--color-surface-alt);
  border-radius: var(--radius-full);
  overflow: hidden;
  border: 1px solid var(--color-border);
}
.bar > span {
  display: block;
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.4s ease;
}

.chart {
  position: relative;
  min-height: 224px;
}
.chart__grid {
  position: absolute;
  inset: 0 0 var(--space-6) 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.chart__grid span {
  border-top: 1px dashed var(--color-border);
}
.chart__svg {
  position: absolute;
  inset: 0 0 var(--space-6) 0;
  width: 100%;
  height: calc(100% - var(--space-6));
}
.chart__axis {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  font-size: 11px;
  color: var(--color-text-soft);
}
.chart__axis span {
  text-align: center;
}

@media (max-width: 1200px) {
  .stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .main-grid,
  .bottom-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .dashboard h1 {
    font-size: 22px;
  }
  .recent-reports .card-head {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }
}

@media (max-width: 480px) {
  .stats {
    grid-template-columns: 1fr;
  }
}
</style>
