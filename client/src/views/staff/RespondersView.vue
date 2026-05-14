<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import StatusBadge from '../../components/common/StatusBadge.vue'
import AppButton from '../../components/common/AppButton.vue'

interface Responder {
  responder_id: number
  responder_name: string
  agency: string | null
  contact_number: string | null
  total_dispatches: number
  completed_dispatches: number
}

const responders = ref<Responder[]>([])
const loading = ref(false)
const error = ref('')

async function fetchResponders() {
  loading.value = true
  error.value = ''

  try {
    const response = await fetch(
      'http://localhost:3000/api/responders'
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch responders')
    }

    responders.value = data.data
  } catch (err: any) {
    error.value = err.message || 'Something went wrong'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchResponders()
})

const agencies = computed(() => {
  const grouped: Record<string, number> = {}

  responders.value.forEach((r) => {
    const agency = r.agency || 'Unknown'

    if (!grouped[agency]) {
      grouped[agency] = 0
    }

    grouped[agency]++
  })

  return Object.entries(grouped).map(([name, count]) => ({
    name,
    count,
  }))
})

function getStatus(r: Responder) {
  if (r.total_dispatches > r.completed_dispatches) {
    return 'On Scene'
  }

  return 'Available'
}
</script>

<template>
  <div class="page fade-up">
    <div class="page-head">
      <div>
        <h1>Responders</h1>
        <p class="muted">
          Agencies and individuals who respond to incidents.
        </p>
      </div>

      <div class="row" style="gap: 8px">
        <AppButton variant="secondary">
          Import
        </AppButton>

        <AppButton variant="primary">
          + Add Responder
        </AppButton>
      </div>
    </div>

    <div
      v-if="loading"
      class="muted"
    >
      Loading responders...
    </div>

    <div
      v-else-if="error"
      class="error-message"
    >
      {{ error }}
    </div>

    <template v-else>
      <div class="grid summary">
        <div
          v-for="a in agencies"
          :key="a.name"
          class="agency-card"
        >
          <span class="agency-dot" />

          <div>
            <strong>{{ a.name }}</strong>

            <div class="muted small">
              {{ a.count }} units
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <table class="table">
          <thead>
            <tr>
              <th>Responder</th>
              <th>Agency</th>
              <th>Status</th>
              <th>Total Dispatches</th>
              <th>Completed</th>
              <th>Contact</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="r in responders"
              :key="r.responder_id"
            >
              <td>
                <div class="resp-cell">
                  <span class="avatar">
                    {{
                      r.responder_name
                        .split(' ')
                        .map((p) => p[0])
                        .join('')
                        .slice(0, 2)
                    }}
                  </span>

                  <strong>
                    {{ r.responder_name }}
                  </strong>
                </div>
              </td>

              <td>
                <span class="agency-tag">
                  {{ r.agency || 'N/A' }}
                </span>
              </td>

              <td>
                <StatusBadge :status="getStatus(r)" />
              </td>

              <td>
                {{ r.total_dispatches }}
              </td>

              <td>
                {{ r.completed_dispatches }}
              </td>

              <td class="muted">
                {{ r.contact_number || 'N/A' }}
              </td>

              <td>
                <button class="row-link">
                  Manage →
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.page-head h1 {
  margin: 0;
}

.summary {
  grid-template-columns: repeat(5, 1fr);
  margin-bottom: var(--space-4);
}

.agency-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.agency-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-primary-500);
}

.resp-cell {
  display: flex;
  align-items: center;
  gap: var(--space-2-5, 10px);
}

.avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(
    135deg,
    var(--color-primary-400),
    var(--color-primary-700)
  );
  color: #fff;
  border-radius: 50%;
  font-weight: 700;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.agency-tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  padding: var(--space-1) var(--space-2-5, 9px);
  border-radius: var(--radius-full);
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
}

.row-link {
  background: none;
  border: none;
  color: var(--color-primary-700);
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
}

.error-message {
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: rgba(255, 0, 0, 0.08);
  color: var(--color-danger);
  font-weight: 600;
}

@media (max-width: 1100px) {
  .summary {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 720px) {
  .page-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .summary {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .summary {
    grid-template-columns: 1fr;
  }
}
</style>