import type { SafeUser, UserRole } from '@/types';
import { reactive, computed } from 'vue'
import { api } from './api'
/** Public user fields returned by the server after login (no password). */
interface LoginData {
  token: string
  safe_user: SafeUser
}

// localStorage key names kay key:value pair ang localstorage
const TOKEN_KEY = 'dars_token'
const USER_KEY = 'dars_user'

/**
 * Module-level reactive state shared across all `useAuth()` calls.
 * Seeded from localStorage so the session survives a page refresh.
 */
const state = reactive({
  token: localStorage.getItem(TOKEN_KEY) as string | null,
  user: JSON.parse(localStorage.getItem(USER_KEY) ?? 'null') as SafeUser | null,
})

/**
 * Composable for reading and managing the current staff session.
 *
 * Because `state` is module-level, every component that calls `useAuth()`
 * shares the same reactive object.
 *
 * @example
 * const { isLoggedIn, user, role, login, logout } = useAuth()
 *
 * // Log in (calls POST /auth/login, stores token, redirects to dashboard)
 * await login(email, password)
 *
 * // Check role before showing admin-only UI
 * if (role.value === 'system_admin') { ... }
 *
 * // Log out (clears session, redirects to /staff/login)
 * logout()
 */
export const useAuth = () => {
  /** `true` when a JWT is present in the session. */
  const isLoggedIn = computed(() => !!state.token)

  /** The currently authenticated staff member, or `null` if not logged in. */
  const user = computed(() => state.user)

  /** Role of the current user: `'system_admin'`, `'admin'`, `'operator'`, or `null`. */
  const role = computed(() => state.user?.user_role)

  /** Barangay assignment of the staff */
  const barangay = computed(() => state.user?.barangay_name)

  /**
   * Authenticates via `POST /auth/login`, persists the JWT and user profile
   * to localStorage, updates reactive state, then navigates to the dashboard.
   *
   * @throws If credentials are invalid or the server returns an error.
   */
  async function login(email: string, password: string): Promise<void> {
    const res = await api.post<LoginData>('/auth/login', { email, password })
    const loginData = res.data;
    state.token = loginData.token
    state.user = loginData.safe_user
    localStorage.setItem(TOKEN_KEY, loginData.token)
    localStorage.setItem(USER_KEY, JSON.stringify(loginData.safe_user))
    window.location.href = '/staff/dashboard'
  }

  /**
   * Clears token from both local storage and auth.ts
   */
  function logout(): void {
    state.token = null
    state.user = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    window.location.href = '/staff/login'
  }

  return { isLoggedIn, user, role, barangay, login, logout}
}