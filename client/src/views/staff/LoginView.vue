<script setup lang="ts">
import { ref } from 'vue'
import AppButton from '../../components/common/AppButton.vue'
import AppLogo from '../../components/common/AppLogo.vue'
import { useAuth } from '../../services/auth'

const { login: authLogin } = useAuth()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function login() {
  if (!email.value || !password.value) {
    error.value = 'Please enter your email and password.'
    return
  }
  error.value = ''
  loading.value = true
  try {
    await authLogin(email.value, password.value)
  } catch (e: any) {
    error.value = e.message ?? 'Invalid credentials. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth">
    <div class="auth__pane auth__pane--art">
      <div class="art-content">
        <div class="brand">
          <span class="brand__mark">
            <AppLogo :size="20" variant="white" />
          </span>
          <strong>Domestic Abuse Report System</strong>
        </div>
        <h1>Faster, kinder responses to domestic abuse.</h1>
        <p>
          The staff console gives operators, admins, and responders a single place to
          triage incoming reports, dispatch the right team, and follow each case
          through to resolution.
        </p>
        <ul class="art-list">
          <li>
            <span class="art-list__icon" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </span>
            Live barangay coverage map
          </li>
          <li>
            <span class="art-list__icon" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4.5 8-11.5V5l-8-3-8 3v5.5C4 17.5 12 22 12 22z" />
              </svg>
            </span>
            End-to-end audit log
          </li>
          <li>
            <span class="art-list__icon" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </span>
            One-tap dispatch with severity routing
          </li>
        </ul>
      </div>
    </div>

    <div class="auth__pane">
      <div class="auth__card">
        <div class="auth__card-head">
          <h2>Welcome back</h2>
          <p class="muted">Sign in to your staff account to continue.</p>
        </div>

        <form @submit.prevent="login" class="auth__form">
          <div class="field">
            <label for="email">Work email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="you@city.gov.ph"
              autocomplete="email"
            />
          </div>
          <div class="field">
            <label for="password">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              autocomplete="current-password"
            />
          </div>

          <div v-if="error" class="error" role="alert">{{ error }}</div>

          <AppButton type="submit" variant="primary" size="lg" block :disabled="loading">
            {{ loading ? 'Signing in…' : 'Sign in' }}
          </AppButton>
        </form>

        <p class="auth__foot muted">
          Are you a victim or witness?
          <router-link to="/">Use the public reporting site →</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.05fr 1fr;
}

/* ─── Art pane ──────────────────────────────────────────── */
.auth__pane {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.auth__pane--art {
  background: linear-gradient(160deg, #14433e 0%, #0e1e1c 100%);
  color: #e6eeec;
  position: relative;
  overflow: hidden;
}

.auth__pane--art::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 560px 400px at 85% 15%, rgba(72, 158, 150, 0.22), transparent),
    radial-gradient(ellipse 400px 360px at 10% 85%, rgba(210, 68, 88, 0.12), transparent);
  pointer-events: none;
}

.art-content {
  max-width: 440px;
  position: relative;
  z-index: 1;
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--space-2-5, 10px);
  margin-bottom: var(--space-8);
}

.brand strong {
  font-family: var(--font-display);
  font-size: 17px;
  color: #fff;
  letter-spacing: -0.01em;
}

.brand__mark {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.art-content h1 {
  color: #fff;
  font-size: 32px;
  line-height: 1.2;
  letter-spacing: -0.018em;
  font-weight: 700;
  margin-bottom: var(--space-4);
}

.art-content p {
  color: #a8bebb;
  font-size: 15px;
  line-height: 1.65;
  margin-bottom: var(--space-7, 28px);
}

.art-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3-5, 14px);
  font-size: 14px;
  color: #cddad8;
}

.art-list li {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: 0;
  border: none;
  background: transparent;
  border-radius: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #d5e1df;
}

.art-list__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
  color: rgba(255, 255, 255, 0.45);
}

/* ─── Form pane ─────────────────────────────────────────── */
.auth__card {
  width: 100%;
  max-width: 384px;
}

.auth__card-head {
  margin-bottom: var(--space-6);
}

.auth__card-head h2 {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: var(--space-1);
  color: var(--color-text);
}

.auth__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.error {
  background: var(--color-danger-bg);
  color: var(--color-danger);
  border: 1px solid rgba(var(--color-danger-rgb, 180, 40, 40), 0.2);
  padding: var(--space-2-5, 10px) var(--space-3);
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.5;
}

/* ─── Footer ────────────────────────────────────────────── */
.auth__foot {
  margin-top: var(--space-6);
  font-size: 13px;
  text-align: center;
  line-height: 1.5;
}

/* ─── Responsive ────────────────────────────────────────── */
@media (max-width: 900px) {
  .auth {
    grid-template-columns: 1fr;
  }

  .auth__pane--art {
    display: none;
  }

  .auth__pane {
    padding: 32px 24px;
    align-items: flex-start;
    padding-top: 56px;
  }
}
</style>