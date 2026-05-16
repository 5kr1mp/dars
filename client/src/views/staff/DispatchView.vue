<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import StatusBadge from '../../components/common/StatusBadge.vue'
import AppButton from '../../components/common/AppButton.vue'
import { api } from '../../services/api'

type DispatchStatus = 'Assigned' | 'On The Way' | 'Arrived' | 'Completed'

interface Dispatch {
  dispatch_id: number
  dispatch_status: DispatchStatus
  dispatch_time: string
  remarks?: string
  report_id: string
  report_status: string
  barangay_name: string
  responder_id: number
  responder_name: string
  agency?: string
  responder_contact?: string
}

interface Responder {
  responder_id: number
  responder_name: string
  agency: string | null
}

interface Column {
  key: string
  title: string
  color: string
  status: DispatchStatus | null
}

const COLUMNS: Column[] = [
  { key: 'queue',     title: 'New / Triage', color: 'var(--color-info)',    status: null },
  { key: 'assigned',  title: 'Assigned',     color: 'var(--color-warning)', status: 'Assigned' },
  { key: 'enroute',   title: 'On the Way',   color: 'var(--color-warning)', status: 'On The Way' },
  { key: 'onsite',    title: 'On Scene',     color: 'var(--color-info)',    status: 'Arrived' },
  { key: 'completed', title: 'Completed',    color: 'var(--color-success)', status: 'Completed' },
]

const NEXT_STATUS: Partial<Record<DispatchStatus, DispatchStatus>> = {
  'Assigned':   'On The Way',
  'On The Way': 'Arrived',
  'Arrived':    'Completed',
}

const NEXT_LABEL: Partial<Record<DispatchStatus, string>> = {
  'Assigned':   'Mark On the Way',
  'On The Way': 'Mark Arrived',
  'Arrived':    'Mark Completed',
}

const dispatches  = ref<Dispatch[]>([])
const responders  = ref<Responder[]>([])
const loading     = ref(false)
const error       = ref<string | null>(null)
const updatingId  = ref<number | null>(null)

const showModal  = ref(false)
const form       = ref({ report_id: '', responder_id: '', remarks: '' })
const submitting = ref(false)
const formError  = ref<string | null>(null)

const columnCards = computed(() => {
  const map: Record<string, Dispatch[]> = { queue: [] }
  for (const col of COLUMNS) {
    if (col.status) map[col.key] = dispatches.value.filter(d => d.dispatch_status === col.status)
  }
  return map
})

async function fetchAll() {
  loading.value = true
  error.value = null
  try {
    const [dRes, rRes] = await Promise.all([
      api.get<Dispatch[]>('/dispatch'),
      api.get<Responder[]>('/responder'),
    ])
    if (dRes.status === 'success') dispatches.value = dRes.data
    if (rRes.status === 'success') responders.value = rRes.data
  } catch (e: any) {
    error.value = e.message ?? 'Failed to load dispatch data'
  } finally {
    loading.value = false
  }
}

async function advanceStatus(d: Dispatch) {
  const next = NEXT_STATUS[d.dispatch_status]
  if (!next || updatingId.value !== null) return
  updatingId.value = d.dispatch_id
  try {
    const res = await api.put<null>(`/dispatch/${d.dispatch_id}/status`, { dispatch_status: next })
    if (res.status === 'success') d.dispatch_status = next
    else error.value = res.message
  } catch (e: any) {
    error.value = e.message ?? 'Status update failed'
  } finally {
    updatingId.value = null
  }
}

async function submitDispatch() {
  if (!form.value.report_id || !form.value.responder_id) {
    formError.value = 'Report ID and responder are required'
    return
  }
  submitting.value = true
  formError.value = null
  try {
    const res = await api.post('/dispatch', {
      report_id: form.value.report_id,
      responder_id: Number(form.value.responder_id),
      remarks: form.value.remarks || undefined,
    })
    if (res.status === 'success') {
      closeModal()
      await fetchAll()
    } else {
      formError.value = res.message
    }
  } catch (e: any) {
    formError.value = e.message ?? 'Failed to create dispatch'
  } finally {
    submitting.value = false
  }
}

function closeModal() {
  showModal.value = false
  formError.value = null
  form.value = { report_id: '', responder_id: '', remarks: '' }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
}

onMounted(fetchAll)
</script>

<template>
  <div class="page fade-up">
    <div class="page-head">
      <div>
        <h1>Dispatch board</h1>
        <p class="muted">Manage and advance dispatch cases across their response stages.</p>
      </div>
      <div class="row" style="gap: 8px">
        <AppButton variant="secondary" @click="fetchAll" :disabled="loading">
          {{ loading ? 'Loading…' : 'Refresh' }}
        </AppButton>
        <AppButton variant="primary" @click="showModal = true">+ New Dispatch</AppButton>
      </div>
    </div>

    <div v-if="error" class="error-banner">{{ error }}</div>

    <div class="board" :class="{ 'board--loading': loading }">
      <div v-for="col in COLUMNS" :key="col.key" class="col">
        <div class="col__head" :style="{ '--accent': col.color }">
          <span class="col__title">{{ col.title }}</span>
          <span class="col__count">{{ (columnCards[col.key] ?? []).length }}</span>
        </div>
        <div class="col__list">
          <template v-if="col.status === null">
            <p class="empty-col">Assign a responder to a report using <strong>+ New Dispatch</strong>.</p>
          </template>
          <template v-else-if="(columnCards[col.key] ?? []).length === 0">
            <p class="empty-col">No cases here.</p>
          </template>
          <article v-for="d in (columnCards[col.key] ?? [])" :key="d.dispatch_id" class="card-item">
            <div class="row row--between">
              <code class="code-id">{{ d.report_id }}</code>
              <span class="muted small">{{ timeAgo(d.dispatch_time) }} ago</span>
            </div>
            <div class="row row--between" style="align-items: center">
              <h3>{{ d.barangay_name }}</h3>
              <StatusBadge :status="d.report_status" />
            </div>
            <div class="responder-tag">
              <span class="resp-avatar">{{ initials(d.responder_name) }}</span>
              <span>{{ d.responder_name }}<template v-if="d.agency"> · {{ d.agency }}</template></span>
            </div>
            <button
              v-if="NEXT_STATUS[d.dispatch_status]"
              class="advance-btn"
              :disabled="updatingId === d.dispatch_id"
              @click="advanceStatus(d)"
            >
              {{ updatingId === d.dispatch_id ? 'Updating…' : NEXT_LABEL[d.dispatch_status] }}
            </button>
          </article>
        </div>
      </div>
    </div>

    <!-- New Dispatch Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal__head">
          <h2>Assign Responder</h2>
          <button class="modal__close" @click="closeModal">×</button>
        </div>
        <form @submit.prevent="submitDispatch" class="modal__body">
          <div v-if="formError" class="error-banner">{{ formError }}</div>
          <label class="field">
            <span class="field__label">Report ID</span>
            <input
              v-model="form.report_id"
              class="field__input"
              placeholder="e.g. SR-5BG7QR"
              required
            />
          </label>
          <label class="field">
            <span class="field__label">Responder</span>
            <select v-model="form.responder_id" class="field__input" required>
              <option value="" disabled>Select a responder</option>
              <option
                v-for="r in responders"
                :key="r.responder_id"
                :value="r.responder_id"
              >
                {{ r.responder_name }}<template v-if="r.agency"> · {{ r.agency }}</template>
              </option>
            </select>
          </label>
          <label class="field">
            <span class="field__label">Remarks <span class="muted">(optional)</span></span>
            <textarea v-model="form.remarks" class="field__input field__input--ta" rows="3" />
          </label>
          <div class="modal__actions">
            <AppButton type="button" variant="secondary" @click="closeModal">Cancel</AppButton>
            <AppButton type="submit" variant="primary" :disabled="submitting">
              {{ submitting ? 'Dispatching…' : 'Assign & Dispatch' }}
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-head { display: flex; align-items: end; justify-content: space-between; margin-bottom: var(--space-4); }
.page-head h1 { margin: 0; }

.error-banner {
  background: var(--color-danger-50, #fef2f2);
  color: var(--color-danger-700, #b91c1c);
  border: 1px solid var(--color-danger-200, #fecaca);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  margin-bottom: var(--space-3);
  font-size: 13px;
}

.board {
  display: grid;
  grid-template-columns: repeat(5, minmax(260px, 1fr));
  gap: var(--space-3-5, 14px);
  overflow-x: auto;
  padding-bottom: var(--space-2);
  scroll-snap-type: x proximity;
}
.board--loading { opacity: 0.6; pointer-events: none; }
.col { scroll-snap-align: start; }
@media (max-width: 720px) {
  .page-head { flex-direction: column; align-items: flex-start; gap: var(--space-2-5, 10px); }
  .board { grid-auto-flow: column; grid-template-columns: none; grid-auto-columns: 86%; }
}

.col {
  display: flex;
  flex-direction: column;
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  min-height: 70vh;
}
.col__head {
  padding: var(--space-3) var(--space-4) var(--space-2);
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid var(--color-border);
  position: relative;
}
.col__head::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 4px; height: 100%;
  background: var(--accent);
  border-radius: var(--radius-lg) 0 0 0;
}
.col__title { font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.04em; }
.col__count {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  padding: var(--space-0-25, 1px) var(--space-2-25, 9px);
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-muted);
}

.col__list {
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-2-5, 10px);
  flex: 1;
}

.empty-col {
  font-size: 12px;
  color: var(--color-text-soft);
  text-align: center;
  margin: auto;
  padding: var(--space-4);
}

.card-item {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-3-5, 14px);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  transition: box-shadow 0.15s, border-color 0.15s;
}
.card-item:hover {
  border-color: var(--color-primary-300);
  box-shadow: var(--shadow-sm);
}
.card-item h3 {
  font-size: 14px;
  margin: 0;
}
.code-id {
  font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
  font-size: 11px;
  background: var(--color-surface-alt);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}
.responder-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1-5, 6px) var(--space-2);
  background: var(--color-surface-alt);
  border-radius: var(--radius-md);
  font-size: 12px;
  color: var(--color-text-muted);
}
.resp-avatar {
  width: 22px; height: 22px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary-400), var(--color-primary-700));
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.advance-btn {
  background: none;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  color: var(--color-primary-700);
  cursor: pointer;
  font-weight: 600;
  font-size: 11px;
  padding: var(--space-1) var(--space-2);
  text-align: left;
  transition: background 0.1s;
}
.advance-btn:hover:not(:disabled) { background: var(--color-surface-alt); }
.advance-btn:disabled { opacity: 0.5; cursor: default; }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal {
  background: #fff;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
}
.modal__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border);
}
.modal__head h2 { margin: 0; font-size: 16px; }
.modal__close {
  background: none; border: none;
  font-size: 22px; line-height: 1;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0 var(--space-1);
}
.modal__body {
  padding: var(--space-4) var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  padding-top: var(--space-2);
}

.field { display: flex; flex-direction: column; gap: var(--space-1); }
.field__label { font-size: 13px; font-weight: 600; }
.field__input {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
  background: #fff;
}
.field__input:focus { outline: 2px solid var(--color-primary-400); border-color: transparent; }
.field__input--ta { resize: vertical; min-height: 72px; font-family: inherit; }
</style>
