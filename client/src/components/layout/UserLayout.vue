<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { ref, watch } from 'vue'
import QuickExit from '../common/QuickExit.vue'
import AppLogo from '../common/AppLogo.vue'

const route = useRoute()
const menuOpen = ref(false)
watch(() => route.fullPath, () => (menuOpen.value = false))
</script>

<template>
  <div class="user-shell">
    <header class="user-header">
      <div class="container header-inner">
        <RouterLink to="/" class="brand">
          <AppLogo :size="36" variant="gradient" />
          <span class="brand__text">
            <strong>Domestic Abuse</strong>
            <strong>Response System</strong>
          </span>
        </RouterLink>

        <nav class="user-nav" :class="{ open: menuOpen }">
          <RouterLink to="/" exact-active-class="active">Home</RouterLink>
          <RouterLink to="/report" active-class="active">Report</RouterLink>
          <RouterLink to="/track" active-class="active">Track Report</RouterLink>
          <RouterLink to="/resources" active-class="active">Resources</RouterLink>
          <RouterLink to="/staff/login" class="staff-link">Staff Login →</RouterLink>
        </nav>

        <div class="header-actions">
          <a href="tel:911" class="hotline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
            </svg>
            <span class="hotline-label"><strong>911</strong> Emergency</span>
          </a>
          <QuickExit />
          <button class="hamburger" aria-label="Open menu" @click="menuOpen = !menuOpen">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <main class="user-main">
      <RouterView v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>

    <footer class="user-footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <div class="brand">
              <span class="brand__mark">
                <AppLogo :size="30" variant="white" />
              </span>
              <strong>SafeReport</strong>
            </div>
            <p class="muted">
              A confidential channel for reporting domestic abuse and connecting victims to
              local responders.
            </p>
          </div>
          <div>
            <h4>Hotlines</h4>
            <ul>
              <li>National Emergency: <a href="tel:911">911</a></li>
              <li>VAWC Hotline: <a href="tel:1366">1366</a></li>
              <li>DSWD Hotline: <a href="tel:1343">1343</a></li>
            </ul>
          </div>
          <div>
            <h4>Important</h4>
            <ul>
              <li><RouterLink to="/report">File a report</RouterLink></li>
              <li><RouterLink to="/track">Track an existing report</RouterLink></li>
              <li><RouterLink to="/resources">Resources & support</RouterLink></li>
              <li><RouterLink to="/staff/login">Staff portal</RouterLink></li>
            </ul>
          </div>
          <div>
            <h4>Privacy</h4>
            <p class="muted">
              Reports are confidential. If you are in immediate danger, please call 911.
              Use the <strong>Quick Exit</strong> button to leave this page instantly.
            </p>
          </div>
        </div>
        <div class="footer-base">
          © 2026 SafeReport · Powered by local response units · Anonymous reports supported
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.user-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.user-header {
  background: rgba(255, 255, 255, 0.92);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 30;
  backdrop-filter: saturate(160%) blur(8px);
}
.header-inner {
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: var(--color-text);
  flex-shrink: 0;
}
.brand:hover { text-decoration: none; }
/* .brand__mark {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700));
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
} */
.brand__text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}
.brand__text strong {
  font-family: var(--font-display);
  font-size: 17px;
  letter-spacing: -0.01em;
}
.brand__sub {
  font-size: 11px;
  color: var(--color-text-soft);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 2px;
}

.user-nav {
  display: flex;
  gap: 26px;
  align-items: center;
}
.user-nav a {
  color: var(--color-text-muted);
  font-weight: 500;
  font-size: 14px;
  padding: 6px 0;
  border-bottom: 2px solid transparent;
}
.user-nav a:hover { color: var(--color-text); text-decoration: none; }
.user-nav a.active {
  color: var(--color-primary-700);
  border-bottom-color: var(--color-primary-500);
}
.user-nav .staff-link {
  color: var(--color-text-soft);
  font-size: 13px;
  margin-left: 12px;
  padding-left: 16px;
  border-left: 1px solid var(--color-border);
}

.header-actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.hotline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: var(--radius-full);
  background: var(--color-accent-50);
  color: var(--color-accent-700);
  font-size: 13px;
  font-weight: 600;
  border: 1px solid var(--color-accent-100);
  white-space: nowrap;
}
.hotline:hover { text-decoration: none; }

.hamburger {
  display: none;
  width: 38px; height: 38px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  cursor: pointer;
}

.user-main { flex: 1; }

.user-footer {
  background: #11211f;
  color: #cfd8d6;
  margin-top: 60px;
  padding: 50px 0 28px;
}
.user-footer h4 {
  color: #fff;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 12px;
}
.user-footer p { color: #aab6b3; }
.user-footer ul { list-style: none; padding: 0; margin: 0; line-height: 2; font-size: 14px; }
.user-footer a { color: #d8e2e0; }
.footer-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1.4fr;
  gap: 36px;
}
.footer-base {
  margin-top: 36px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 12px;
  color: #8a9694;
  text-align: center;
}
.user-footer .brand { color: #fff; margin-bottom: 14px; }
.user-footer .brand strong { color: #fff; }

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

@media (max-width: 1024px) {
  .footer-grid { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 900px) {
  .user-nav {
    position: absolute;
    top: 76px;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    padding: 8px 16px 16px;
    background: #fff;
    border-bottom: 1px solid var(--color-border);
    box-shadow: var(--shadow-md);
    transform: translateY(-12px);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.18s, transform 0.18s;
  }
  .user-nav.open {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
  }
  .user-nav a {
    padding: 12px 8px;
    border-bottom: 1px solid var(--color-border);
  }
  .user-nav a:last-child { border-bottom: none; }
  .user-nav .staff-link {
    margin-left: 0;
    padding-left: 8px;
    border-left: none;
    border-top: 1px solid var(--color-border);
    margin-top: 4px;
    padding-top: 14px;
  }
  .hamburger { display: inline-flex; }
  .brand__sub { display: none; }
}

@media (max-width: 600px) {
  .header-inner { height: 64px; gap: 8px; }
  .brand__text strong { font-size: 15px; }
  .hotline-label { display: none; }
  .hotline { padding: 8px 10px; }
}
</style>
