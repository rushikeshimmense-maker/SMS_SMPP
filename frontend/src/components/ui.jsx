import { STATUS_STYLES } from '../lib/format.js'
import { XCircleIcon } from './Icons.jsx'

export function Card({ className = '', children }) {
  return (
    <div className={`min-w-0 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(20,20,43,0.05)] sm:p-5 ${className}`}>
      {children}
    </div>
  )
}

export function Chip({ status, children }) {
  const cls = STATUS_STYLES[status] || 'bg-gray-100 text-gray-500'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-[3px] text-[11.5px] font-bold capitalize ${cls}`}>
      {children || status}
    </span>
  )
}

export function Button({ variant = 'primary', className = '', children, ...rest }) {
  const styles = {
    primary: 'bg-brand-600 text-white shadow-md shadow-brand-600/25 hover:bg-brand-700 disabled:opacity-60',
    secondary: 'border border-gray-200 bg-white text-ink hover:bg-gray-50 disabled:opacity-60',
    ghost: 'text-gray-600 hover:bg-gray-100',
    danger: 'bg-rose-50 text-rose-600 hover:bg-rose-100',
  }
  return (
    <button
      type="button"
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-[14px] font-semibold transition disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-[13px] font-semibold text-gray-700">{label}</span>}
      {children}
      {hint && <span className="mt-1 block text-[12px] text-gray-400">{hint}</span>}
    </label>
  )
}

export const inputCls =
  'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[14px] text-ink outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

export function Modal({ open, onClose, title, children, width = 'max-w-lg' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`relative w-full ${width} max-h-[92dvh] overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl sm:max-h-[88vh] sm:rounded-2xl sm:p-6`}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[18px] font-extrabold tracking-tight text-ink">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
            <XCircleIcon className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Table({ headers, colAlign = {}, colWidths = [], children }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[850px] border-collapse text-left" style={{ tableLayout: colWidths.length ? 'fixed' : 'auto' }}>
        {colWidths.length > 0 && (
          <colgroup>
            {colWidths.map((w, i) => (
              <col key={i} style={{ width: w }} />
            ))}
          </colgroup>
        )}
        <thead>
          <tr>
            {headers.map((h, i) => {
              const isLast = i === headers.length - 1;
              return (
                <th key={h} className={`border-b border-gray-100 pb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 first:pl-4 whitespace-nowrap ${isLast ? 'pr-0' : 'pr-6'} ${colAlign[i] || 'text-left'}`}>
                  {h}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="text-[13.5px] text-gray-600">{children}</tbody>
      </table>
    </div>
  )
}

export function Td({ children, className = '' }) {
  return <td className={`border-b border-gray-50 py-3 pr-6 first:pl-4 ${className}`}>{children}</td>
}

export function StatCard({ label, value, sub, delta, accent = 'text-ink' }) {
  const up = (delta ?? 0) >= 0
  return (
    <Card>
      <div className="flex items-start justify-between">
        <span className="rounded-md bg-gray-50 px-2 py-[3px] text-[10.5px] font-bold uppercase tracking-wide text-gray-500">
          {label}
        </span>
        {delta !== undefined && (
          <span className={`text-[12px] font-bold ${up ? 'text-emerald-600' : 'text-rose-500'}`}>
            {up ? '▲' : '▼'} {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div className={`mt-2.5 text-[28px] font-extrabold tracking-tight ${accent}`}>{value}</div>
      {sub && <div className="mt-1 text-[12.5px] text-gray-400">{sub}</div>}
    </Card>
  )
}

export function EmptyRow({ colSpan, text = 'No records found' }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-10 text-center text-[13.5px] text-gray-400">
        {text}
      </td>
    </tr>
  )
}
