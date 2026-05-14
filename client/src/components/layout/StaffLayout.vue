<script setup lang="ts">
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router'
import { ref, watch } from 'vue'
import AppLogo from '../common/AppLogo.vue'

const router = useRouter()
const route = useRoute()
const userMenuOpen = ref(false)
const drawerOpen = ref(false)

function logout() {
  router.push('/staff/login')
}

// Close drawer on route change
watch(() => route.fullPath, () => (drawerOpen.value = false))

const navGroups = [
  {
    label: 'Operations',
    items: [
      { to: '/staff/dashboard', icon: 'home', label: 'Dashboard' },
      { to: '/staff/reports', icon: 'file', label: 'Reports', badge: 12 },
      { to: '/staff/dispatch', icon: 'truck', label: 'Dispatch', badge: 4 },
      { to: '/staff/map', icon: 'map', label: 'Live Map' },
    ],
  },
  {
    label: 'Records',
    items: [
      { to: '/staff/responders', icon: 'shield', label: 'Responders' },
      { to: '/staff/barangays', icon: 'pin', label: 'Barangays' },
      { to: '/staff/abuse-types', icon: 'tag', label: 'Abuse Types' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/staff/staff', icon: 'users', label: 'Staff' },
      { to: '/staff/audit', icon: 'history', label: 'Audit Log' },
      { to: '/staff/settings', icon: 'gear', label: 'Settings' },
    ],
  },
]

const icons: Record<string, string> = {
  home: 'M3 12l9-9 9 9M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6',
  truck: 'M1 3h15v13H1z M16 8h4l3 3v5h-7 M5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z M18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  map: 'M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z M8 2v16 M16 6v16',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  pin: 'M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  tag: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  history: 'M3 3v6h6 M3.51 15a9 9 0 1 0 2.13-9.36L3 9 M12 7v5l4 2',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
}
</script>

<template>
  <div class="staff-shell" :class="{ 'drawer-open': drawerOpen }">
    <aside class="sidebar" :class="{ open: drawerOpen }">
      <RouterLink to="/staff/dashboard" class="sidebar__brand">
        <span class="brand__mark">
          <AppLogo :size="20" variant="white" />
        </span>
        <div>
          <strong>SafeReport</strong>
          <span>Staff Console</span>
        </div>
      </RouterLink>

      <nav class="sidebar__nav">
        <div v-for="g in navGroups" :key="g.label" class="nav-group">
          <div class="nav-group__label">{{ g.label }}</div>
          <RouterLink
            v-for="item in g.items"
            :key="item.to"
            :to="item.to"
            class="nav-item"
            active-class="nav-item--active"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path :d="icons[item.icon]" />
            </svg>
            <span class="nav-label">{{ item.label }}</span>
            <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
          </RouterLink>
        </div>
      </nav>

      <div class="sidebar__foot">
        <div class="alert-side">
          <strong>Emergency Mode</strong>
          <p>Auto-prioritizes Critical reports.</p>
          <label class="switch">
            <input type="checkbox" />
            <span></span>
          </label>
        </div>
      </div>
    </aside>

    <div v-if="drawerOpen" class="scrim" @click="drawerOpen = false"></div>

    <div class="main-area">
      <header class="topbar">
        <button
          class="hamburger"
          aria-label="Toggle navigation"
          @click="drawerOpen = !drawerOpen"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div class="topbar__search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input placeholder="Search reports, victims, responders…" />
          <kbd>⌘K</kbd>
        </div>

        <div class="topbar__actions">
          <button class="icon-btn" title="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span class="dot-pulse" />
          </button>
          <button class="icon-btn help" title="Help">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </button>
          <div class="user-pill" @click="userMenuOpen = !userMenuOpen">
            <span class="avatar">AC</span>
            <div class="who">
              <strong>A. Cruz</strong>
              <span>Operator · Brgy. San Isidro</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="caret">
              <polyline points="6 9 12 15 18 9" />
            </svg>
            <div v-if="userMenuOpen" class="user-menu" @click.stop>
              <button>Profile</button>
              <button>Preferences</button>
              <button class="danger" @click="logout">Sign out</button>
            </div>
          </div>
        </div>
      </header>

      <main class="content">
        <RouterView v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<style scoped>
.staff-shell {
  display: grid;
  grid-template-columns: var(--sidebar-w) 1fr;
  min-height: 100vh;
  background: var(--color-bg);
}

/* Sidebar */
.sidebar {
  background: #0f1f1d;
  color: #cbd5d2;
  padding: 18px 14px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  position: sticky;
  top: 0;
  height: 100vh;
  z-index: 50;
}
.sidebar__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #fff;
  padding: 4px 8px;
}
.sidebar__brand:hover { text-decoration: none; }
.sidebar__brand .brand__mark {
  width: 36px; height: 36px;
  background: linear-gradient(135deg, var(--color-primary-400), var(--color-primary-700));
  border-radius: var(--radius-md);
  display: inline-flex; align-items: center; justify-content: center;
  color: #fff;
  flex-shrink: 0;
}
.sidebar__brand strong {
  font-family: var(--font-display);
  display: block;
  font-size: 15px;
  letter-spacing: -0.01em;
}
.sidebar__brand span {
  font-size: 11px;
  color: #8c9d9a;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.sidebar__nav { flex: 1; overflow-y: auto; }
.nav-group { margin-bottom: 16px; }
.nav-group__label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6e807d;
  padding: 6px 12px 8px;
  font-weight: 700;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 9px 12px;
  border-radius: var(--radius-md);
  color: #c4d2cf;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 2px;
  transition: background 0.12s, color 0.12s;
}
.nav-item:hover { background: rgba(255, 255, 255, 0.05); color: #fff; text-decoration: none; }
.nav-item--active {
  background: linear-gradient(90deg, rgba(78,162,154,0.18), transparent);
  color: #fff;
  position: relative;
}
.nav-item--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  background: var(--color-primary-400);
  border-radius: 0 3px 3px 0;
}
.nav-badge {
  margin-left: auto;
  background: var(--color-accent-500);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: var(--radius-full);
}

.sidebar__foot { padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.06); }
.alert-side {
  background: rgba(217, 74, 94, 0.12);
  border: 1px solid rgba(217, 74, 94, 0.32);
  border-radius: var(--radius-md);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
}
.alert-side strong { color: #fff; font-size: 13px; }
.alert-side p { color: #c4d2cf; font-size: 12px; margin: 0; }
.switch { position: absolute; top: 12px; right: 12px; width: 30px; height: 16px; display: inline-block; }
.switch input { display: none; }
.switch span {
  position: absolute; inset: 0; background: rgba(255,255,255,0.18); border-radius: 999px; transition: 0.2s;
}
.switch span::before {
  content: ''; position: absolute; top: 2px; left: 2px; width: 12px; height: 12px;
  background: #fff; border-radius: 50%; transition: 0.2s;
}
.switch input:checked + span { background: var(--color-accent-500); }
.switch input:checked + span::before { transform: translateX(14px); }

/* Topbar */
.main-area { display: flex; flex-direction: column; min-width: 0; }
.topbar {
  height: var(--topbar-h);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  position: sticky;
  top: 0;
  z-index: 20;
  gap: 16px;
}
.hamburger {
  display: none;
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  width: 38px; height: 38px;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  cursor: pointer;
}
.topbar__search {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 8px 12px;
  width: 420px;
  max-width: 100%;
  color: var(--color-text-soft);
  flex: 1;
}
.topbar__search input {
  border: none;
  background: transparent;
  outline: none;
  flex: 1;
  font-size: 14px;
  color: var(--color-text);
  min-width: 0;
}
kbd {
  font-family: inherit;
  font-size: 11px;
  padding: 2px 6px;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text-soft);
}

.topbar__actions { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.icon-btn {
  width: 38px; height: 38px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-muted);
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer;
  position: relative;
  transition: background 0.15s, color 0.15s;
}
.icon-btn:hover { color: var(--color-primary-700); background: var(--color-primary-50); }
.dot-pulse {
  position: absolute; top: 8px; right: 9px;
  width: 8px; height: 8px;
  background: var(--color-accent-500); border-radius: 50%;
  box-shadow: 0 0 0 2px #fff;
}

.user-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 10px 5px 5px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  cursor: pointer;
  position: relative;
}
.user-pill:hover { border-color: var(--color-primary-300); }
.avatar {
  width: 30px; height: 30px;
  background: linear-gradient(135deg, var(--color-primary-400), var(--color-primary-700));
  color: #fff;
  border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 12px;
  flex-shrink: 0;
}
.who { line-height: 1.1; }
.who strong { font-size: 13px; }
.who span { font-size: 11px; color: var(--color-text-soft); display: block; }
.user-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  padding: 6px;
  min-width: 160px;
  z-index: 30;
}
.user-menu button {
  display: block; width: 100%;
  text-align: left;
  background: none; border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}
.user-menu button:hover { background: var(--color-surface-alt); }
.user-menu button.danger { color: var(--color-danger); }

.scrim {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(15, 31, 29, 0.55);
  z-index: 45;
  animation: fadeIn 0.2s ease-out;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.content {
  padding: 28px;
  max-width: 100%;
  min-width: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

/* Compact rail at medium screens */
@media (max-width: 1180px) and (min-width: 901px) {
  .staff-shell { grid-template-columns: 72px 1fr; }
  .sidebar { padding: 14px 8px; }
  .sidebar__brand strong,
  .sidebar__brand span,
  .nav-label,
  .nav-group__label { display: none; }
  .alert-side strong,
  .alert-side p { display: none; }
  .alert-side { padding: 8px; align-items: center; }
  .switch { position: static; }
  .nav-item { justify-content: center; }
  .nav-item--active::before { display: none; }
}

/* Mobile drawer */
@media (max-width: 900px) {
  .staff-shell { grid-template-columns: 1fr; }
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 280px;
    transform: translateX(-100%);
    transition: transform 0.22s ease;
  }
  .sidebar.open { transform: translateX(0); }
  .scrim { display: block; }
  .hamburger { display: inline-flex; }
  .topbar { padding: 0 16px; }
  .topbar__search { width: auto; flex: 1; }
  .topbar__search kbd { display: none; }
  .who { display: none; }
  .caret { display: none; }
  .help { display: none; }
  .content { padding: 18px; }
  .user-pill { padding: 3px; }
}

@media (max-width: 540px) {
  .topbar { gap: 8px; padding: 0 12px; }
  .topbar__search input { font-size: 13px; }
  .topbar__search input::placeholder { content: 'Search'; }
  .icon-btn { width: 36px; height: 36px; }
  .content { padding: 14px; }
}
</style>
