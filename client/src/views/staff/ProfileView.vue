<script setup lang="ts">
import { ref } from 'vue'
import AppButton from '../../components/common/AppButton.vue'
import { api } from '../../services/api'
import { useAuth } from '../../services/auth'

const { user } = useAuth()

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
      <h1>Profile</h1>
      <p class="muted">Your account details and security settings.</p>
    </div>

    <div class="layout">

      <!-- Profile info -->
      <div class="card card--padded section">
        <div class="section-head">
          <span class="big-avatar">{{ initials() }}</span>
          <div>
            <strong class="full-name">{{ user?.first_name }} {{ user?.last_name }}</strong>
            <div class="muted small">{{ roleLabel(user?.user_role) }}</div>
          </div>
        </div>

        <dl class="profile-kv">
          <dt>Email</dt>
          <dd>{{ user?.email }}</dd>
          <dt>Role</dt>
          <dd>{{ roleLabel(user?.user_role) }}</dd>
          <dt>Barangay</dt>
          <dd>{{ user?.barangay_name ?? '—' }}</dd>
        </dl>

        <p class="muted small note">
          Contact an admin if your name, email, or barangay assignment needs to change.
        </p>
      </div>

      <!-- Change password -->
      <div class="card card--padded section">
        <h2>Change password</h2>

        <div class="field">
          <label>Current password</label>
          <input v-model="pwForm.oldPassword" type="password" autocomplete="current-password" />
        </div>
        <div class="field">
          <label>New password</label>
          <input v-model="pwForm.newPassword" type="password" autocomplete="new-password" />
          <span class="hint">At least 8 characters.</span>
        </div>
        <div class="field">
          <label>Confirm new password</label>
          <input v-model="pwForm.confirmPassword" type="password" autocomplete="new-password" />
        </div>

        <div v-if="pwMsg" class="banner banner--ok">{{ pwMsg }}</div>
        <div v-if="pwError" class="banner banner--err">{{ pwError }}</div>

        <AppButton variant="primary" :disabled="pwSaving" @click="changePassword">
          {{ pwSaving ? 'Updating…' : 'Update password' }}
        </AppButton>
      </div>

    </div>
  </div>
</template>

<style scoped>
.page-head { margin-bottom: var(--space-4); }
.page-head h1 { margin: 0; }

.layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  align-items: start;
}

.section { display: flex; flex-direction: column; gap: var(--space-4); }
.section-head { display: flex; align-items: center; gap: var(--space-4); }
.section h2 { margin: 0; font-size: 16px; }

.full-name { font-size: 16px; font-weight: 700; display: block; }

.big-avatar {
  width: 56px; height: 56px;
  background: linear-gradient(135deg, var(--color-primary-400), var(--color-primary-700));
  color: #fff;
  border-radius: 50%;
  font-weight: 700; font-size: 18px;
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.profile-kv {
  display: grid;
  grid-template-columns: 100px 1fr;
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

.note { margin: 0; }

.field { display: flex; flex-direction: column; gap: var(--space-1); }
.field label { font-size: 13px; font-weight: 600; }
.field input {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  font-size: 14px;
  background: var(--color-surface);
}
.field input:focus { outline: 2px solid var(--color-primary-400); border-color: transparent; }
.hint { font-size: 12px; color: var(--color-text-soft); }

.banner {
  padding: var(--space-2-5, 10px) var(--space-3);
  border-radius: var(--radius-md);
  font-size: 13px;
  border: 1px solid;
}
.banner--ok { background: var(--color-success-bg); border-color: #c5e3d3; color: var(--color-success); }
.banner--err { background: var(--color-danger-bg); border-color: #f3c8c1; color: var(--color-danger); }

@media (max-width: 800px) {
  .layout { grid-template-columns: 1fr; }
}
</style>
