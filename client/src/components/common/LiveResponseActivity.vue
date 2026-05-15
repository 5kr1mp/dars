<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { api } from '../../services/api'

interface Barangay {
  barangay_id?: number
  id?: number
  barangay_name: string
  open_report_count?: number | string
}

const barangays = ref<Barangay[]>([])
const loading = ref(true)
const errorMsg = ref('')

onMounted(async () => {
  try {
    barangays.value = (await api.get<Barangay[]>('/barangay')) ?? []
  } catch (err: any) {
    errorMsg.value = err?.message || 'Could not load barangays from the server.'
    barangays.value = []
  } finally {
    loading.value = false
  }
})

// vw_barangay returns open_report_count as a string in some MySQL configs; coerce to number.
function openCount(b: Barangay): number {
  return Number(b.open_report_count ?? 0) || 0
}

// Sort by activity (busiest first), break ties alphabetically. Pick top 5.
const topBarangays = computed(() =>
  [...barangays.value]
    .sort((a, b) => {
      const diff = openCount(b) - openCount(a)
      return diff !== 0 ? diff : a.barangay_name.localeCompare(b.barangay_name)
    })
    .slice(0, 5),
)

const totalOpen = computed(() =>
  barangays.value.reduce((sum, b) => sum + openCount(b), 0),
)

function badgeClass(count: number): string {
  if (count === 0) return 'bdg success'
  if (count <= 2) return 'bdg warn'
  return 'bdg danger'
}
</script>

<template>
    <div class="status-card">
    <div class="row row--between">
        <div>
        <div class="muted small">Live response activity</div>
        <h3 class="card-title">Active cases by barangay</h3>
        </div>
        <span class="live-dot"><span /></span>
    </div>
    <p v-if="loading" class="muted small response-empty">
        Loading…
    </p>
    <p v-else-if="errorMsg" class="response-empty response-error">
        Couldn't reach the server: {{ errorMsg }}
    </p>
    <p v-else-if="topBarangays.length === 0" class="muted small response-empty">
        No barangays configured yet.
    </p>
    <ul v-else class="response-list">
        <li v-for="b in topBarangays" :key="b.barangay_name">
        <span :class="badgeClass(openCount(b))">{{ openCount(b) }}</span>
        <span class="brgy-name">{{ b.barangay_name }}</span>
        <span class="muted small">
            {{ openCount(b) === 0 ? 'Clear' : openCount(b) === 1 ? '1 open case' : openCount(b) + ' open cases' }}
        </span>
        </li>
    </ul>
    <div class="metric-row">
        <div>
        <div class="metric-value">{{ barangays.length || '—' }}</div>
        <div class="muted small">Barangays covered</div>
        </div>
        <div>
        <div class="metric-value">{{ loading ? '—' : totalOpen }}</div>
        <div class="muted small">Active cases</div>
        </div>
    </div>
    </div>
</template>

<style scoped>
    .status-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: var(--space-5) var(--space-6);
    box-shadow: var(--shadow-sm);
    position: relative;
    z-index: 2;
    }

    .card-title {
    font-size: 14px;
    font-weight: 600;
    margin-top: var(--space-1);
    color: var(--color-text);
    }

    .live-dot {
    position: relative;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--color-success);
    display: inline-block;
    flex-shrink: 0;
    margin-top: 2px;
    }

    .live-dot span {
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 2px solid var(--color-success);
    opacity: 0.45;
    animation: pulse 1.8s ease-out infinite;
    }

    @keyframes pulse {
    to {
        transform: scale(1.7);
        opacity: 0;
    }
    }

    .response-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    border-top: 1px solid var(--color-border);
    margin-top: var(--space-4);
    padding-top: var(--space-3-5, 14px);
    }

    .response-list li {
    display: grid;
    grid-template-columns: 28px 1fr auto;
    align-items: center;
    gap: var(--space-2-5, 10px);
    font-size: 13px;
    }

    .brgy-name {
    font-weight: 600;
    color: var(--color-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    }

    .response-empty {
    margin: var(--space-4) 0 0;
    padding-top: var(--space-3-5, 14px);
    border-top: 1px solid var(--color-border);
    }

    .response-error {
    color: var(--color-danger);
    font-size: 12px;
    }

    .bdg {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 26px;
    height: 22px;
    font-size: 12px;
    font-weight: 700;
    padding: 0 var(--space-1-5, 6px);
    border-radius: 6px;
    letter-spacing: 0.01em;
    }

    .bdg.success {
    background: var(--color-success-bg);
    color: var(--color-success);
    }

    .bdg.warn {
    background: var(--color-warning-bg);
    color: var(--color-warning);
    }

    .bdg.danger {
    background: var(--color-danger-bg);
    color: var(--color-danger);
    }

    .metric-row {
    margin-top: var(--space-4);
    padding-top: var(--space-3-5, 14px);
    border-top: 1px solid var(--color-border);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3);
    text-align: center;
    }

    .metric-value {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 700;
    color: var(--color-text);
    line-height: 1.2;
    margin-bottom: 2px;
    }
</style>
