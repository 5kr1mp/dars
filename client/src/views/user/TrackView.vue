<script setup lang="ts">
import { ref } from 'vue'
import { api } from '../../services/api'
import AppButton from '../../components/common/AppButton.vue'
import StatusBadge from '../../components/common/StatusBadge.vue'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface Report {
  report_id: string
  report_status: string
  reported_at: string
  age_days?: number
  abuse_name: string
  severity: number
  severity_label: string
  barangay_name: string
  latitude?: number | null
  longitude?: number | null
  report_description?: string | null
}

interface HistoryItem {
  changed_at?: string
  created_at?: string
  history_changed_at?: string
  old_status?: string | null
  new_status?: string
  report_status?: string
  changed_by_name?: string | null
  notes?: string | null
}

const code = ref('')
const result = ref<Report | null>(null)
const timeline = ref<HistoryItem[]>([])
const loading = ref(false)
const errorMsg = ref('')

async function track() {
  const id = code.value.trim().toLowerCase()
  result.value = null
  timeline.value = []
  errorMsg.value = ''

  if (!id) return

  if (!UUID_REGEX.test(id)) {
    errorMsg.value =
      "That doesn't look like a tracking code. Copy the full code from your confirmation email or screen."
    return
  }

  loading.value = true
  try {
    const [report, history] = await Promise.all([
      api.get<Report>(`/reports/${id}`),
      api.get<HistoryItem[]>(`/reports/${id}/history`),
    ])
    result.value = report
    timeline.value = history ?? []
  } catch (err: any) {
    errorMsg.value =
      err?.message || 'We could not look that up right now. Please try again.'
  } finally {
    loading.value = false
  }
}

function formatDate(s?: string) {
  if (!s) return ''
  const d = new Date(s)
  return isNaN(d.getTime()) ? s : d.toLocaleString()
}

function entryTime(t: HistoryItem) {
  return t.changed_at ?? t.history_changed_at ?? t.created_at ?? ''
}

function entryStatus(t: HistoryItem) {
  return t.new_status ?? t.report_status ?? 'Reported'
}
</script>

<template>
  <div class="container track fade-up">
    <div class="page-head">
      <h1>Track your report</h1>
      <p class="muted">
        Enter the tracking code you received when you filed. We'll show the latest
        status and any updates from the responding team.
      </p>
    </div>

    <div class="card card--padded search">
      <div class="field" style="flex: 1">
        <label>Tracking code</label>
        <input
          v-model="code"
          placeholder="e.g. 44288d10-4f7b-11f1-b32d-d843aeceb212"
          @keyup.enter="track"
        />
      </div>
      <AppButton variant="primary" size="lg" @click="track" :disabled="loading">
        {{ loading ? 'Looking up…' : 'Track' }}
      </AppButton>
    </div>

    <div v-if="errorMsg" class="card card--padded notfound">
      <h3>We couldn't find that report.</h3>
      <p class="muted">{{ errorMsg }}</p>
      <p class="muted">
        Double-check the code, or call <a href="tel:1366">1366</a> for assistance.
      </p>
    </div>

    <div v-if="result" class="result fade-up">
      <div class="grid result-layout">
        <!-- Summary -->
        <div class="card card--padded summary">
          <div class="row row--between" style="margin-bottom: 12px">
            <div>
              <div class="muted small">Report ID</div>
              <strong
                style="font-family: var(--font-display); font-size: 18px; word-break: break-all"
              >
                {{ result.report_id }}
              </strong>
            </div>
            <StatusBadge :status="result.report_status" />
          </div>
          <dl class="kv">
            <dt>Type</dt>
            <dd>{{ result.abuse_name }} ({{ result.severity_label }})</dd>
            <dt>Severity</dt><dd>{{ result.severity }}/10</dd>
            <dt>Filed</dt><dd>{{ formatDate(result.reported_at) }}</dd>
            <dt>Barangay</dt><dd>{{ result.barangay_name }}</dd>
          </dl>
          <div class="contact-block">
            <strong>Need to add information?</strong>
            <p class="muted small">
              You can add details, send a message to your assigned responder, or escalate
              if your situation has changed.
            </p>
            <div class="row" style="gap: 8px; flex-wrap: wrap">
              <AppButton variant="secondary" size="sm">Add details</AppButton>
              <AppButton variant="secondary" size="sm">Message responder</AppButton>
              <AppButton variant="accent" size="sm">Escalate / urgent</AppButton>
            </div>
          </div>
        </div>

        <!-- Timeline -->
        <div class="card card--padded timeline-card">
          <h3>Activity</h3>
          <p v-if="timeline.length === 0" class="muted">
            No status changes yet — your report has been received and is awaiting review.
          </p>
          <ol v-else class="timeline">
            <li
              v-for="(t, i) in timeline"
              :key="i"
              :class="{ first: i === 0 }"
            >
              <span class="dot" />
              <div class="t-body">
                <div class="t-head">
                  <strong>{{ entryStatus(t) }}</strong>
                  <StatusBadge :status="entryStatus(t)" />
                </div>
                <p v-if="t.notes" class="muted">{{ t.notes }}</p>
                <p v-else-if="t.old_status" class="muted">
                  Status changed from {{ t.old_status }} to {{ entryStatus(t) }}.
                </p>
                <span class="t-time">{{ formatDate(entryTime(t)) }}</span>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.track { padding: 36px 0 60px; }
.page-head { text-align: center; max-width: 600px; margin: 0 auto 28px; }

.search {
  display: flex;
  align-items: end;
  gap: 14px;
  margin-bottom: 24px;
}

.notfound {
  background: var(--color-warning-bg);
  border-color: #f0deae;
  margin-bottom: 24px;
}

.result-layout { grid-template-columns: 1fr 1.4fr; align-items: start; }

.kv {
  display: grid;
  grid-template-columns: 110px 1fr;
  row-gap: 10px;
  margin: 14px 0 18px;
  padding: 14px 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  font-size: 14px;
}
.kv dt { color: var(--color-text-soft); font-weight: 600; }
.kv dd { margin: 0; }

.contact-block {
  margin-top: 6px;
  padding-top: 6px;
}
.contact-block p { margin: 4px 0 10px; }

.timeline { list-style: none; padding: 0; margin: 14px 0 0; position: relative; }
.timeline::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 6px;
  bottom: 6px;
  width: 2px;
  background: var(--color-border);
}
.timeline li {
  position: relative;
  padding: 0 0 22px 28px;
}
.timeline li:last-child { padding-bottom: 0; }
.timeline .dot {
  position: absolute;
  left: 1px;
  top: 6px;
  width: 14px;
  height: 14px;
  background: var(--color-primary-500);
  border-radius: 50%;
  box-shadow: 0 0 0 4px #fff;
}
.timeline li.first .dot {
  background: var(--color-success);
  animation: pulseDot 1.6s ease-out infinite;
}
@keyframes pulseDot {
  0% { box-shadow: 0 0 0 4px #fff, 0 0 0 0 rgba(47,158,110,0.4); }
  100% { box-shadow: 0 0 0 4px #fff, 0 0 0 14px rgba(47,158,110,0); }
}
.t-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}
.t-time {
  display: inline-block;
  font-size: 12px;
  color: var(--color-text-soft);
  margin-top: 2px;
}

@media (max-width: 800px) {
  .result-layout { grid-template-columns: 1fr; }
  .search { flex-direction: column; align-items: stretch; }
}
</style>
