<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppButton from '../../components/common/AppButton.vue'
import SeverityPill from '../../components/common/SeverityPill.vue'
import { useAuth } from '../../services/auth'
import { api } from '../../services/api'

const { role } = useAuth()

interface AbuseType {
  abuse_name: string
  abuse_description: string
  severity: number
  law_reference: string
  report_count?: number
}

const types = ref<AbuseType[]>([])
const loading = ref(false)
const error = ref('')

async function fetchAbuseTypes() {
  loading.value = true
  error.value = ''
  try {
    const result = await api.get<AbuseType[]>('/abuse-type')
    if (result.status === 'error') throw new Error(result.message)
    types.value = result.data
  } catch (err: any) {
    error.value = err.message || 'Something went wrong'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAbuseTypes()
})
</script>

<template>
  <div class="page fade-up">
    <div class="page-head">
      <div>
        <h1>Abuse types</h1>
        <p class="muted">Categories used when classifying reports.</p>
      </div>

      <AppButton v-if="role === 'admin'" variant="primary">
        + Add Type
      </AppButton>
    </div>

    <div v-if="loading" class="muted">
      Loading abuse types...
    </div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else class="grid types-grid">
      <article
        v-for="t in types"
        :key="t.abuse_name"
        class="type-card card"
      >
        <div
          class="row row--between"
          style="margin-bottom: var(--space-2)"
        >
          <h3 style="margin: 0">
            {{ t.abuse_name }}
          </h3>

          <span class="count">
            {{ t.report_count ?? 0 }}
          </span>
        </div>

        <SeverityPill :severity="t.severity" />

        <p class="description muted small">
          {{ t.abuse_description }}
        </p>

        <div
          class="law muted small"
          style="margin-top: var(--space-3)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            style="vertical-align: middle; margin-right: 4px; display: inline;"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14,2 14,8 20,8"></polyline>
            <line x1="12" y1="11" x2="12" y2="17"></line>
            <line x1="9" y1="14" x2="15" y2="14"></line>
          </svg>

          {{ t.law_reference }}
        </div>

        <div
          v-if="role === 'admin'"
          class="row"
          style="gap: var(--space-1); margin-top: var(--space-4)"
        >
          <button class="link">
            Edit
          </button>

          <button class="link danger">
            Archive
          </button>
        </div>
      </article>
    </div>
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

.types-grid {
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}

.type-card {
  padding: var(--space-4) var(--space-5);
  transition: box-shadow 0.15s, border-color 0.15s;
}

.type-card:hover {
  box-shadow: var(--shadow-sm);
  border-color: var(--color-primary-300);
}

.count {
  background: var(--color-primary-50);
  color: var(--color-primary-700);
  font-weight: 700;
  font-size: 13px;
  padding: var(--space-1) var(--space-2-5, 10px);
  border-radius: var(--radius-full);
}

.link {
  background: none;
  border: none;
  color: var(--color-primary-700);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}

.link.danger {
  color: var(--color-danger);
}

.link:hover {
  background: var(--color-surface-alt);
}

.description {
  margin-top: var(--space-3);
  line-height: 1.5;
}

.error-message {
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: rgba(255, 0, 0, 0.08);
  color: var(--color-danger);
  font-weight: 600;
}
</style>
