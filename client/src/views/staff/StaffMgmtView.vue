<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppButton from '../../components/common/AppButton.vue'

interface Staff {
  staff_id: number
  email: string
  full_name: string
  user_role: string
  contact_number: string | null
}

const staff = ref<Staff[]>([])
const loading = ref(false)
const error = ref('')

const roleColor: Record<string, string> = {
  system_admin: 'var(--color-accent-700)',
  admin: 'var(--color-primary-700)',
  operator: 'var(--color-info)',
}

async function fetchStaff() {
  loading.value = true
  error.value = ''

  try {
    const token = localStorage.getItem('token')

    const response = await fetch(
      'http://localhost:3000/api/staff',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data.message || 'Failed to fetch staff'
      )
    }

    staff.value = data.data
  } catch (err: any) {
    error.value =
      err.message || 'Something went wrong'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStaff()
})

const systemAdmins = computed(() =>
  staff.value.filter(
    (s) => s.user_role === 'system_admin',
  ).length,
)

const admins = computed(() =>
  staff.value.filter(
    (s) => s.user_role === 'admin',
  ).length,
)

const operators = computed(() =>
  staff.value.filter(
    (s) => s.user_role === 'operator',
  ).length,
)
</script>

<template>
  <div class="page fade-up">
    <div class="page-head">
      <div>
        <h1>Staff management</h1>

        <p class="muted">
          System administrators, admins,
          and operators with system access.
        </p>
      </div>

      <div class="row" style="gap: 8px">
        <AppButton variant="secondary">
          Roles & permissions
        </AppButton>

        <AppButton variant="primary">
          + Invite Staff
        </AppButton>
      </div>
    </div>

    <div
      v-if="loading"
      class="muted"
    >
      Loading staff members...
    </div>

    <div
      v-else-if="error"
      class="error-message"
    >
      {{ error }}
    </div>

    <template v-else>
      <div class="grid stats">
        <div class="role-card">
          <strong>
            {{ systemAdmins }}
          </strong>

          <span>System Admins</span>
        </div>

        <div class="role-card">
          <strong>
            {{ admins }}
          </strong>

          <span>Admins</span>
        </div>

        <div class="role-card">
          <strong>
            {{ operators }}
          </strong>

          <span>Operators</span>
        </div>

        <div class="role-card">
          <strong>
            {{ staff.length }}
          </strong>

          <span>Total Staff</span>
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
              <th></th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="s in staff"
              :key="s.staff_id"
            >
              <td>
                <div class="user-cell">
                  <span
                    class="avatar"
                    :style="{
                      background:
                        roleColor[
                          s.user_role
                        ] ||
                        'var(--color-primary-500)',
                    }"
                  >
                    {{
                      s.full_name
                        .split(' ')
                        .map((p) => p[0])
                        .join('')
                        .slice(0, 2)
                    }}
                  </span>

                  <strong>
                    {{ s.full_name }}
                  </strong>
                </div>
              </td>

              <td class="muted">
                {{ s.email }}
              </td>

              <td>
                <span
                  class="role"
                  :style="{
                    color:
                      roleColor[
                        s.user_role
                      ],
                  }"
                >
                  {{ s.user_role }}
                </span>
              </td>

              <td class="muted">
                {{
                  s.contact_number ||
                  'N/A'
                }}
              </td>

              <td>
                <button class="row-link">
                  Edit →
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.page-head h1 {
  margin: 0;
}

.stats {
  grid-template-columns: repeat(4, 1fr);
  margin-bottom: var(--space-4);
}

.role-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
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

.user-cell {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  color: #fff;
  font-weight: 700;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.role {
  font-size: 12px;
  font-weight: 700;
  padding: var(--space-1)
    var(--space-2-5, 10px);
  border-radius: var(--radius-full);
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.row-link {
  background: none;
  border: none;
  color: var(--color-primary-700);
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
}

.error-message {
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: rgba(255, 0, 0, 0.08);
  color: var(--color-danger);
  font-weight: 600;
}

@media (max-width: 720px) {
  .page-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .stats {
    grid-template-columns: repeat(
      2,
      1fr
    );
  }
}

@media (max-width: 480px) {
  .stats {
    grid-template-columns: 1fr;
  }
}
</style>