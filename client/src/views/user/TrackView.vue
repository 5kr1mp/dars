<script setup lang="ts">
import { ref } from 'vue'
import AppButton from '../../components/common/AppButton.vue'
import StatusBadge from '../../components/common/StatusBadge.vue'

const code = ref('')
const result = ref<null | typeof mockResult>(null)
const loading = ref(false)
const notFound = ref(false)

const mockResult = {
  id: 'SR-9KX2T1',
  status: 'On the way',
  abuse: 'Physical',
  severity: 'High',
  filed: '2026-05-09 18:42',
  barangay: 'Brgy. San Isidro',
  responder: 'PNP-WCPD San Isidro',
  timeline: [
    { time: '2026-05-09 18:42', label: 'Report received', status: 'Reported', desc: 'Your report was received and queued for triage.' },
    { time: '2026-05-09 18:51', label: 'Reviewed', status: 'Dispatched', desc: 'Operator A. Cruz reviewed and dispatched a responder.' },
    { time: '2026-05-09 19:04', label: 'Responder en route', status: 'On the way', desc: 'PNP-WCPD San Isidro acknowledged the case.' },
  ],
}

function track() {
  if (!code.value.trim()) return
  loading.value = true
  notFound.value = false
  setTimeout(() => {
    if (code.value.toUpperCase().startsWith('SR-')) {
      result.value = mockResult
    } else {
      result.value = null
      notFound.value = true
    }
    loading.value = false
  }, 500)
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
          placeholder="e.g. SR-9KX2T1"
          @keyup.enter="track"
        />
      </div>
      <AppButton variant="primary" size="lg" @click="track" :disabled="loading">
        {{ loading ? 'Looking up…' : 'Track' }}
      </AppButton>
    </div>

    <div v-if="notFound" class="card card--padded notfound">
      <h3>We couldn't find that code.</h3>
      <p class="muted">
        Tracking codes start with <code>SR-</code>. Double-check the code, or call
        <a href="tel:1366">1366</a> for assistance.
      </p>
    </div>

    <div v-if="result" class="result fade-up">
      <div class="grid result-layout">
        <!-- Summary -->
        <div class="card card--padded summary">
          <div class="row row--between" style="margin-bottom: 12px">
            <div>
              <div class="muted small">Report ID</div>
              <strong style="font-family: var(--font-display); font-size: 22px">
                {{ result.id }}
              </strong>
            </div>
            <StatusBadge :status="result.status" />
          </div>
          <dl class="kv">
            <dt>Type</dt><dd>{{ result.abuse }} ({{ result.severity }})</dd>
            <dt>Filed</dt><dd>{{ result.filed }}</dd>
            <dt>Barangay</dt><dd>{{ result.barangay }}</dd>
            <dt>Assigned to</dt><dd>{{ result.responder }}</dd>
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
          <ol class="timeline">
            <li v-for="(t, i) in result.timeline" :key="i" :class="{ first: i === result.timeline.length - 1 }">
              <span class="dot" />
              <div class="t-body">
                <div class="t-head">
                  <strong>{{ t.label }}</strong>
                  <StatusBadge :status="t.status" />
                </div>
                <p class="muted">{{ t.desc }}</p>
                <span class="t-time">{{ t.time }}</span>
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
