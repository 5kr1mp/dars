<script setup lang="ts">
function panicExit() {
  // Replace history so back button doesn't return to the app
  window.location.replace('https://www.google.com/search?q=weather')
}

function onKey(e: KeyboardEvent) {
  // Triple-tap ESC also triggers exit
  if (e.key === 'Escape' && e.shiftKey) panicExit()
}

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', onKey)
}
</script>

<template>
  <button class="quick-exit" @click="panicExit" aria-label="Quick exit to a neutral website">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
    Quick Exit
  </button>
</template>

<style scoped>
.quick-exit {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--color-accent-500);
  color: #fff;
  border: none;
  border-radius: var(--radius-full);
  padding: 8px 14px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: background 0.15s, transform 0.1s;
}
.quick-exit:hover {
  background: var(--color-accent-600);
}
.quick-exit:active {
  transform: scale(0.97);
}
</style>
