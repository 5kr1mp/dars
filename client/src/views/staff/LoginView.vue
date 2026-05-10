<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '../../components/common/AppButton.vue'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

function login() {
  if (!email.value || !password.value) {
    error.value = 'Please enter your email and password.'
    return
  }
  error.value = ''
  loading.value = true
  setTimeout(() => {
    router.push('/staff/dashboard')
  }, 600)
}
</script>

<template>
  <div class="auth">
    <div class="auth__pane auth__pane--art">
      <div class="art-content">
        <div class="brand">
          <span class="brand__mark">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4.5 8-11.5V5l-8-3-8 3v5.5C4 17.5 12 22 12 22z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </span>
          <strong>SafeReport</strong>
        </div>
        <h1>Faster, kinder responses to domestic abuse.</h1>
        <p>
          The staff console gives operators, admins, and responders a single place to
          triage incoming reports, dispatch the right team, and follow each case
          through to resolution.
        </p>
        <ul class="art-list">
          <li>📍 Live barangay coverage map</li>
          <li>🛡️ End-to-end audit log</li>
          <li>⚡ One-tap dispatch with severity routing</li>
        </ul>
      </div>
    </div>

    <div class="auth__pane">
      <div class="auth__card">
        <h2>Welcome back</h2>
        <p class="muted">Sign in to your staff account to continue.</p>

        <form @submit.prevent="login" class="col" style="gap: 16px; margin-top: 22px">
          <div class="field">
            <label>Work email</label>
            <input
              v-model="email"
              type="email"
              placeholder="you@city.gov.ph"
              autocomplete="email"
            />
          </div>
          <div class="field">
            <label>Password</label>
            <input
              v-model="password"
              type="password"
              placeholder="••••••••"
              autocomplete="current-password"
            />
          </div>

          <div class="row row--between" style="font-size: 13px">
            <label class="check">
              <input type="checkbox" /> Keep me signed in
            </label>
            <a href="#">Forgot password?</a>
          </div>

          <div v-if="error" class="error">{{ error }}</div>

          <AppButton type="submit" variant="primary" size="lg" block :disabled="loading">
            {{ loading ? 'Signing in…' : 'Sign in' }}
          </AppButton>
        </form>

        <div class="divider"><span>or</span></div>

        <button class="sso-btn">
          <span class="sso-icon">🪪</span>
          Continue with Government SSO
        </button>

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

.auth__pane {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}
.auth__pane--art {
  background:
    radial-gradient(800px 400px at 20% 80%, rgba(255,255,255,0.08), transparent),
    linear-gradient(135deg, #144641 0%, #0f1f1d 100%);
  color: #e8efed;
  position: relative;
  overflow: hidden;
}
.auth__pane--art::before {
  content: '';
  position: absolute;
  inset: -40px;
  background:
    radial-gradient(circle at 80% 20%, rgba(78,162,154,0.4), transparent 50%),
    radial-gradient(circle at 30% 90%, rgba(217,74,94,0.18), transparent 50%);
  filter: blur(40px);
}
.art-content { max-width: 460px; position: relative; z-index: 1; }
.art-content .brand { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
.art-content .brand strong { font-family: var(--font-display); font-size: 18px; }
.art-content .brand__mark {
  width: 40px; height: 40px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: var(--radius-md);
  display: inline-flex; align-items: center; justify-content: center;
  color: #fff;
}
.art-content h1 {
  color: #fff;
  font-size: 38px;
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin-bottom: 18px;
}
.art-content p {
  color: #b8c8c5;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 30px;
}
.art-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 14px;
  color: #d8e2e0;
}
.art-list li {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  padding: 12px 16px;
  border-radius: var(--radius-md);
  backdrop-filter: blur(6px);
}

.auth__card {
  width: 100%;
  max-width: 400px;
}
.auth__card h2 {
  font-size: 26px;
}
.error {
  background: var(--color-danger-bg);
  color: var(--color-danger);
  border: 1px solid #f3c8c1;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  font-size: 13px;
}
.check {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-muted);
  cursor: pointer;
}

.divider {
  margin: 22px 0;
  text-align: center;
  position: relative;
  color: var(--color-text-soft);
  font-size: 12px;
}
.divider::before, .divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 42%;
  height: 1px;
  background: var(--color-border);
}
.divider::before { left: 0; }
.divider::after { right: 0; }

.sso-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 11px 14px;
  border: 1px solid var(--color-border-strong);
  background: #fff;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.sso-btn:hover { border-color: var(--color-primary-400); background: var(--color-surface-alt); }

.auth__foot { margin-top: 28px; font-size: 13px; text-align: center; }

@media (max-width: 900px) {
  .auth { grid-template-columns: 1fr; }
  .auth__pane--art { display: none; }
}
</style>
