<script setup lang="ts">
import type { ReportStatus } from '@/types'
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export interface IncidentMarker {
  id?: string | number
  lat: number
  lng: number
  /** 1-10 severity, controls pin color */
  severity?: number
  status?: ReportStatus
  title?: string
  subtitle?: string
}

export interface CoverageZone {
  lat: number
  lng: number
  /** radius in km */
  radius: number
  label?: string
}

const props = withDefaults(
  defineProps<{
    markers?: IncidentMarker[]
    zones?: CoverageZone[]
    center?: [number, number]
    zoom?: number
    height?: string
    interactive?: boolean
    showLegend?: boolean
  }>(),
  {
    markers: () => [],
    zones: () => [],
    center: () => [14.5995, 121.0498],
    zoom: 13,
    height: '100%',
    interactive: true,
    showLegend: true,
  },
)

const emit = defineEmits<{ 'marker-click': [marker: IncidentMarker] }>()

const mapEl = ref<HTMLElement>()
let map: L.Map | null = null
let markerLayer: L.LayerGroup | null = null
let zoneLayer: L.LayerGroup | null = null

function severityColor(s?: number): string {
  if (s === undefined) return '#2c8780'
  if (s >= 9) return '#b83549'
  if (s >= 7) return '#d96e2a'
  if (s >= 4) return '#d29c2a'
  return '#5fa470'
}

function severityLabel(s?: number): string {
  if (s === undefined) return ''
  if (s >= 9) return 'Critical'
  if (s >= 7) return 'High'
  if (s >= 4) return 'Moderate'
  return 'Low'
}

function buildPinIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: 'sr-pin',
    html: `<span class="sr-pin__ring" style="border-color:${color}"></span><span class="sr-pin__dot" style="background:${color}"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

function renderMarkers() {
  if (!map) return
  if (markerLayer) markerLayer.remove()
  markerLayer = L.layerGroup().addTo(map)

  for (const m of props.markers) {
    const color = severityColor(m.severity)
    const marker = L.marker([m.lat, m.lng], {
      icon: buildPinIcon(color),
      keyboard: true,
      title: m.title ?? '',
    })
    if (m.title || m.status || m.subtitle) {
      marker.bindPopup(
        `<div class="sr-popup">
           ${m.title ? `<strong>${m.title}</strong>` : ''}
           ${m.subtitle ? `<div class="sr-popup__sub">${m.subtitle}</div>` : ''}
           ${m.status ? `<span class="sr-popup__status">${m.status}</span>` : ''}
           ${m.severity !== undefined ? `<span class="sr-popup__sev" style="color:${color}">● ${severityLabel(m.severity)} (${m.severity}/10)</span>` : ''}
         </div>`,
      )
    }
    marker.on('click', () => emit('marker-click', m))
    marker.addTo(markerLayer)
  }
}

function renderZones() {
  if (!map) return
  if (zoneLayer) zoneLayer.remove()
  zoneLayer = L.layerGroup().addTo(map)

  for (const z of props.zones) {
    L.circle([z.lat, z.lng], {
      radius: z.radius * 1000,
      color: '#2c8780',
      weight: 2,
      dashArray: '6 4',
      fillColor: '#2c8780',
      fillOpacity: 0.12,
    })
      .addTo(zoneLayer)
      .bindTooltip(z.label ?? '', { permanent: false, direction: 'top' })
  }
}

onMounted(() => {
  if (!mapEl.value) return
  map = L.map(mapEl.value, {
    zoomControl: props.interactive,
    dragging: props.interactive,
    scrollWheelZoom: props.interactive,
    doubleClickZoom: props.interactive,
    touchZoom: props.interactive,
    boxZoom: props.interactive,
    keyboard: props.interactive,
    attributionControl: false,
  }).setView(props.center, props.zoom)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(map)

  L.control
    .attribution({ prefix: false })
    .addAttribution('© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>')
    .addTo(map)

  renderZones()
  renderMarkers()
})

watch(() => props.markers, renderMarkers, { deep: true })
watch(() => props.zones, renderZones, { deep: true })
watch(
  () => [props.center, props.zoom] as const,
  ([c, z]) => {
    map?.setView(c, z)
  },
  { deep: true },
)

onBeforeUnmount(() => {
  map?.remove()
  map = null
})
</script>

<template>
  <div class="map-wrap" :style="{ height }">
    <div ref="mapEl" class="map-canvas" />
    <div v-if="showLegend" class="legend">
      <span><i style="background: #b83549" />Critical</span>
      <span><i style="background: #d96e2a" />High</span>
      <span><i style="background: #d29c2a" />Moderate</span>
      <span><i style="background: #5fa470" />Low</span>
    </div>
  </div>
</template>

<style scoped>
.map-wrap {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border);
}
.map-canvas {
  width: 100%;
  height: 100%;
  background: #e8eee8;
}

.legend {
  position: absolute;
  bottom: 12px;
  left: 12px;
  z-index: 400;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 8px 12px;
  display: flex;
  gap: 14px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
  box-shadow: var(--shadow-xs);
  pointer-events: none;
}
.legend i {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 5px;
  vertical-align: middle;
}
@media (max-width: 520px) {
  .legend {
    flex-wrap: wrap;
    gap: 6px 12px;
    font-size: 10px;
  }
}
</style>

<style>
/* Global Leaflet overrides — needed for divIcon styles */
.sr-pin {
  position: relative;
}
.sr-pin__dot {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.92);
}
.sr-pin__ring {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 2px solid;
  opacity: 0.55;
  animation: sr-pulse 1.8s ease-out infinite;
}
@keyframes sr-pulse {
  0% {
    transform: scale(0.6);
    opacity: 0.55;
  }
  100% {
    transform: scale(2.2);
    opacity: 0;
  }
}

.sr-popup {
  font-family: var(--font-sans, system-ui);
  min-width: 160px;
}
.sr-popup strong {
  font-family: var(--font-display, system-ui);
  font-size: 13px;
}
.sr-popup__sub {
  font-size: 12px;
  color: #5b6371;
  margin-top: 2px;
}
.sr-popup__status {
  display: inline-block;
  margin-top: 6px;
  margin-right: 6px;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  background: #e3edfb;
  color: #2f6fc9;
}
.sr-popup__sev {
  display: inline-block;
  margin-top: 6px;
  font-size: 11px;
  font-weight: 700;
}

.leaflet-container {
  font-family: var(--font-sans, system-ui);
}
.leaflet-popup-content-wrapper {
  border-radius: 10px;
}
</style>
