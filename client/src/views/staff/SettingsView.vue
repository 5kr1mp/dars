<script setup lang="ts">
import { ref } from 'vue'
import AppButton from '../../components/common/AppButton.vue'

const tab = ref<'profile' | 'notifications' | 'security' | 'system'>('profile')
</script>

<template>
  <div class="page fade-up">
    <div class="page-head">
      <h1>Settings</h1>
      <p class="muted">Manage your account, notifications, and system preferences.</p>
    </div>

    <div class="layout">
      <nav class="side-nav card">
        <button :class="{ active: tab === 'profile' }" @click="tab = 'profile'"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 8px; display: inline;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>Profile</button>
        <button :class="{ active: tab === 'notifications' }" @click="tab = 'notifications'"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 8px; display: inline;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>Notifications</button>
        <button :class="{ active: tab === 'security' }" @click="tab = 'security'"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 8px; display: inline;"><path d="M12 22s8-4.5 8-11.5V5l-8-3-8 3v5.5C4 17.5 12 22 12 22z"></path></svg>Security</button>
        <button :class="{ active: tab === 'system' }" @click="tab = 'system'"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 8px; display: inline;"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>System</button>
      </nav>

      <div class="content card card--padded">
        <div v-if="tab === 'profile'" class="col">
          <h2>Profile</h2>
          <div class="row" style="gap: var(--space-4); align-items: center">
            <span class="big-avatar">AC</span>
            <div>
              <strong>A. Cruz</strong>
              <div class="muted small">Operator · Brgy. San Isidro</div>
              <button class="link" style="margin-top: var(--space-1)">Change photo</button>
            </div>
          </div>
          <div class="grid two">
            <div class="field">
              <label>First name</label>
              <input value="Anna" />
            </div>
            <div class="field">
              <label>Last name</label>
              <input value="Cruz" />
            </div>
            <div class="field">
              <label>Email</label>
              <input value="a.cruz@city.gov.ph" />
            </div>
            <div class="field">
              <label>Contact number</label>
              <input value="+63 917 555 0125" />
            </div>
          </div>
          <div class="actions">
            <AppButton variant="primary">Save changes</AppButton>
            <AppButton variant="ghost">Cancel</AppButton>
          </div>
        </div>

        <div v-if="tab === 'notifications'" class="col">
          <h2>Notifications</h2>
          <p class="muted">Choose how you'd like to be alerted to new and changing reports.</p>
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

        <div v-if="tab === 'security'" class="col">
          <h2>Security</h2>
          <div class="field">
            <label>Current password</label>
            <input type="password" />
          </div>
          <div class="grid two">
            <div class="field">
              <label>New password</label>
              <input type="password" />
            </div>
            <div class="field">
              <label>Confirm password</label>
              <input type="password" />
            </div>
          </div>
          <div class="security-row">
            <div>
              <strong>Two-factor authentication</strong>
              <div class="muted small">Add an extra layer of security to your account.</div>
            </div>
            <AppButton variant="secondary" size="sm">Enable</AppButton>
          </div>
          <div class="security-row">
            <div>
              <strong>Active sessions</strong>
              <div class="muted small">2 devices · Manila, Philippines · Last seen now</div>
            </div>
            <AppButton variant="ghost" size="sm">View all</AppButton>
          </div>
        </div>

        <div v-if="tab === 'system'" class="col">
          <h2>System preferences</h2>
          <div class="field">
            <label>Theme</label>
            <div class="theme-row">
              <button class="theme theme--light active"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle; margin-right: 4px; display: inline;"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>Light</button>
              <button class="theme theme--dark"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle; margin-right: 4px; display: inline;"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>Dark</button>
              <button class="theme theme--auto"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px; display: inline;"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>Auto</button>
            </div>
          </div>
          <div class="field">
            <label>Default barangay view</label>
            <select>
              <option>All assigned barangays</option>
              <option>Brgy. San Isidro</option>
              <option>Brgy. Maligaya</option>
            </select>
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

.big-avatar {
  width: 56px; height: 56px;
  background: linear-gradient(135deg, var(--color-primary-400), var(--color-primary-700));
  color: #fff;
  border-radius: 50%;
  font-weight: 700; font-size: 18px;
  display: inline-flex; align-items: center; justify-content: center;
}
.link {
  background: none;
  border: none;
  color: var(--color-primary-700);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
}

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

.security-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3-5, 14px) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-alt);
}

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
