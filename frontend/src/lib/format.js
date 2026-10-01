export const fmtNum = (n) => Number(n || 0).toLocaleString('en-US')

export const fmtMoney = (n) =>
  Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

/** Unlimited-credit accounts (superadmin tier) display the infinity sign. */
export const creditStr = (n, role) => (role === 'superadmin' ? '∞' : fmtMoney(n))

export function fmtTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function toCSV(rows, columns) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const head = columns.map((c) => esc(c.label)).join(',')
  const body = rows.map((r) => columns.map((c) => esc(c.get(r))).join(',')).join('\n')
  return `${head}\n${body}`
}

export function downloadCSV(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export const STATUS_STYLES = {
  delivered: 'bg-emerald-50 text-emerald-600',
  submitted: 'bg-sky-50 text-sky-600',
  pending: 'bg-amber-50 text-amber-600',
  failed: 'bg-rose-50 text-rose-600',
  scheduled: 'bg-violet-50 text-violet-600',
  dropped: 'bg-slate-100 text-slate-500',
  running: 'bg-sky-50 text-sky-600',
  completed: 'bg-emerald-50 text-emerald-600',
  paused: 'bg-amber-50 text-amber-600',
  draft: 'bg-gray-100 text-gray-500',
  bound: 'bg-emerald-50 text-emerald-600',
  unbound: 'bg-gray-100 text-gray-500',
  Approved: 'bg-emerald-50 text-emerald-600',
  Pending: 'bg-amber-50 text-amber-600',
  Active: 'bg-emerald-50 text-emerald-600',
  Degraded: 'bg-amber-50 text-amber-600',
  Invited: 'bg-violet-50 text-violet-600',
}
