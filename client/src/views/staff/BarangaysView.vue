<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import StatusBadge from '../../components/common/StatusBadge.vue'
import IncidentMap, {
  type IncidentMarker,
  type CoverageZone,
} from '../../components/common/IncidentMap.vue'
import { api } from '../../services/api'

interface Barangay {
  barangay_id: number
  barangay_name: string
  latitude: number | null
  longitude: number | null
  radius: number | null
}

const barangays = ref<Barangay[]>([])
const loading = ref(false)
const error = ref('')

async function fetchBarangays() {
  loading.value = true
  error.value = ''
  try {
    const result = await api.get<Barangay[]>('/barangay')
    if (result.status === 'error') throw new Error(result.message)
    barangays.value = result.data
  } catch (err: any) {
    error.value = err.message || 'Something went wrong'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchBarangays()
})

const markers = computed<IncidentMarker[]>(() =>
  barangays.value
    .filter(
      (b) =>
        b.latitude !== null &&
        b.longitude !== null
    )
    .map((b) => ({
      id: b.barangay_id,
      lat: Number(b.latitude),
      lng: Number(b.longitude),
      title: b.barangay_name,
      subtitle: `${b.radius || 0} km coverage`,
    })),
)

const zones = computed<CoverageZone[]>(() =>
  barangays.value
    .filter(
      (b) =>
        b.latitude !== null &&
        b.longitude !== null &&
        b.radius !== null
    )
    .map((b) => ({
      lat: Number(b.latitude),
      lng: Number(b.longitude),
      radius: Number(b.radius),
      label: b.barangay_name,
    })),
)

const mapCenter = computed<[number, number]>(() => {
  if (barangays.value.length === 0) {
    return [14.5995, 121.0498]
  }

  const first = barangays.value.find(
    (b) =>
      b.latitude !== null &&
      b.longitude !== null
  )

  if (!first) {
    return [14.5995, 121.0498]
  }

  return [
    Number(first.latitude),
    Number(first.longitude),
  ]
})
</script>

<template>
  <div class="page fade-up">
    <div class="page-head">
      <div>
        <h1>Barangays</h1>

        <p class="muted">
          Coverage areas, response zones,
          and per-barangay activity.
        </p>
      </div>

    </div>

    <div
      v-if="loading"
      class="muted"
    >
      Loading barangays...
    </div>

    <div
      v-else-if="error"
      class="error-message"
    >
      {{ error }}
    </div>

    <div
      v-else
      class="grid layout"
    >
      <div class="card">
        <table class="table">
          <thead>
            <tr>
              <th>Barangay</th>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Coverage</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="b in barangays"
              :key="b.barangay_id"
            >
              <td>
                <div class="brgy-cell">
                  <span class="brgy-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                      ></path>
                    </svg>
                  </span>

                  <div>
                    <strong>
                      {{ b.barangay_name }}
                    </strong>

                    <div class="muted small">
                      ID:
                      {{ b.barangay_id }}
                    </div>
                  </div>
                </div>
              </td>

              <td>
                {{
                  b.latitude !== null
                    ? Number(
                        b.latitude
                      ).toFixed(4)
                    : 'N/A'
                }}
              </td>

              <td>
                {{
                  b.longitude !== null
                    ? Number(
                        b.longitude
                      ).toFixed(4)
                    : 'N/A'
                }}
              </td>

              <td>
                {{
                  b.radius !== null
                    ? `${b.radius} km`
                    : 'N/A'
                }}
              </td>

              <td>
                <StatusBadge status="Active" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <aside class="map-card card">
        <div class="card-head">
          <h3 style="margin: 0">
            Coverage map
          </h3>

          <span class="muted small">
            {{ barangays.length }}
            barangays
          </span>
        </div>

        <div class="map">
          <IncidentMap
            :markers="markers"
            :zones="zones"
            :center="mapCenter"
            :zoom="13"
            height="380px"
            :show-legend="false"
          />
        </div>

        <div class="legend">
          <span>
            <i class="zone-i" />
            Coverage zone
          </span>

          <span>
            <i class="pin-i" />
            Barangay center
          </span>
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
  margin-bottom: var(--space-4);
}

.page-head h1 {
  margin: 0;
}

.layout {
  grid-template-columns: 1.6fr 1fr;
  align-items: start;
}

.brgy-cell {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.brgy-icon {
  width: 36px;
  height: 36px;
  background: var(--color-primary-50);
  border-radius: var(--radius-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary-600);
}

.row-link {
  background: none;
  border: none;
  color: var(--color-primary-700);
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
}

.map-card {
  padding: 0;
  position: sticky;
  top: 84px;
}

.card-head {
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
}

.map {
  padding: 16px;
}

.legend {
  display: flex;
  gap: 18px;
  padding: 0 16px 18px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.legend i {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 6px;
  vertical-align: middle;
}

.zone-i {
  border-radius: 50%;
  background: rgba(44, 135, 128, 0.22);
  border: 2px dashed
    var(--color-primary-500);
}

.pin-i {
  border-radius: 50%;
  background: var(--color-primary-700);
}

.error-message {
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: rgba(255, 0, 0, 0.08);
  color: var(--color-danger);
  font-weight: 600;
}

@media (max-width: 1100px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .map-card {
    position: static;
  }
}

@media (max-width: 720px) {
  .page-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>