<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = withDefaults(
  defineProps<{
    modelValue?: { lat: number; lng: number } | null
    center?: [number, number]
    zoom?: number
    height?: string
  }>(),
  {
    modelValue: null,
    center: () => [14.5995, 121.0498],
    zoom: 13,
    height: '320px',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: { lat: number; lng: number } | null]
}>()

const mapEl = ref<HTMLElement>()
let map: L.Map | null = null
let marker: L.Marker | null = null
const detecting = ref(false)
const detectError = ref('')

function pinIcon(): L.DivIcon {
  return L.divIcon({
    className: 'sr-pin',
    html: '<span class="sr-pin__ring" style="border-color:#b83549"></span><span class="sr-pin__dot" style="background:#b83549"></span>',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

function placeMarker(lat: number, lng: number) {
  if (!map) return
  if (!marker) {
    marker = L.marker([lat, lng], { icon: pinIcon(), draggable: true }).addTo(map)
    marker.on('dragend', () => {
      const p = marker!.getLatLng()
      emit('update:modelValue', { lat: p.lat, lng: p.lng })
    })
  } else {
    marker.setLatLng([lat, lng])
  }
}

function detectLocation() {
  if (!navigator.geolocation) {
    detectError.value = 'Geolocation is not supported by this browser.'
    return
  }
  detecting.value = true
  detectError.value = ''
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords
      map?.setView([latitude, longitude], 16)
      placeMarker(latitude, longitude)
      emit('update:modelValue', { lat: latitude, lng: longitude })
      detecting.value = false
    },
    (err) => {
      detectError.value = err.message || 'Could not determine your location.'
      detecting.value = false
    },
    { enableHighAccuracy: true, timeout: 8000 },
  )
}

function clearLocation() {
  if (marker) {
    marker.remove()
    marker = null
  }
  emit('update:modelValue', null)
}

onMounted(() => {
  if (!mapEl.value) return
  map = L.map(mapEl.value, { attributionControl: false }).setView(props.center, props.zoom)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map)
  L.control
    .attribution({ prefix: false })
    .addAttribution('© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>')
    .addTo(map)

  map.on('click', (e: L.LeafletMouseEvent) => {
    placeMarker(e.latlng.lat, e.latlng.lng)
    emit('update:modelValue', { lat: e.latlng.lat, lng: e.latlng.lng })
  })

  if (props.modelValue) {
    placeMarker(props.modelValue.lat, props.modelValue.lng)
    map.setView([props.modelValue.lat, props.modelValue.lng], 16)
  }
})

watch(
  () => props.modelValue,
  (v) => {
    if (v) {
      placeMarker(v.lat, v.lng)
    } else if (marker) {
      marker.remove()
      marker = null
    }
  },
)

// Re-center the map when the parent passes a new center (e.g. user picks a different barangay).
watch(
  () => props.center,
  (c) => {
    map?.setView(c, props.zoom)
  },
)

onBeforeUnmount(() => {
  map?.remove()
  map = null
})
</script>

<template>
  <div class="picker">
    <div class="picker__bar">
      <div class="picker__hint">
        <span>📍</span>
        <span v-if="!modelValue" class="muted">Tap the map to drop a pin, or use your location.</span>
        <span v-else class="coords">
          {{ modelValue.lat.toFixed(5) }}, {{ modelValue.lng.toFixed(5) }}
        </span>
      </div>
      <div class="picker__actions">
        <button type="button" class="btn-mini" @click="detectLocation" :disabled="detecting">
          {{ detecting ? 'Locating…' : '📡 Use my location' }}
        </button>
        <button
          v-if="modelValue"
          type="button"
          class="btn-mini btn-mini--ghost"
          @click="clearLocation"
        >
          Clear
        </button>
      </div>
    </div>
    <div ref="mapEl" class="picker__map" :style="{ height }" />
    <div v-if="detectError" class="error">{{ detectError }}</div>
  </div>
</template>

<style scoped>
.picker {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-surface);
}
.picker__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-alt);
  flex-wrap: wrap;
}
.picker__hint {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
.coords {
  font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary-700);
}
.picker__actions {
  display: inline-flex;
  gap: 6px;
}
.btn-mini {
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  padding: 7px 12px;
  border-radius: var(--radius-md);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  color: var(--color-text);
}
.btn-mini:hover {
  border-color: var(--color-primary-400);
}
.btn-mini--ghost {
  background: transparent;
  border-color: var(--color-border);
  color: var(--color-text-muted);
}
.btn-mini:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.picker__map {
  width: 100%;
  background: #e8eee8;
}
.error {
  background: var(--color-danger-bg);
  color: var(--color-danger);
  padding: 8px 14px;
  font-size: 12px;
  border-top: 1px solid #f3c8c1;
}
@media (max-width: 540px) {
  .picker__bar {
    flex-direction: column;
    align-items: stretch;
  }
  .picker__actions {
    justify-content: flex-end;
  }
}
</style>
