<script setup lang="ts">
import AppButton from '../../components/common/AppButton.vue'

const staff = [
  { name: 'M. Aquino', email: 'm.aquino@city.gov.ph', role: 'system_admin', contact: '+63 917 555 0001', last: '2 min ago', avatar: '#2c8780' },
  { name: 'A. Cruz', email: 'a.cruz@city.gov.ph', role: 'operator', contact: '+63 917 555 0125', last: 'just now', avatar: '#9c5bb8' },
  { name: 'P. Lim', email: 'p.lim@city.gov.ph', role: 'admin', contact: '+63 917 555 0188', last: '12 min ago', avatar: '#d96e2a' },
  { name: 'J. Fernandez', email: 'j.fernandez@city.gov.ph', role: 'operator', contact: '+63 917 555 0124', last: '4 hr ago', avatar: '#5fa470' },
  { name: 'R. Garcia', email: 'r.garcia@city.gov.ph', role: 'admin', contact: '+63 917 555 0151', last: '1 day ago', avatar: '#2c5fb8' },
]

const roleColor: Record<string, string> = {
  system_admin: 'var(--color-accent-700)',
  admin: 'var(--color-primary-700)',
  operator: 'var(--color-info)',
}
</script>

<template>
  <div class="page fade-up">
    <div class="page-head">
      <div>
        <h1>Staff management</h1>
        <p class="muted">System administrators, admins, and operators with system access.</p>
      </div>
      <div class="row" style="gap: 8px">
        <AppButton variant="secondary">Roles & permissions</AppButton>
        <AppButton variant="primary">+ Invite Staff</AppButton>
      </div>
    </div>

    <div class="grid stats">
      <div class="role-card">
        <strong>2</strong>
        <span>System Admins</span>
      </div>
      <div class="role-card">
        <strong>5</strong>
        <span>Admins</span>
      </div>
      <div class="role-card">
        <strong>14</strong>
        <span>Operators</span>
      </div>
      <div class="role-card">
        <strong>3</strong>
        <span>Pending invites</span>
      </div>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Contact</th>
            <th>Last Active</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in staff" :key="s.email">
            <td>
              <div class="user-cell">
                <span class="avatar" :style="{ background: s.avatar }">{{ s.name.split(' ').map(p => p[0]).join('') }}</span>
                <strong>{{ s.name }}</strong>
              </div>
            </td>
            <td class="muted">{{ s.email }}</td>
            <td><span class="role" :style="{ color: roleColor[s.role] }">{{ s.role }}</span></td>
            <td class="muted">{{ s.contact }}</td>
            <td class="muted small">{{ s.last }}</td>
            <td>
              <button class="row-link">Edit →</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.page-head { display: flex; align-items: end; justify-content: space-between; margin-bottom: 18px; }
.page-head h1 { margin: 0; }

.stats {
  grid-template-columns: repeat(4, 1fr);
  margin-bottom: 18px;
}
.role-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.role-card strong {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 800;
}
.role-card span {
  color: var(--color-text-soft);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
}

.user-cell { display: flex; align-items: center; gap: 12px; }
.avatar {
  width: 34px; height: 34px;
  border-radius: 50%;
  color: #fff;
  font-weight: 700;
  font-size: 12px;
  display: inline-flex; align-items: center; justify-content: center;
}
.role {
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.row-link {
  background: none; border: none;
  color: var(--color-primary-700);
  cursor: pointer; font-weight: 600; font-size: 13px;
}

@media (max-width: 720px) {
  .page-head { flex-direction: column; align-items: flex-start; gap: 10px; }
  .stats { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .stats { grid-template-columns: 1fr; }
}
</style>
