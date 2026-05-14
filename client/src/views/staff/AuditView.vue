<script setup lang="ts">
import { ref } from 'vue'

const filterAction = ref('All')
const filterTable = ref('All')

const logs = [
  { id: 8421, time: '2026-05-09 19:04:22', action: 'UPDATE', table: 'report', record: 'SR-9KX2T1', user: 'A. Cruz', role: 'operator', changes: '{ "report_status": "On the way" }' },
  { id: 8420, time: '2026-05-09 19:01:11', action: 'INSERT', table: 'dispatch', record: 'D-0192', user: 'A. Cruz', role: 'operator', changes: '{ "responder_id": 4, "report_id": "SR-9KX2T1" }' },
  { id: 8419, time: '2026-05-09 18:51:08', action: 'UPDATE', table: 'report', record: 'SR-9KX2T1', user: 'A. Cruz', role: 'operator', changes: '{ "report_status": "Dispatched" }' },
  { id: 8418, time: '2026-05-09 18:42:55', action: 'INSERT', table: 'report', record: 'SR-9KX2T1', user: 'public_form', role: '—', changes: '{ "victim_id": 1842, "abuse_name": "Physical" }' },
  { id: 8417, time: '2026-05-09 17:13:42', action: 'UPDATE', table: 'staff', record: 'staff#42', user: 'M. Aquino', role: 'system_admin', changes: '{ "user_role": "admin" }' },
  { id: 8416, time: '2026-05-09 16:48:18', action: 'INSERT', table: 'report', record: 'SR-2KM18A', user: 'public_form', role: '—', changes: '{ "abuse_name": "Verbal" }' },
  { id: 8415, time: '2026-05-09 14:02:01', action: 'UPDATE', table: 'report', record: 'SR-A4DE19', user: 'M. Aquino', role: 'admin', changes: '{ "report_status": "Resolved" }' },
  { id: 8414, time: '2026-05-09 11:30:00', action: 'DELETE', table: 'responder', record: 'resp#19', user: 'M. Aquino', role: 'system_admin', changes: '{ "name": "Decommissioned unit" }' },
]

const actionTone = (a: string) => ({ INSERT: 'success', UPDATE: 'info', DELETE: 'danger' }[a] || 'neutral')
</script>

<template>
  <div class="page fade-up">
    <div class="page-head">
      <div>
        <h1>Audit log</h1>
        <p class="muted">Every change to the system, captured for compliance and accountability.</p>
      </div>
      <div class="row" style="gap: var(--space-2)">
        <button class="filter-btn"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px; display: inline;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7,10 12,15 17,10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>Export</button>
        <button class="filter-btn"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px; display: inline;"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36M20.49 15a9 9 0 0 1-14.85 3.36"></path></svg>Refresh</button>
      </div>
    </div>

    <div class="card filters">
      <select v-model="filterAction" class="select-mini">
        <option>All</option><option>INSERT</option><option>UPDATE</option><option>DELETE</option>
      </select>
      <select v-model="filterTable" class="select-mini">
        <option>All</option>
        <option>report</option>
        <option>dispatch</option>
        <option>victim</option>
        <option>offender</option>
        <option>staff</option>
        <option>responder</option>
        <option>barangay</option>
      </select>
      <input class="search-mini" placeholder="Search by record ID, user…" />
      <input type="date" class="select-mini" />
    </div>

    <div class="card">
      <table class="table audit-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Time</th>
            <th>Action</th>
            <th>Table</th>
            <th>Record</th>
            <th>Performed by</th>
            <th>Changes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in logs" :key="l.id">
            <td class="muted">#{{ l.id }}</td>
            <td class="muted small">{{ l.time }}</td>
            <td>
              <span class="action" :class="`action--${actionTone(l.action)}`">{{ l.action }}</span>
            </td>
            <td><code class="code-id">{{ l.table }}</code></td>
            <td><code class="code-id">{{ l.record }}</code></td>
            <td>
              <div class="user-cell">
                <span class="avatar">{{ l.user.split(' ').map(p => p[0]).join('') }}</span>
                <div>
                  <strong>{{ l.user }}</strong>
                  <div class="muted small">{{ l.role }}</div>
                </div>
              </div>
            </td>
            <td><code class="json">{{ l.changes }}</code></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.page-head { display: flex; align-items: end; justify-content: space-between; margin-bottom: var(--space-4); }
.page-head h1 { margin: 0; }
.filter-btn {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}

.filters {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3);
  margin-bottom: var(--space-5);
}
.select-mini, .search-mini {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  padding: var(--space-2) var(--space-3);
  font-size: 13px;
}
.search-mini { flex: 1; outline: none; }

.audit-table { font-size: 13px; }
.action {
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  padding: 3px 9px;
  border-radius: 4px;
  letter-spacing: 0.05em;
}
.action--success { background: var(--color-success-bg); color: var(--color-success); }
.action--info { background: var(--color-info-bg); color: var(--color-info); }
.action--danger { background: var(--color-danger-bg); color: var(--color-danger); }
.action--neutral { background: var(--color-surface-alt); color: var(--color-text-muted); }

.code-id, .json {
  font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: 12px;
}
.json {
  color: var(--color-text-muted);
  display: inline-block;
  max-width: 360px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 720px) {
  .page-head { flex-direction: column; align-items: flex-start; gap: 10px; }
  .filters { flex-wrap: wrap; }
  .search-mini { flex-basis: 100%; }
  .json { max-width: 200px; }
}
.avatar {
  width: 26px; height: 26px;
  background: linear-gradient(135deg, var(--color-primary-400), var(--color-primary-700));
  color: #fff;
  border-radius: 50%;
  font-weight: 700; font-size: 11px;
  display: inline-flex; align-items: center; justify-content: center;
}
</style>
