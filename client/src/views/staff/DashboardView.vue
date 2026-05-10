<script setup lang="ts">
import StatCard from '../../components/common/StatCard.vue'
import StatusBadge from '../../components/common/StatusBadge.vue'
import SeverityPill from '../../components/common/SeverityPill.vue'
import AppButton from '../../components/common/AppButton.vue'
import IncidentMap, { type IncidentMarker } from '../../components/common/IncidentMap.vue'

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
</script>

<template>
  <div class="dashboard fade-up">
    <div class="row row--between" style="margin-bottom: 18px">
      <div>
        <h1 style="margin: 0">Good morning, A. Cruz</h1>
        <p class="muted" style="margin: 4px 0 0">
          Here's what's happening across your assigned barangays.
        </p>
      </div>
      <div class="row" style="gap: 8px">
        <AppButton variant="secondary" size="md">Export</AppButton>
        <AppButton variant="primary" size="md">+ New Report</AppButton>
      </div>
    </div>

    <!-- Top stats -->
    <div class="grid stats">
      <StatCard label="Active Reports" :value="12" delta="3 vs yesterday" trend="up" tone="primary" icon="📂" />
      <StatCard label="Avg. Response" value="22m" delta="4m faster" trend="down" tone="success" icon="⏱️" />
      <StatCard label="Critical Cases" :value="3" delta="1 escalated" trend="up" tone="danger" icon="🚨" />
      <StatCard label="Resolved Today" :value="8" delta="On track" trend="flat" tone="success" icon="✅" />
    </div>

    <div class="grid main-grid">
      <!-- Recent Reports -->
      <div class="card recent-reports">
        <div class="card-head">
          <div>
            <h2>Recent reports</h2>
            <p class="muted small">Updated in real time</p>
          </div>
          <div class="row" style="gap: 8px">
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
      <div class="col" style="gap: 16px">
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
        <div class="card-head" style="padding: 0; margin-bottom: 16px">
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
        <div class="card-head" style="padding: 0; margin-bottom: 16px">
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
  </div>
</template>

<style scoped>
.dashboard h1 {
  font-size: 26px;
}

.stats {
  grid-template-columns: repeat(4, 1fr);
  margin-bottom: 22px;
}

.main-grid {
  grid-template-columns: 1.6fr 1fr;
  margin-bottom: 22px;
  align-items: start;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid var(--color-border);
}
.card-head h2 { margin: 0; font-size: 16px; }
.recent-reports .table { font-size: 13px; }
.code-id {
  font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  padding: 2px 6px;
  border-radius: 4px;
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
  padding: 6px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-size: 13px;
}

/* Map */
.map { padding: 14px; }

/* Responders list */
.resp-list { list-style: none; margin: 0; padding: 8px 12px; }
.resp-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 8px;
  border-bottom: 1px solid var(--color-border);
}
.resp-list li:last-child { border-bottom: none; }

/* Bottom */
.bottom-grid {
  grid-template-columns: 1fr 1.4fr;
}

.brgy-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.brgy-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 14px; }
.brgy-name { font-weight: 600; }
.bar {
  height: 8px;
  background: var(--color-surface-alt);
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid var(--color-border);
}
.bar > span {
  display: block;
  height: 100%;
  border-radius: 999px;
  transition: width 0.4s;
}

/* Chart */
.chart { position: relative; height: 200px; }
.chart__grid {
  position: absolute;
  inset: 0 0 24px 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.chart__grid span {
  border-top: 1px dashed var(--color-border);
}
.chart__svg {
  position: absolute;
  inset: 0 0 24px 0;
  width: 100%;
  height: calc(100% - 24px);
}
.chart__axis {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--color-text-soft);
}

@media (max-width: 1200px) {
  .stats { grid-template-columns: repeat(2, 1fr); }
  .main-grid { grid-template-columns: 1fr; }
  .bottom-grid { grid-template-columns: 1fr; }
}
@media (max-width: 720px) {
  .dashboard h1 { font-size: 22px; }
  .stats { grid-template-columns: 1fr 1fr; }
  .recent-reports .card-head { flex-direction: column; align-items: flex-start; gap: 10px; }
}
@media (max-width: 480px) {
  .stats { grid-template-columns: 1fr; }
}
</style>
