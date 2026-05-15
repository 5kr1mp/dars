<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppButton from '../../components/common/AppButton.vue'
import { api } from '../../services/api'
import { useAuth } from '../../services/auth'

type Tab = 'profile' | 'notifications' | 'security' | 'system'
const tab = ref<Tab>('profile')

const { user } = useAuth()

// --- Profile tab (read-only, sourced from cached auth state) ---
interface Barangay {
  barangay_id?: number
  id?: number
  barangay_name: string
}

const barangays = ref<Barangay[]>([])

onMounted(async () => {
  try {
    barangays.value = (await api.get<Barangay[]>('/barangay')) ?? []
  } catch {
    barangays.value = []
  }
})

const myBarangay = computed(() => {
  const id = user.value?.barangay_id ?? null
  if (id == null) return null
  return (
    barangays.value.find((b) => (b.barangay_id ?? b.id) === id)?.barangay_name ?? null
  )
})

// --- Security tab ---
const pwForm = ref({ oldPassword: '', newPassword: '', confirmPassword: '' })
const pwSaving = ref(false)
const pwMsg = ref('')
const pwError = ref('')

async function changePassword() {
  pwMsg.value = ''
  pwError.value = ''

  if (!pwForm.value.oldPassword || !pwForm.value.newPassword) {
    pwError.value = 'Please fill in your current and new password.'
    return
  }
  if (pwForm.value.newPassword.length < 8) {
    pwError.value = 'New password must be at least 8 characters.'
    return
  }
  if (pwForm.value.newPassword !== pwForm.value.confirmPassword) {
    pwError.value = 'New password and confirmation do not match.'
    return
  }

  pwSaving.value = true
  try {
    await api.post('/staff/change-password', {
      oldPassword: pwForm.value.oldPassword,
      newPassword: pwForm.value.newPassword,
    })
    pwMsg.value = 'Password updated.'
    pwForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
  } catch (err: any) {
    pwError.value = err?.message || 'Could not update your password.'
  } finally {
    pwSaving.value = false
  }
}

// Avatar initials from cached auth state.
function initials(): string {
  const fn = user.value?.first_name ?? ''
  const ln = user.value?.last_name ?? ''
  return ((fn[0] ?? '') + (ln[0] ?? '')).toUpperCase() || '·'
}

function roleLabel(role?: string | null) {
  if (role === 'system_admin') return 'System Admin'
  if (role === 'admin') return 'Admin'
  if (role === 'operator') return 'Operator'
  return '—'
}
</script>

<template>
  <div class="page fade-up">
    <div class="page-head">
      <h1>Settings</h1>
      <p class="muted">Manage your account, notifications, and system preferences.</p>
    </div>

    <div class="layout">
      <nav class="side-nav card">
        <button :class="{ active: tab === 'profile' }" @click="tab = 'profile'">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 8px; display: inline;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>Profile
        </button>
        <button :class="{ active: tab === 'notifications' }" @click="tab = 'notifications'">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 8px; display: inline;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>Notifications
        </button>
        <button :class="{ active: tab === 'security' }" @click="tab = 'security'">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 8px; display: inline;"><path d="M12 22s8-4.5 8-11.5V5l-8-3-8 3v5.5C4 17.5 12 22 12 22z"></path></svg>Security
        </button>
        <button :class="{ active: tab === 'system' }" @click="tab = 'system'">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 8px; display: inline;"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>System
        </button>
      </nav>

      <div class="content card card--padded">
        <!-- Profile (read-only) -->
        <div v-if="tab === 'profile'" class="col">
          <h2>Profile</h2>

          <div v-if="!user" class="muted">Not signed in.</div>

          <template v-else>
            <div class="row" style="gap: var(--space-4); align-items: center">
              <span class="big-avatar">{{ initials() }}</span>
              <div>
                <strong>{{ user.first_name }} {{ user.last_name }}</strong>
                <div class="muted small">{{ roleLabel(user.user_role) }}</div>
              </div>
            </div>

            <dl class="profile-kv">
              <dt>Email</dt><dd>{{ user.email }}</dd>
              <dt>Role</dt><dd>{{ roleLabel(user.user_role) }}</dd>
              <dt>Barangay</dt>
              <dd>
                <span v-if="myBarangay">{{ myBarangay }}</span>
                <span v-else-if="user.user_role !== 'operator'" class="muted">
                  Not applicable for this role
                </span>
                <span v-else-if="user.barangay_id == null" class="muted">
                  No barangay assigned yet
                </span>
                <span v-else class="muted">Loading…</span>
              </dd>
            </dl>

            <p class="muted small">
              Profile updates aren't editable here yet — contact an admin if your name, email,
              or barangay assignment needs to change.
            </p>
          </template>
        </div>

        <!-- Notifications (UI only) -->
        <div v-if="tab === 'notifications'" class="col">
          <h2>Notifications</h2>
          <div class="banner banner--info">
            Notification preferences aren't stored on the server yet — toggles below are local for preview.
          </div>
          <ul class="pref-list">
            <li>
              <div>
                <strong>Critical incidents</strong>
                <div class="muted small">Immediate alerts for severity 9–10 reports.</div>
              </div>
              <label class="switch"><input type="checkbox" checked /><span /></label>
            </li>
            <li>
              <div>
                <strong>New report assigned</strong>
                <div class="muted small">When you are assigned as the operator on a case.</div>
              </div>
              <label class="switch"><input type="checkbox" checked /><span /></label>
            </li>
            <li>
              <div>
                <strong>Responder status updates</strong>
                <div class="muted small">When dispatch status changes for your cases.</div>
              </div>
              <label class="switch"><input type="checkbox" /><span /></label>
            </li>
            <li>
              <div>
                <strong>Daily summary email</strong>
                <div class="muted small">A digest of activity at 7:00 AM.</div>
              </div>
              <label class="switch"><input type="checkbox" checked /><span /></label>
            </li>
          </ul>
        </div>

        <!-- Security -->
        <div v-if="tab === 'security'" class="col">
          <h2>Security</h2>
          <div class="field">
            <label>Current password</label>
            <input v-model="pwForm.oldPassword" type="password" autocomplete="current-password" />
          </div>
          <div class="grid two">
            <div class="field">
              <label>New password</label>
              <input v-model="pwForm.newPassword" type="password" autocomplete="new-password" />
              <span class="hint">At least 8 characters.</span>
            </div>
            <div class="field">
              <label>Confirm password</label>
              <input v-model="pwForm.confirmPassword" type="password" autocomplete="new-password" />
            </div>
          </div>

          <div v-if="pwMsg" class="banner banner--ok">{{ pwMsg }}</div>
          <div v-if="pwError" class="banner banner--err">{{ pwError }}</div>

          <div class="actions">
            <AppButton variant="primary" :disabled="pwSaving" @click="changePassword">
              {{ pwSaving ? 'Updating…' : 'Update password' }}
            </AppButton>
          </div>
        </div>

        <!-- System (UI only) -->
        <div v-if="tab === 'system'" class="col">
          <h2>System preferences</h2>
          <div class="banner banner--info">
            Theme and routing preferences are local-only for now. They will be persisted once a settings table is added.
          </div>
          <div class="field">
            <label>Theme</label>
            <div class="theme-row">
              <button class="theme theme--light active">Light</button>
              <button class="theme theme--dark">Dark</button>
              <button class="theme theme--auto">Auto</button>
            </div>
          </div>
          <div class="field">
            <label>Severity routing threshold</label>
            <input type="range" min="1" max="10" value="7" />
            <span class="hint">Reports at or above this severity will auto-page on-call responders.</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-head { margin-bottom: var(--space-4); }
.page-head h1 { margin: 0; }

.layout { display: grid; grid-template-columns: 220px 1fr; gap: var(--space-4); align-items: start; }

.side-nav {
  padding: var(--space-2);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  position: sticky;
  top: var(--topbar-h);
}
.side-nav button {
  background: none;
  border: none;
  text-align: left;
  padding: var(--space-2-5, 10px) var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text-muted);
}
.side-nav button:hover { background: var(--color-surface-alt); color: var(--color-text); }
.side-nav button.active {
  background: var(--color-primary-50);
  color: var(--color-primary-700);
}

.content h2 { margin: 0 0 var(--space-1); }
.col { gap: var(--space-4); }
.two { grid-template-columns: 1fr 1fr; }
.actions { display: flex; gap: var(--space-2); }

.banner {
  padding: var(--space-2-5, 10px) var(--space-3);
  border-radius: var(--radius-md);
  font-size: 13px;
  border: 1px solid;
}
.banner--ok {
  background: var(--color-success-bg);
  border-color: #c5e3d3;
  color: var(--color-success);
}
.banner--err {
  background: var(--color-danger-bg);
  border-color: #f3c8c1;
  color: var(--color-danger);
}
.banner--info {
  background: var(--color-info-bg);
  border-color: #cfdcef;
  color: var(--color-info);
}

.big-avatar {
  width: 56px; height: 56px;
  background: linear-gradient(135deg, var(--color-primary-400), var(--color-primary-700));
  color: #fff;
  border-radius: 50%;
  font-weight: 700; font-size: 18px;
  display: inline-flex; align-items: center; justify-content: center;
}

.profile-kv {
  display: grid;
  grid-template-columns: 140px 1fr;
  row-gap: var(--space-2-5, 10px);
  column-gap: var(--space-4);
  padding: var(--space-3-5, 14px) 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  margin: 0;
  font-size: 14px;
}
.profile-kv dt { color: var(--color-text-soft); font-weight: 600; margin: 0; }
.profile-kv dd { margin: 0; color: var(--color-text); }

.pref-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}
.pref-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3-5, 14px) var(--space-4);
  border-bottom: 1px solid var(--color-border);
}
.pref-list li:last-child { border-bottom: none; }

.switch { position: relative; width: 36px; height: 20px; display: inline-block; }
.switch input { display: none; }
.switch span {
  position: absolute; inset: 0;
  background: var(--color-border-strong);
  border-radius: 999px; transition: 0.2s;
}
.switch span::before {
  content: '';
  position: absolute;
  top: 2px; left: 2px;
  width: 16px; height: 16px;
  background: #fff;
  border-radius: 50%;
  transition: 0.2s;
}
.switch input:checked + span { background: var(--color-primary-500); }
.switch input:checked + span::before { transform: translateX(16px); }

.theme-row { display: flex; gap: var(--space-2); }
.theme {
  padding: var(--space-2-25, 9px) var(--space-3-5, 14px);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-strong);
  background: var(--color-surface);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
}
.theme.active {
  background: var(--color-primary-50);
  border-color: var(--color-primary-500);
  color: var(--color-primary-700);
}
.hint { font-size: 12px; color: var(--color-text-soft); }

@media (max-width: 800px) {
  .layout { grid-template-columns: 1fr; }
  .side-nav { position: static; flex-direction: row; overflow-x: auto; }
}
</style>
