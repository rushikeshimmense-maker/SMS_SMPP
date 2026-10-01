/* Lightweight inline SVG icons for the messaging platform UI. */

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function UserIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19.5c1.2-3.2 3.7-4.8 7-4.8s5.8 1.6 7 4.8" />
    </svg>
  )
}

export function LockIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base}>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2.2" />
      <path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5" />
      <path d="M12 14.4v2.2" />
    </svg>
  )
}

export function EyeIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base}>
      <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  )
}

export function EyeOffIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base}>
      <path d="M4 4.5 20 20" />
      <path d="M9.6 6.2A9.6 9.6 0 0 1 12 5.8c6 0 9.5 6.2 9.5 6.2a17 17 0 0 1-2.8 3.6M6.1 8A16.6 16.6 0 0 0 2.5 12S6 18.2 12 18.2a9.4 9.4 0 0 0 3.5-.66" />
      <path d="M10 10a2.8 2.8 0 0 0 3.9 3.9" />
    </svg>
  )
}

export function GlobeIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M3.6 9.4h16.8M3.6 14.6h16.8" />
      <path d="M12 3.4c2.3 2.3 3.5 5.2 3.5 8.6S14.3 18.3 12 20.6C9.7 18.3 8.5 15.4 8.5 12S9.7 5.7 12 3.4Z" />
    </svg>
  )
}

export function ChevronDownIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base} strokeWidth={2.2}>
      <path d="m6 9.5 6 6 6-6" />
    </svg>
  )
}

export function ArrowRightIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base} strokeWidth={2.2}>
      <path d="M4.5 12h15" />
      <path d="m13.5 6 6 6-6 6" />
    </svg>
  )
}

export function ShieldCheckIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base}>
      <path d="M12 3.2 19 5.7v5.5c0 4.3-2.8 7.7-7 9.6-4.2-1.9-7-5.3-7-9.6V5.7L12 3.2Z" />
      <path d="m8.9 11.9 2.1 2.1 4.1-4.2" />
    </svg>
  )
}

export function BoltIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base}>
      <path d="M13.2 2.8 5.6 13.4h5.1l-.9 7.8 7.7-10.7h-5.2l.9-7.7Z" />
    </svg>
  )
}

export function ChartTrendIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base}>
      <path d="M4 4.5v15h16" />
      <path d="M7.5 15.5v-3M11.5 15.5v-6M15.5 15.5v-4.5" />
      <path d="m13.5 8 2.4-2.4L19 8.6" />
    </svg>
  )
}

export function CheckIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base} strokeWidth={3}>
      <path d="m5 12.5 5 5 9-10" />
    </svg>
  )
}

export function ChatDotsIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.5 4.2h15A2.3 2.3 0 0 1 21.8 6.5v9a2.3 2.3 0 0 1-2.3 2.3h-8.4L6.7 21v-3.2h-2.2a2.3 2.3 0 0 1-2.3-2.3v-9a2.3 2.3 0 0 1 2.3-2.3Z" />
      <circle cx="8.3" cy="11" r="1.25" fill="#e30613" />
      <circle cx="12" cy="11" r="1.25" fill="#e30613" />
      <circle cx="15.7" cy="11" r="1.25" fill="#e30613" />
    </svg>
  )
}

export function SpinnerIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={`animate-spin-slow ${className}`} viewBox="0 0 24 24" {...base}>
      <path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5" />
    </svg>
  )
}

export function XCircleIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="m9 9 6 6M15 9l-6 6" />
    </svg>
  )
}

export function PlusIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base} strokeWidth={2.2}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function CopyIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5" />
    </svg>
  )
}

export function DownloadIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base} strokeWidth={2.1}>
      <path d="M12 4v11M7.5 11 12 15.5 16.5 11" />
      <path d="M4.5 19.5h15" />
    </svg>
  )
}

export function RefreshIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base}>
      <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" />
      <path d="M19.5 3.5V7h-3.5" />
    </svg>
  )
}

export function PauseIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  )
}

export function PlayIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
    </svg>
  )
}

export function BellIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base}>
      <path d="M6.5 10a5.5 5.5 0 1 1 11 0c0 4 1.5 5.5 1.5 5.5H5S6.5 14 6.5 10Z" />
      <path d="M10.2 18.5a2 2 0 0 0 3.6 0" />
    </svg>
  )
}

export function LogOutIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base}>
      <path d="M14 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" />
      <path d="M9 12h11M16.5 8.5 20 12l-3.5 3.5" />
    </svg>
  )
}

export function CalendarIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base}>
      <rect x="4" y="5.5" width="16" height="15" rx="2" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    </svg>
  )
}

export function UsersIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base}>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3.5 19c.9-2.8 2.9-4.2 5.5-4.2s4.6 1.4 5.5 4.2" />
      <circle cx="17" cy="9.5" r="2.5" />
      <path d="M16.2 14.2c2.2.2 3.7 1.4 4.3 3.8" />
    </svg>
  )
}

export function KeyIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base}>
      <circle cx="8" cy="14" r="4" />
      <path d="m11 11 8-8M16 6l3 3M13.5 8.5l2 2" />
    </svg>
  )
}

export function InfoIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...base}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 11v5" />
      <path d="M12 8.1h.01" />
    </svg>
  )
}

/* ------- tiny icons for the laptop dashboard mockup ------- */
export function MiniIcon({ name, className = 'h-3.5 w-3.5' }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (name) {
    
    case 'plus':
      return (
        <svg className={className} viewBox="0 0 24 24" {...p}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      )
    case 'minus':
      return (
        <svg className={className} viewBox="0 0 24 24" {...p}>
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      )
    case 'chevron-down':
      return (
        <svg className={className} viewBox="0 0 24 24" {...p}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      )
    case 'chevron-right':
      return (
        <svg className={className} viewBox="0 0 24 24" {...p}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )
    case 'dashboard':
      return (
        <svg className={className} viewBox="0 0 24 24" {...p}>
          <rect x="4" y="4" width="6.5" height="6.5" rx="1.2" />
          <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2" />
          <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2" />
          <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2" />
        </svg>
      )
    case 'send':
      return (
        <svg className={className} viewBox="0 0 24 24" {...p}>
          <path d="M20.5 3.5 10 14" />
          <path d="M20.5 3.5 14 20.5l-4-6.5-6.5-4 17-6.5Z" />
        </svg>
      )
    case 'campaigns':
      return (
        <svg className={className} viewBox="0 0 24 24" {...p}>
          <path d="M4 10v4a2 2 0 0 0 2 2h2l8 4.5v-15L8 10H4Z" />
          <path d="M19 9.2a3.6 3.6 0 0 1 0 5.6" />
        </svg>
      )
    case 'reports':
      return (
        <svg className={className} viewBox="0 0 24 24" {...p}>
          <path d="M7 3.5h7l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9.5A1.5 1.5 0 0 1 5.5 20V5A1.5 1.5 0 0 1 7 3.5Z" />
          <path d="M9 13h6M9 16.5h6M9 9.5h2.5" />
        </svg>
      )
    case 'smpp':
      return (
        <svg className={className} viewBox="0 0 24 24" {...p}>
          <path d="M8 7 4 12l4 5M16 7l4 5-4 5" />
          <path d="M13.5 5 10.5 19" />
        </svg>
      )
    case 'settings':
      return (
        <svg className={className} viewBox="0 0 24 24" {...p}>
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M18 6l-1.6 1.6M7.6 16.4 6 18" />
        </svg>
      )
    case 'contacts':
      return (
        <svg className={className} viewBox="0 0 24 24" {...p}>
          <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.1a7.5 7.5 0 0 1 15 0A17.9 17.9 0 0 1 12 21.75c-2.7 0-5.25-.6-7.5-1.65Z" />
        </svg>
      )
    case 'gateway':
      return (
        <svg className={className} viewBox="0 0 24 24" {...p}>
          <path d="M8 21h8m-4-4v4M3 6.2 12 2l9 4.2M5 12h14v5H5z" />
          <path d="M12 12v5" />
        </svg>
      )
    case 'integrations':
      return (
        <svg className={className} viewBox="0 0 24 24" {...p}>
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      )
    case 'search':
      return (
        <svg className={className} viewBox="0 0 24 24" {...p}>
          <circle cx="10.8" cy="10.8" r="6.3" />
          <path d="m15.5 15.5 4 4" />
        </svg>
      )
    case 'bell':
      return (
        <svg className={className} viewBox="0 0 24 24" {...p}>
          <path d="M6.5 10a5.5 5.5 0 1 1 11 0c0 4 1.5 5.5 1.5 5.5H5S6.5 14 6.5 10Z" />
          <path d="M10.2 18.5a2 2 0 0 0 3.6 0" />
        </svg>
      )
    default:
      return null
  }
}
