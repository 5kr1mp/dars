const BASE_URL = 'http://localhost:8000/api'

/** Shape of every response envelope from the DARS server. */
export interface ApiResponse<T = unknown> {
  status: 'success' | 'error'
  message: string
  data: T
  code: number
}

/**
 * Base fetch wrapper used by all `api.*` methods.
 *
 * - Attaches `Authorization: Bearer <token>` when a token exists in localStorage.
 * - Builds the query string from `params`, silently dropping empty-string values.
 * - Unwraps the response envelope and returns `json.data` directly.
 * - On 401: clears the stored session and hard-redirects to `/staff/login`.
 * - On any `status: "error"` response: throws with the server's message.
 */
async function request<T>(
  method: string,
  path: string,
  { body, params }: { body?: any; params?: Record<string, string> } = {},
): Promise<T> {
  const token = localStorage.getItem('dars_token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  let url = `${BASE_URL}${path}`
  if (params) {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '')),
    ).toString()
    if (qs) url += `?${qs}`
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401) {
    localStorage.removeItem('dars_token')
    localStorage.removeItem('dars_user')
    window.location.href = '/staff/login'
    throw new Error('Unauthorized')
  }

  const json: ApiResponse<T> = await res.json()

  if (json.status === 'error') {
    throw new Error(json.message)
  }

  return json.data
}

/**
 * Typed HTTP client for the DARS API.
 *
 * The generic parameter `<T>` is the expected shape of `json.data` in the
 * server's response envelope. Omit it to get `unknown`.
 *
 * @example
 * // GET with optional query params (empty strings are dropped automatically)
 * const reports = await api.get<Report[]>('/reports', { status: 'Reported', barangay_id: '' })
 *
 * // POST / PUT / PATCH with a request body
 * const result = await api.post<{ report_id: string }>('/reports', { victim_id: 1, ... })
 * await api.patch(`/reports/${id}/status`, { new_status: 'Dispatched' })
 *
 * // DELETE
 * await api.delete(`/staff/${id}`)
 */
export const api = {
  get: <T>(path: string, params?: Record<string, string>) =>
    request<T>('GET', path, { params }),
  post: <T>(path: string, body: unknown) =>
    request<T>('POST', path, { body }),
  put: <T>(path: string, body: unknown) =>
    request<T>('PUT', path, { body }),
  patch: <T>(path: string, body: unknown) =>
    request<T>('PATCH', path, { body }),
  delete: <T>(path: string) =>
    request<T>('DELETE', path),
}