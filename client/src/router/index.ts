import { createRouter, createWebHistory } from 'vue-router'
import type { UserRole } from '@/types'

import UserLayout from '../components/layout/UserLayout.vue'
import StaffLayout from '../components/layout/StaffLayout.vue'

import HomeView from '../views/user/HomeView.vue'
import ReportView from '../views/user/ReportView.vue'
import TrackView from '../views/user/TrackView.vue'
import ResourcesView from '../views/user/ResourcesView.vue'

import LoginView from '../views/staff/LoginView.vue'
import DashboardView from '../views/staff/DashboardView.vue'
import ReportsView from '../views/staff/ReportsView.vue'
import DispatchView from '../views/staff/DispatchView.vue'
import RespondersView from '../views/staff/RespondersView.vue'
import BarangaysView from '../views/staff/BarangaysView.vue'
import AbuseTypesView from '../views/staff/AbuseTypesView.vue'
import AuditView from '../views/staff/AuditView.vue'
import StaffMgmtView from '../views/staff/StaffMgmtView.vue'
import ProfileView from '../views/staff/ProfileView.vue'

const TOKEN_KEY = 'dars_token'
const USER_KEY = 'dars_user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: UserLayout,
      children: [
        { path: '', name: 'home', component: HomeView },
        { path: 'report', name: 'report', component: ReportView },
        { path: 'track', name: 'track', component: TrackView },
        { path: 'resources', name: 'resources', component: ResourcesView },
      ],
    },
    {
      path: '/staff/login',
      name: 'staff-login',
      component: LoginView,
    },
    {
      path: '/staff',
      component: StaffLayout,
      children: [
        { path: '', redirect: '/staff/dashboard' },
        { path: 'dashboard', name: 'staff-dashboard', component: DashboardView },
        { path: 'reports', name: 'staff-reports', component: ReportsView },
        { path: 'dispatch', name: 'staff-dispatch', component: DispatchView },
        { path: 'responders', name: 'staff-responders', component: RespondersView },
        { path: 'barangays', name: 'staff-barangays', component: BarangaysView },
        { path: 'abuse-types', name: 'staff-abuse-types', component: AbuseTypesView },
        { path: 'audit', name: 'staff-audit', component: AuditView },
        { path: 'staff', name: 'staff-staff', component: StaffMgmtView },
        { path: 'settings', name: 'staff-settings', component: ProfileView },
      ],
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  const isLoggedIn = !!localStorage.getItem(TOKEN_KEY)
  const isStaffRoute = to.path.startsWith('/staff') && to.name !== 'staff-login'

  if (isStaffRoute && !isLoggedIn) return { name: 'staff-login' }
  if (to.name === 'staff-login' && isLoggedIn) return { name: 'staff-dashboard' }

  if (isLoggedIn && isStaffRoute) {
    const storedUser = JSON.parse(localStorage.getItem(USER_KEY) ?? 'null')
    const userRole = storedUser?.role as UserRole | null

    const SYS_ADMIN_ROUTES = ['/staff/staff', '/staff/audit', '/staff/settings']
    const OP_ADMIN_ROUTES = [
      '/staff/dashboard', '/staff/reports', '/staff/dispatch',
      '/staff/responders', '/staff/barangays', '/staff/abuse-types', '/staff/settings',
    ]

    if (userRole === 'system_admin') {
      if (!SYS_ADMIN_ROUTES.some(p => to.path.startsWith(p))) return { name: 'staff-staff' }
    } else if (userRole === 'admin' || userRole === 'operator') {
      if (!OP_ADMIN_ROUTES.some(p => to.path.startsWith(p))) return { name: 'staff-dashboard' }
    }
  }
})

export default router
