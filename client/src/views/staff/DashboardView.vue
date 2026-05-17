<script setup lang="ts">
import type { Report, ReportStatus, ReportSummary } from '@/types'
import { computed, onMounted, ref } from 'vue'
import StatCard from '../../components/common/StatCard.vue'
import StatusBadge from '../../components/common/StatusBadge.vue'
import SeverityPill from '../../components/common/SeverityPill.vue'
import ReportsTrendChart from '../../components/common/ReportsTrendChart.vue'
import { socket } from '@/services/socket'
import { useAuth } from '@/services/auth'
import { api } from '@/services/api'
import IncidentMap, { type IncidentMarker } from '../../components/common/IncidentMap.vue'
import { formatTimestamp } from '@/utils/format'

const { user, barangay, role } = useAuth()

const userShortName = computed(() => {
  if (!user.value) return ''
  return `${user.value.first_name[0]}. ${user.value.last_name}`
})

const reports = ref<Report[]>([])
const loading = ref(false)
const error = ref('')

const mapMarkers = computed<IncidentMarker[]>(() =>
  reports.value.map(report => ({
    lat: report.latitude,
    lng: report.longitude,
    severity: report.severity,
    status: report.report_status,
    title: report.report_id,
    subtitle: `Brgy. ${barangay.value}`,
  } as IncidentMarker))
)

// ─── Stat card computeds ──────────────────────────────────────
const activeReports = computed(() =>
  reports.value.filter(r => r.report_status !== 'Resolved').length
)
const criticalCases = computed(() =>
  reports.value.filter(r => r.severity >= 8).length
)
const resolvedCount = computed(() =>
  reports.value.filter(r => r.report_status === 'Resolved').length
)

// ─── Barangay activity (stub — admin only) ────────────────────
const barangayActivity = [
  { name: 'Brgy. San Isidro',    open: 4, total: 18, severity: 'high' },
  { name: 'Brgy. Maligaya',      open: 2, total: 11, severity: 'mod'  },
  { name: 'Brgy. Bagong Silang', open: 5, total: 22, severity: 'high' },
  { name: 'Brgy. Sta. Maria',    open: 1, total:  7, severity: 'low'  },
  { name: 'Brgy. Mabini',        open: 0, total:  3, severity: 'low'  },
]

const recentReports = computed<ReportSummary[]>(() =>
  reports.value.map(r => ({
    report_id:    r.report_id,
    victim_name:  r.victim_name,
    barangay_name: r.barangay_name,
    abuse_name:   r.abuse_name,
    severity:     r.severity,
    report_status: r.report_status,
    reported_time: r.reported_at,
  } as ReportSummary))
)

type SortKey = keyof ReportSummary

const sortKey = ref<SortKey | null>(null)
const sortDir = ref<'asc' | 'desc'>('asc')

function toggleSort(key: SortKey) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

const sortedReports = computed(() => {
  if (!sortKey.value) return recentReports.value
  const key = sortKey.value
  return [...recentReports.value].sort((a, b) => {
    const av = a[key], bv = b[key]
    const cmp = typeof av === 'number'
      ? (av as number) - (bv as number)
      : String(av).localeCompare(String(bv))
    return sortDir.value === 'asc' ? cmp : -cmp
  })
})

function sortIcon(key: SortKey): string {
  if (sortKey.value !== key) return '↕'
  return sortDir.value === 'asc' ? '↑' : '↓'
}

onMounted(() => loadReports())

async function loadReports() {
  loading.value = true
  error.value = ''
  try {
    const barangayId = user.value?.barangay_id
    const query = barangayId ? `?barangay_id=${barangayId}` : ''
    const result = await api.get<Report[]>(`/reports${query}`)
    if (result.status === 'error') throw new Error(result.message)
    reports.value = result.data
  } catch (err: any) {
    error.value = err.message || 'Something went wrong.'
  } finally {
    loading.value = false
  }
}

socket.on("report:new", (payload : Report) =>{
  reports.value.push(payload)
})

socket.on("report:status", (payload: { report_id: string, new_status: ReportStatus }) => {
  const report = reports.value.find(r => r.report_id === payload.report_id)
  if (report) report.report_status = payload.new_status
})
</script>

<template>
  <div class="dashboard fade-up">
    <div v-if="loading" class="muted">Loading dashboard…</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>

    <template v-else>
      <!-- Header -->
      <div class="row row--between" style="margin-bottom: var(--space-4)">
        <div v-if="user">
          <h1>{{ userShortName }}</h1>
          <p class="muted" style="margin: var(--space-1) 0 0">
            Here's what's happening across {{ barangay }}.
          </p>
        </div>
      </div>

      <!-- Stat cards (3) -->
      <div class="grid stats">
        <StatCard
          label="Active Reports"
          :value="activeReports"
          :delta="`${reports.length} total`"
          trend="flat"
          tone="primary"
          :icon="`<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z'></path><path d='M2 10h20'></path></svg>`"
        />
        <StatCard
          label="Critical Cases"
          :value="criticalCases"
          :delta="criticalCases > 0 ? 'Requires attention' : 'None active'"
          :trend="criticalCases > 0 ? 'up' : 'flat'"
          tone="danger"
          :icon="`<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z'></path><line x1='12' x2='12' y1='9' y2='13'></line><line x1='12' x2='12.01' y1='17' y2='17'></line></svg>`"
        />
        <StatCard
          label="Resolved"
          :value="resolvedCount"
          :delta="`of ${reports.length} total`"
          trend="flat"
          tone="success"
          :icon="`<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M22 11.08V12a10 10 0 1 1-5.93-9.14'></path><polyline points='22,4 12,14.01 9,11.01'></polyline></svg>`"
        />
      </div>

      <!-- Main grid: reports table + map -->
      <div class="grid main-grid">
        <!-- Recent Reports -->
        <div class="card recent-reports">
          <div class="card-head">
            <div>
              <h2>Recent reports</h2>
            </div>
            <div class="row" style="gap: var(--space-2)">
              <!-- Barangay filter: admin only -->
              <select v-if="role !== 'operator'" class="select-mini">
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
                <th class="th-sort" @click="toggleSort('report_id')">
                  Report ID <span class="sort-icon">{{ sortIcon('report_id') }}</span>
                </th>
                <th class="th-sort" @click="toggleSort('victim_name')">
                  Victim <span class="sort-icon">{{ sortIcon('victim_name') }}</span>
                </th>
                <th v-if="role !== 'operator'" class="th-sort" @click="toggleSort('barangay_name')">
                  Barangay <span class="sort-icon">{{ sortIcon('barangay_name') }}</span>
                </th>
                <th class="th-sort" @click="toggleSort('abuse_name')">
                  Type <span class="sort-icon">{{ sortIcon('abuse_name') }}</span>
                </th>
                <th class="th-sort" @click="toggleSort('severity')">
                  Severity <span class="sort-icon">{{ sortIcon('severity') }}</span>
                </th>
                <th class="th-sort" @click="toggleSort('report_status')">
                  Status <span class="sort-icon">{{ sortIcon('report_status') }}</span>
                </th>
                <th class="th-sort" @click="toggleSort('reported_time')">
                  Timestamp <span class="sort-icon">{{ sortIcon('reported_time') }}</span>
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in sortedReports" :key="r.report_id">
                <td><code class="code-id">{{ r.report_id }}</code></td>
                <td>{{ r.victim_name }}</td>
                <td>{{ r.barangay_name }}</td>
                <td>{{ r.abuse_name }}</td>
                <td><SeverityPill :severity="r.severity" /></td>
                <td><StatusBadge :status="r.report_status" /></td>
                <td class="muted">{{ formatTimestamp(r.reported_time) }}</td>
                <td>
                  <button class="row-link">View →</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Side: live map only -->
        <div class="col" style="gap: var(--space-4)">
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
        </div>
      </div>

      <!-- Bottom: barangay activity (admin only) + trend chart -->
      <div class="grid bottom-grid" :class="{ 'bottom-grid--single': role !== 'admin' }">
        <div v-if="role === 'admin'" class="card card--padded">
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
                <span
                  :style="{
                    width: (b.total / 22) * 100 + '%',
                    background:
                      b.severity === 'high' ? 'var(--sev-high)'
                      : b.severity === 'mod' ? 'var(--sev-mod)'
                      : 'var(--sev-low)',
                  }"
                />
              </div>
            </li>
          </ul>
        </div>

        <ReportsTrendChart :reports="reports" />
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
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

/* ─── Table ────────────────────────────────────── */
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

.th-sort {
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}

.th-sort:hover {
  color: var(--color-primary-700);
}

.sort-icon {
  font-size: 11px;
  opacity: 0.6;
  margin-left: 2px;
}

/* ─── Filters ──────────────────────────────────── */
.select-mini {
  min-width: 140px;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-size: 13px;
  color: var(--color-text);
}

/* ─── Map ──────────────────────────────────────── */
.map {
  padding: var(--space-4);
}

/* ─── Bottom grid ──────────────────────────────── */
.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: var(--space-5);
}

.bottom-grid--single {
  grid-template-columns: 1fr;
}

/* ─── Barangay activity ────────────────────────── */
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

/* ─── Responsive ───────────────────────────────── */
@media (max-width: 1200px) {
  .stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .main-grid,
  .bottom-grid,
  .bottom-grid--single {
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
