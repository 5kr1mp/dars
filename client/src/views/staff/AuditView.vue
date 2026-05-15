<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { api } from '@/services/api'

interface AuditLog {
  log_id: number
  action_timestamp: string
  table_name: string
  action_type: string
  record_id: string
  performed_by: string
  user_role: string
  old_values: string | null
  new_values: string | null
}

const filterAction = ref('All')
const filterTable = ref('All')

const logs = ref<AuditLog[]>([])
const loading = ref(false)
const error = ref('')

const fetchLogs = async () => {
  loading.value = true
  error.value = ''

  try {
    const params: Record<string, string> = {}

    if (filterAction.value !== 'All') {
      params.action_type = filterAction.value
    }

    if (filterTable.value !== 'All') {
      params.table_name = filterTable.value
    }

    const response: any = await api.get('/audit-log', params)

    // adjust depending on your backend response structure
    logs.value = response.data || []
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch audit logs'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLogs()
})

watch([filterAction, filterTable], () => {
  fetchLogs()
})

const filteredLogs = computed(() => logs.value)

const actionTone = (a: string) =>
  ({
    INSERT: 'success',
    UPDATE: 'info',
    DELETE: 'danger',
  }[a] || 'neutral')
</script>

<template>
  <div class="audit-view">

    <!-- Filters -->
    <div class="filters">
      <select v-model="filterAction">
        <option>All</option>
        <option>INSERT</option>
        <option>UPDATE</option>
        <option>DELETE</option>
      </select>

      <select v-model="filterTable">
        <option>All</option>
        <option>report</option>
        <option>dispatch</option>
        <option>staff</option>
        <option>responder</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      Loading audit logs...
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <!-- Table -->
    <table v-else class="audit-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Timestamp</th>
          <th>Action</th>
          <th>Table</th>
          <th>Record</th>
          <th>User</th>
          <th>Role</th>
          <th>Changes</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="log in filteredLogs"
          :key="log.log_id"
        >
          <td>{{ log.log_id }}</td>

          <td>
            {{ log.action_timestamp }}
          </td>

          <td>
            <span :class="['badge', actionTone(log.action_type)]">
              {{ log.action_type }}
            </span>
          </td>

          <td>{{ log.table_name }}</td>

          <td>{{ log.record_id }}</td>

          <td>{{ log.performed_by }}</td>

          <td>{{ log.user_role }}</td>

          <td>
            <pre class="changes">
{{
  log.new_values ||
  log.old_values ||
  'No changes'
}}
            </pre>
          </td>
        </tr>

        <tr v-if="filteredLogs.length === 0">
          <td colspan="8" class="empty">
            No audit logs found
          </td>
        </tr>
      </tbody>
    </table>

  </div>
</template>

<style scoped>
.audit-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filters {
  display: flex;
  gap: 1rem;
}

select {
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.audit-table {
  width: 100%;
  border-collapse: collapse;
}

.audit-table th,
.audit-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
  text-align: left;
  vertical-align: top;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

.success {
  background: #dcfce7;
  color: #166534;
}

.info {
  background: #dbeafe;
  color: #1d4ed8;
}

.danger {
  background: #fee2e2;
  color: #b91c1c;
}

.changes {
  white-space: pre-wrap;
  font-size: 0.8rem;
  max-width: 320px;
}

.loading,
.error,
.empty {
  padding: 1rem;
  text-align: center;
}

.error {
  color: red;
}
</style>