<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { Report, ReportStatus, ReportStatusHistory } from '@/types'
import StatusBadge from '../../components/common/StatusBadge.vue'
import SeverityPill from '../../components/common/SeverityPill.vue'
import AppButton from '../../components/common/AppButton.vue'
import IncidentMap, { type IncidentMarker } from '../../components/common/IncidentMap.vue'
import { api } from '@/services/api'
import { socket } from '@/services/socket'
import { useAuth } from '@/services/auth'
import { formatTimestamp } from '@/utils/format'

const { user, role } = useAuth()

// ─── Data ─────────────────────────────────────────────────────
const reports = ref<Report[]>([])
const loading = ref(false)
const error = ref('')

// ─── Filters ──────────────────────────────────────────────────
const filterStatus = ref<ReportStatus | 'All'>('All')
const filterSeverity = ref<'All' | 'Critical' | 'High' | 'Moderate' | 'Low'>('All')
const search = ref('')

const STATUS_TABS: (ReportStatus | 'All')[] = ['All', 'Reported', 'Dispatched', 'Under Investigation', 'Resolved']

const reportedCount = computed(() =>
  reports.value.filter(r => r.report_status === 'Reported').length
)

const filtered = computed(() =>
  reports.value.filter(r => {
    if (filterStatus.value !== 'All' && r.report_status !== filterStatus.value) return false
    const sev = r.severity
    if (filterSeverity.value === 'Critical' && sev <= 8) return false
    if (filterSeverity.value === 'High' && (sev < 7 || sev > 8)) return false
    if (filterSeverity.value === 'Moderate' && (sev < 4 || sev > 6)) return false
    if (filterSeverity.value === 'Low' && sev > 3) return false
    if (search.value) {
      const q = search.value.toLowerCase()
      if (!`${r.report_id} ${r.victim_name} ${r.barangay_name} ${r.abuse_name}`.toLowerCase().includes(q)) return false
    }
    return true
  })
)

// ─── Sorting ───────────────────────────────────────────────────
type SortKey = 'report_id' | 'victim_name' | 'abuse_name' | 'severity' | 'barangay_name' | 'report_status' | 'reported_at'

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

function sortIcon(key: SortKey): string {
  if (sortKey.value !== key) return '↕'
  return sortDir.value === 'asc' ? '↑' : '↓'
}

const sortedFiltered = computed(() => {
  if (!sortKey.value) return filtered.value
  const key = sortKey.value
  return [...filtered.value].sort((a, b) => {
    const av = a[key], bv = b[key]
    const cmp = typeof av === 'number'
      ? (av as number) - (bv as number)
      : String(av).localeCompare(String(bv))
    return sortDir.value === 'asc' ? cmp : -cmp
  })
})

// ─── Map ───────────────────────────────────────────────────────
const mapCenter = ref<[number, number]>([14.5995, 121.0498])

function flyTo(lat: number, lng: number) {
  mapCenter.value = [Number(lat), Number(lng)]
}

// ─── Map markers ───────────────────────────────────────────────
const mapMarkers = computed<IncidentMarker[]>(() =>
  reports.value
    .filter(r => r.latitude != null && r.longitude != null)
    .map(r => ({
      id: r.report_id,
      lat: r.latitude!,
      lng: r.longitude!,
      severity: r.severity,
      status: r.report_status,
      title: r.report_id,
      subtitle: r.barangay_name,
    }))
)

// ─── Overlay ───────────────────────────────────────────────────
const selectedReport = ref<Report | null>(null)
const statusHistory = ref<ReportStatusHistory[]>([])
const loadingHistory = ref(false)
const newStatus = ref<ReportStatus | ''>('')
const submitting = ref(false)
const updateError = ref('')

const availableStatuses = computed<ReportStatus[]>(() => {
  const all: ReportStatus[] = ['Reported', 'Dispatched', 'Under Investigation', 'Resolved']
  return all.filter(s => s !== selectedReport.value?.report_status)
})

async function openOverlay(report: Report | undefined) {
  if (!report) return
  selectedReport.value = report
  newStatus.value = ''
  updateError.value = ''
  statusHistory.value = []
  loadingHistory.value = true
  try {
    const result = await api.get<ReportStatusHistory[]>(`/reports/${report.report_id}/history`)
    if (result.status === 'error') throw new Error(result.message)
    statusHistory.value = result.data
  } finally {
    loadingHistory.value = false
  }
}

function closeOverlay() {
  selectedReport.value = null
}

async function submitStatusUpdate() {
  if (!newStatus.value || !selectedReport.value) return
  submitting.value = true
  updateError.value = ''
  try {
    const result = await api.patch(`/reports/${selectedReport.value.report_id}/status`, {
      new_status: newStatus.value,
    })
    if (result.status === 'error') throw new Error(result.message)
    selectedReport.value.report_status = newStatus.value as ReportStatus
    newStatus.value = ''
    const h = await api.get<ReportStatusHistory[]>(`/reports/${selectedReport.value.report_id}/history`)
    if (h.status === 'success') statusHistory.value = h.data
  } catch (err: any) {
    updateError.value = err.message || 'Update failed.'
  } finally {
    submitting.value = false
  }
}

function onMarkerClick(marker: IncidentMarker) {
  openOverlay(reports.value.find(r => r.report_id === marker.id))
}

// ─── Data loading ──────────────────────────────────────────────
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

// ─── WebSocket ─────────────────────────────────────────────────
function handleNewReport(payload: Report) {
  reports.value.unshift(payload)
}

function handleStatusUpdate(payload: { report_id: string; new_status: ReportStatus }) {
  const r = reports.value.find(r => r.report_id === payload.report_id)
  if (r) r.report_status = payload.new_status
  if (selectedReport.value?.report_id === payload.report_id)
    selectedReport.value.report_status = payload.new_status
}

onMounted(() => {
  loadReports()
  socket.on('report:new', handleNewReport)
  socket.on('report:status', handleStatusUpdate)
})

onUnmounted(() => {
  socket.off('report:new', handleNewReport)
  socket.off('report:status', handleStatusUpdate)
})
</script>

<template>
  <div class="page fade-up">

    <!-- Header -->
    <div class="page-head">
      <div>
        <h1>Reports</h1>
        <p class="muted">All incident reports across your jurisdiction.</p>
      </div>
    </div>

    <!-- Map -->
    <div class="card map-card">
      <IncidentMap
        :markers="mapMarkers"
        :center="mapCenter"
        height="280px"
        @marker-click="onMarkerClick"
      />
    </div>

    <!-- Filters -->
    <div class="card filters">
      <div class="search-input">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input v-model="search" placeholder="Search by ID, victim, barangay…" />
      </div>
      <div class="filter-tabs">
        <button
          v-for="s in STATUS_TABS"
          :key="s"
          class="tab"
          :class="{ active: filterStatus === s }"
          @click="filterStatus = s"
        >
          {{ s }}
          <span v-if="s === 'Reported' && reportedCount > 0" class="tab-count">{{ reportedCount }}</span>
        </button>
      </div>
      <select v-model="filterSeverity" class="select-mini">
        <option>All</option>
        <option>Critical</option>
        <option>High</option>
        <option>Moderate</option>
        <option>Low</option>
      </select>
    </div>

    <!-- Table -->
    <div class="card table-wrap">
      <div v-if="loading" class="muted table-state">Loading reports…</div>
      <div v-else-if="error" class="error-msg table-state">{{ error }}</div>
      <template v-else>
        <table class="table">
          <thead>
            <tr>
              <th class="th-sort" @click="toggleSort('report_id')">Report ID <span class="sort-icon">{{ sortIcon('report_id') }}</span></th>
              <th class="th-sort" @click="toggleSort('victim_name')">Victim <span class="sort-icon">{{ sortIcon('victim_name') }}</span></th>
              <th class="th-sort" @click="toggleSort('abuse_name')">Type <span class="sort-icon">{{ sortIcon('abuse_name') }}</span></th>
              <th class="th-sort" @click="toggleSort('severity')">Severity <span class="sort-icon">{{ sortIcon('severity') }}</span></th>
              <th v-if="role !== 'operator'" class="th-sort" @click="toggleSort('barangay_name')">Barangay <span class="sort-icon">{{ sortIcon('barangay_name') }}</span></th>
              <th class="th-sort" @click="toggleSort('report_status')">Status <span class="sort-icon">{{ sortIcon('report_status') }}</span></th>
              <th class="th-sort" @click="toggleSort('reported_at')">Timestamp <span class="sort-icon">{{ sortIcon('reported_at') }}</span></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="r in sortedFiltered"
              :key="r.report_id"
              class="clickable"
              @click="openOverlay(r)"
            >
              <td><code class="code-id">{{ r.report_id }}</code></td>
              <td>{{ r.victim_name }}</td>
              <td>{{ r.abuse_name }}</td>
              <td><SeverityPill :severity="r.severity" /></td>
              <td v-if="role !== 'operator'">{{ r.barangay_name }}</td>
              <td><StatusBadge :status="r.report_status" /></td>
              <td class="muted small">{{ formatTimestamp(r.reported_at) }}</td>
              <td><button class="row-link" @click.stop="openOverlay(r)">View →</button></td>
            </tr>
            <tr v-if="sortedFiltered.length === 0">
              <td :colspan="role !== 'operator' ? 8 : 7" class="muted table-state">No reports match the current filters.</td>
            </tr>
          </tbody>
        </table>
      </template>
    </div>

    <!-- Overlay -->
    <Teleport to="body">
      <div v-if="selectedReport" class="modal-overlay" @click.self="closeOverlay">
        <div class="modal">

          <!-- Modal header -->
          <div class="modal__head">
            <div class="modal__title">
              <span class="muted small">Report</span>
              <code class="code-id code-id--lg">{{ selectedReport.report_id }}</code>
              <div class="row" style="gap: var(--space-2); margin-top: var(--space-2)">
                <StatusBadge :status="selectedReport.report_status" />
                <SeverityPill :severity="selectedReport.severity" />
              </div>
            </div>
            <button class="icon-btn" @click="closeOverlay">✕</button>
          </div>

          <!-- Incident details -->
          <section class="modal__section">
            <h3>Incident</h3>
            <dl class="kv">
              <dt>Victim</dt>
              <dd>{{ selectedReport.victim_name }}</dd>

              <template v-if="selectedReport.victim_contact">
                <dt>Contact</dt>
                <dd>{{ selectedReport.victim_contact }}</dd>
              </template>

              <template v-if="selectedReport.offender_name">
                <dt>Offender</dt>
                <dd>{{ selectedReport.offender_name }}<span v-if="selectedReport.offender_sex" class="muted"> · {{ selectedReport.offender_sex }}</span></dd>
              </template>

              <dt>Type</dt>
              <dd>{{ selectedReport.abuse_name }}</dd>

              <dt>Barangay</dt>
              <dd>{{ selectedReport.barangay_name }}</dd>

              <dt>Filed</dt>
              <dd>{{ formatTimestamp(selectedReport.reported_at) }}</dd>

              <template v-if="selectedReport.latitude && selectedReport.longitude">
                <dt>Coordinates</dt>
                <dd>
                  <button class="coord-link" @click="flyTo(selectedReport.latitude!, selectedReport.longitude!)">
                    {{ Number(selectedReport.latitude).toFixed(5) }}° N, {{ Number(selectedReport.longitude).toFixed(5) }}° E
                  </button>
                </dd>
              </template>
            </dl>
            <p v-if="selectedReport.report_description" class="muted description">
              {{ selectedReport.report_description }}
            </p>
          </section>

          <!-- Status history -->
          <section class="modal__section">
            <h3>Status History </h3>
            <div v-if="loadingHistory" class="muted small">Loading…</div>
            <ol v-else-if="statusHistory.length" class="timeline">
              <li v-for="h in statusHistory" :key="h.history_id">
                <span class="dot" :class="{ 'dot--active': h === statusHistory[statusHistory.length - 1] }" />
                <div>
                  <div class="timeline-status">
                    <span v-if="h.old_status" class="muted">{{ h.old_status }} →&nbsp;</span>
                    <strong>{{ h.new_status }}</strong>
                  </div>
                  <div class="muted small">{{ formatTimestamp(h.changed_at) }}</div>
                </div>
              </li>
            </ol>
            <p v-else class="muted small">No history available.</p>
          </section>

          <!-- Update status -->
          <section v-if="role=='operator'" class="modal__section">
            <h3>Update Status</h3>
            <div class="update-row">
              <select v-model="newStatus" class="select-mini" style="flex: 1">
                <option value="">Select new status…</option>
                <option v-for="s in availableStatuses" :key="s" :value="s">{{ s }}</option>
              </select>
              <AppButton
                variant="primary"
                :disabled="!newStatus || submitting"
                @click="submitStatusUpdate"
              >
                {{ submitting ? 'Saving…' : 'Update' }}
              </AppButton>
            </div>
            <p v-if="updateError" class="error-msg small" style="margin-top: var(--space-2)">{{ updateError }}</p>
          </section>

        </div>
      </div>
    </Teleport>

  </div>
</template>

<style scoped>
.page-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}
.page-head h1 { margin: 0; }

/* ─── Map ──────────────────────────────────────── */
.map-card {
  overflow: hidden;
  padding: 0;
  margin-bottom: var(--space-4);
}

/* ─── Filters ──────────────────────────────────── */
.filters {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  margin-bottom: var(--space-4);
  flex-wrap: wrap;
}

.search-input {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-alt);
  color: var(--color-text-soft);
  width: 280px;
}
.search-input input {
  border: none;
  background: transparent;
  outline: none;
  flex: 1;
  font-size: 14px;
  color: var(--color-text);
}

.filter-tabs {
  display: flex;
  gap: var(--space-1);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-1);
  background: var(--color-surface-alt);
  flex: 1;
  overflow-x: auto;
}
.tab {
  background: none;
  border: none;
  padding: 7px var(--space-3);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.tab.active {
  background: var(--color-surface);
  color: var(--color-primary-700);
  box-shadow: var(--shadow-xs);
}
.tab-count {
  background: var(--color-accent-500);
  color: #fff;
  font-size: 10px;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
}
.select-mini {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-size: 13px;
  color: var(--color-text);
}

/* ─── Table ────────────────────────────────────── */
.table-wrap { overflow: hidden; }
.table tbody tr.clickable { cursor: pointer; }
.table-state { padding: var(--space-6); text-align: center; display: block; }

.th-sort {
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}
.th-sort:hover { color: var(--color-primary-700); }
.sort-icon { font-size: 11px; opacity: 0.6; margin-left: 2px; }

.row-link {
  background: none;
  border: none;
  color: var(--color-primary-700);
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
}
.coord-link {
  background: none;
  border: none;
  color: var(--color-primary-700);
  cursor: pointer;
  font-size: inherit;
  font-family: inherit;
  padding: 0;
  text-decoration: underline dotted;
  text-underline-offset: 3px;
}

.code-id {
  font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace;
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}
.code-id--lg {
  font-size: 15px;
  padding: var(--space-1) var(--space-2);
  display: inline-block;
  margin-top: var(--space-1);
}

.error-msg {
  color: var(--color-danger);
  font-weight: 600;
}

/* ─── Overlay ──────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 200;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
}

.modal {
  width: 460px;
  max-width: 100vw;
  height: 100vh;
  background: var(--color-surface);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
}

.modal__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--space-5);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  background: var(--color-surface);
  z-index: 1;
}

.modal__title {
  display: flex;
  flex-direction: column;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.modal__section {
  padding: var(--space-5);
  border-bottom: 1px solid var(--color-border);
}
.modal__section h3 {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-text-soft);
  margin: 0 0 var(--space-3);
  font-weight: 700;
}

/* ─── KV grid ──────────────────────────────────── */
.kv {
  display: grid;
  grid-template-columns: 100px 1fr;
  row-gap: var(--space-2);
  font-size: 13px;
  margin: 0;
}
.kv dt { color: var(--color-text-soft); }
.kv dd { margin: 0; }

.description {
  margin-top: var(--space-3);
  font-size: 13px;
  line-height: 1.6;
}

/* ─── Status timeline ──────────────────────────── */
.timeline {
  list-style: none;
  padding: 0;
  margin: 0;
  position: relative;
}
.timeline::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 4px;
  bottom: 4px;
  width: 2px;
  background: var(--color-border);
}
.timeline li {
  position: relative;
  padding-left: 22px;
  padding-bottom: var(--space-4);
  font-size: 13px;
  display: flex;
  gap: var(--space-2);
}
.timeline li:last-child { padding-bottom: 0; }
.dot {
  position: absolute;
  left: 0;
  top: 3px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-border-strong);
  box-shadow: 0 0 0 3px var(--color-surface);
  flex-shrink: 0;
}
.dot--active { background: var(--color-success); }

.timeline-status { margin-bottom: 2px; }

/* ─── Update row ───────────────────────────────── */
.update-row {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

/* ─── Responsive ───────────────────────────────── */
@media (max-width: 720px) {
  .page-head { flex-direction: column; align-items: flex-start; gap: 10px; }
  .search-input { width: 100%; }
  .filter-tabs { width: 100%; }
  .modal { width: 100vw; }
}
</style>
