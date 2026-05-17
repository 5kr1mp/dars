function toDate(raw: string): Date {
  return new Date(raw.replace(' ', 'T'))
}

export function formatTimestamp(raw: string): string {
  return toDate(raw).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatDate(raw: string): string {
  return toDate(raw).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatTimeAgo(raw: string): string {
  const diff = Date.now() - toDate(raw).getTime()
  const minutes = Math.floor(diff / 60_000)
  const hours   = Math.floor(diff / 3_600_000)
  const days    = Math.floor(diff / 86_400_000)

  if (minutes < 1)  return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours   < 24) return `${hours}h ago`
  if (days    < 30) return `${days}d ago`
  return formatDate(raw)
}

export function formatSeverity(severity: number): string {
  if (severity <= 3) return 'Low'
  if (severity <= 6) return 'Moderate'
  if (severity <= 8) return 'High'
  return 'Critical'
}
