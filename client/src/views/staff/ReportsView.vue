<script setup lang="ts">
import { ref, computed } from 'vue'
import StatusBadge from '../../components/common/StatusBadge.vue'
import SeverityPill from '../../components/common/SeverityPill.vue'
import AppButton from '../../components/common/AppButton.vue'

const filterStatus = ref('All')
const filterSeverity = ref('All')
const search = ref('')

const reports = [
  { id: 'SR-9KX2T1', victim: 'Confidential', barangay: 'San Isidro', type: 'Physical', severity: 8, status: 'On the way', filed: '2026-05-09 18:42', responder: 'PNP-WCPD' },
  { id: 'SR-7VL83Q', victim: 'M. Reyes', barangay: 'Maligaya', type: 'Emotional', severity: 5, status: 'Dispatched', filed: '2026-05-09 18:31', responder: 'DSWD' },
  { id: 'SR-5BG7QR', victim: 'Anonymous', barangay: 'Bagong Silang', type: 'Physical', severity: 9, status: 'Reported', filed: '2026-05-09 18:11', responder: '—' },
  { id: 'SR-2KM18A', victim: 'L. Santos', barangay: 'Sta. Maria', type: 'Verbal', severity: 3, status: 'Under Investigation', filed: '2026-05-09 16:48', responder: 'Brgy. VAWC' },
  { id: 'SR-A4DE19', victim: 'Confidential', barangay: 'San Isidro', type: 'Sexual', severity: 10, status: 'Resolved', filed: '2026-05-09 14:02', responder: 'PNP-WCPD' },
  { id: 'SR-Q11W3X', victim: 'C. Bautista', barangay: 'Mabini', type: 'Economic', severity: 4, status: 'Resolved', filed: '2026-05-08 22:30', responder: 'DSWD' },
  { id: 'SR-T9Z2P0', victim: 'Anonymous', barangay: 'Maligaya', type: 'Child Abuse', severity: 9, status: 'Dispatched', filed: '2026-05-08 21:15', responder: 'PNP-WCPD' },
  { id: 'SR-N5E16B', victim: 'R. Tan', barangay: 'San Isidro', type: 'Physical', severity: 6, status: 'Resolved', filed: '2026-05-08 19:00', responder: 'Brgy. VAWC' },
]

const filtered = computed(() =>
  reports.filter((r) => {
    if (filterStatus.value !== 'All' && r.status !== filterStatus.value) return false
    if (filterSeverity.value === 'Critical' && r.severity < 9) return false
    if (filterSeverity.value === 'High' && (r.severity < 7 || r.severity > 8)) return false
    if (filterSeverity.value === 'Moderate' && (r.severity < 4 || r.severity > 6)) return false
    if (filterSeverity.value === 'Low' && r.severity > 3) return false
    if (search.value && !`${r.id} ${r.victim} ${r.barangay} ${r.type}`.toLowerCase().includes(search.value.toLowerCase())) return false
    return true
  }),
)

const selected = ref<string | null>(null)
</script>

<template>
  <div class="page fade-up">
    <div class="page-head">
      <div>
        <h1>Reports</h1>
        <p class="muted">All incident reports across your jurisdiction.</p>
      </div>
      <div class="row" style="gap: 8px">
        <AppButton variant="secondary">Export CSV</AppButton>
        <AppButton variant="primary">+ New Report</AppButton>
      </div>
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
          v-for="s in ['All', 'Reported', 'Dispatched', 'On the way', 'Under Investigation', 'Resolved']"
          :key="s"
          class="tab"
          :class="{ active: filterStatus === s }"
          @click="filterStatus = s"
        >
          {{ s }}
          <span v-if="s === 'Reported'" class="tab-count">3</span>
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

    <div class="layout">
      <!-- Table -->
      <div class="card table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>Report ID</th>
              <th>Victim</th>
              <th>Type</th>
              <th>Severity</th>
              <th>Barangay</th>
              <th>Responder</th>
              <th>Status</th>
              <th>Filed</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="r in filtered"
              :key="r.id"
              :class="{ selected: selected === r.id }"
              @click="selected = r.id"
            >
              <td @click.stop><input type="checkbox" /></td>
              <td><code class="code-id">{{ r.id }}</code></td>
              <td>{{ r.victim }}</td>
              <td>{{ r.type }}</td>
              <td><SeverityPill :severity="r.severity" /></td>
              <td>{{ r.barangay }}</td>
              <td class="muted">{{ r.responder }}</td>
              <td><StatusBadge :status="r.status" /></td>
              <td class="muted small">{{ r.filed }}</td>
            </tr>
          </tbody>
        </table>
        <div class="pager">
          <span class="muted">Showing 1–8 of 124</span>
          <div class="row" style="gap: 4px">
            <button class="page-btn">‹</button>
            <button class="page-btn active">1</button>
            <button class="page-btn">2</button>
            <button class="page-btn">3</button>
            <span class="muted">…</span>
            <button class="page-btn">16</button>
            <button class="page-btn">›</button>
          </div>
        </div>
      </div>

      <!-- Detail panel -->
      <aside v-if="selected" class="detail card fade-up">
        <div class="detail__head">
          <div>
            <span class="muted small">Report</span>
            <h2 style="margin: 2px 0 6px"><code class="code-id">{{ selected }}</code></h2>
            <StatusBadge status="On the way" />
          </div>
          <button class="icon-btn" @click="selected = null">✕</button>
        </div>

        <section class="detail__section">
          <h3>Incident</h3>
          <p class="muted">
            Victim reports a physical altercation involving the spouse around 6:30 PM at
            their residence. No weapons reported. Visible injuries.
          </p>
          <dl class="kv">
            <dt>Type</dt><dd>Physical</dd>
            <dt>Severity</dt><dd><SeverityPill :severity="8" /></dd>
            <dt>Barangay</dt><dd>San Isidro</dd>
            <dt>Filed</dt><dd>2026-05-09 18:42</dd>
            <dt>Coordinates</dt><dd>14.6042° N, 121.0432° E</dd>
          </dl>
        </section>

        <section class="detail__section">
          <h3>Victim</h3>
          <dl class="kv">
            <dt>Name</dt><dd>Confidential</dd>
            <dt>Contact</dt><dd>+63 9** *** **42</dd>
            <dt>Address</dt><dd>23 Mabini St., Brgy. San Isidro</dd>
          </dl>
        </section>

        <section class="detail__section">
          <h3>Dispatch</h3>
          <div class="dispatch-card">
            <div>
              <strong>PNP-WCPD San Isidro</strong>
              <div class="muted small">Acknowledged · 19:04</div>
            </div>
            <StatusBadge status="On The Way" />
          </div>
          <AppButton variant="secondary" size="sm" block style="margin-top: 10px">+ Add another responder</AppButton>
        </section>

        <section class="detail__section">
          <h3>Activity</h3>
          <ol class="mini-timeline">
            <li><span class="dot" /><div><strong>Report received</strong><div class="muted small">18:42</div></div></li>
            <li><span class="dot" /><div><strong>Reviewed by A. Cruz</strong><div class="muted small">18:51</div></div></li>
            <li><span class="dot active" /><div><strong>Responder en route</strong><div class="muted small">19:04</div></div></li>
          </ol>
        </section>

        <div class="detail__actions">
          <AppButton variant="primary" block>Open full case</AppButton>
          <div class="row" style="gap: 6px; margin-top: 8px">
            <AppButton variant="secondary" size="sm">Reassign</AppButton>
            <AppButton variant="secondary" size="sm">Add note</AppButton>
            <AppButton variant="danger" size="sm">Escalate</AppButton>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.page-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  margin-bottom: 18px;
}
.page-head h1 { margin: 0; }

.filters {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.search-input {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-alt);
  color: var(--color-text-soft);
  width: 280px;
}
.search-input input {
  border: none; background: transparent; outline: none; flex: 1;
  font-size: 14px; color: var(--color-text);
}

.filter-tabs {
  display: flex;
  gap: 4px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 4px;
  background: var(--color-surface-alt);
  flex: 1;
  overflow-x: auto;
}
.tab {
  background: none; border: none;
  padding: 7px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
  display: inline-flex; align-items: center; gap: 6px;
  white-space: nowrap;
}
.tab.active {
  background: #fff;
  color: var(--color-primary-700);
  box-shadow: var(--shadow-xs);
}
.tab-count {
  background: var(--color-accent-500);
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 999px;
}
.select-mini {
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-size: 13px;
}

.layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  align-items: start;
}
.layout:has(.detail) { grid-template-columns: 1fr 380px; }
@media (max-width: 1100px) {
  .layout:has(.detail) { grid-template-columns: 1fr; }
  .detail { position: static !important; max-height: none; }
}
@media (max-width: 720px) {
  .page-head { flex-direction: column; align-items: flex-start; gap: 10px; }
  .search-input { width: 100%; }
  .filter-tabs { width: 100%; }
}

.table-wrap { overflow: hidden; }
.table tbody tr { cursor: pointer; }
.table tbody tr.selected td {
  background: var(--color-primary-50);
}
.code-id {
  font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-top: 1px solid var(--color-border);
}
.page-btn {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  padding: 6px 11px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}
.page-btn.active {
  background: var(--color-primary-600);
  color: #fff;
  border-color: var(--color-primary-600);
}

/* Detail */
.detail { padding: 0; position: sticky; top: 84px; max-height: calc(100vh - 96px); overflow-y: auto; }
.detail__head {
  display: flex;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid var(--color-border);
}
.icon-btn {
  width: 32px; height: 32px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--color-text-muted);
}
.detail__section { padding: 16px 20px; border-bottom: 1px solid var(--color-border); }
.detail__section h3 {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-soft);
  margin-bottom: 10px;
}
.kv {
  display: grid;
  grid-template-columns: 100px 1fr;
  row-gap: 8px;
  font-size: 13px;
  margin: 0;
}
.kv dt { color: var(--color-text-soft); }
.kv dd { margin: 0; }

.dispatch-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 13px;
}

.mini-timeline { list-style: none; padding: 0; margin: 0; position: relative; }
.mini-timeline::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 4px;
  bottom: 4px;
  width: 2px;
  background: var(--color-border);
}
.mini-timeline li {
  position: relative;
  padding-left: 22px;
  padding-bottom: 14px;
  font-size: 13px;
}
.mini-timeline li:last-child { padding-bottom: 0; }
.mini-timeline .dot {
  position: absolute;
  left: 0; top: 4px;
  width: 12px; height: 12px;
  border-radius: 50%;
  background: var(--color-border-strong);
  box-shadow: 0 0 0 3px #fff;
}
.mini-timeline .dot.active { background: var(--color-success); }

.detail__actions { padding: 16px 20px; }
</style>
