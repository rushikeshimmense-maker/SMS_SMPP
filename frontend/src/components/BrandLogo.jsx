import { useId } from 'react'

/** Neutral, reusable messaging mark for white-label deployments. */
export function BrandMark({ size = 52, variant = 'on-light', className = '' }) {
  const id = useId().replace(/:/g, '')
  const grad =
    variant === 'on-dark'
      ? ['#ffffff', '#ffc9cd', '#ff5a63', '#e30613']
      : ['#ff6b73', '#f4212b', '#c10e1e', '#9d0a18']

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 68 68"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`g-${id}`} x1="8" y1="8" x2="60" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={grad[0]} />
          <stop offset="0.38" stopColor={grad[1]} />
          <stop offset="0.72" stopColor={grad[2]} />
          <stop offset="1" stopColor={grad[3]} />
        </linearGradient>
      </defs>
      <rect x="6" y="8" width="56" height="46" rx="14" fill={`url(#g-${id})`} />
      <path d="M20 56l8-7h20" stroke={`url(#g-${id})`} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="31" r="3.5" fill="white" />
      <circle cx="34" cy="31" r="3.5" fill="white" />
      <circle cx="44" cy="31" r="3.5" fill="white" />
    </svg>
  )
}

export default function BrandLogo({
  variant = 'on-light',
  markSize = 50,
  className = '',
}) {
  const dark = variant === 'on-dark'
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <BrandMark size={markSize} variant={variant} />
      <div className="leading-none">
        <div
          className={`font-extrabold tracking-tight ${dark ? 'text-white' : 'text-ink'}`}
          style={{ fontSize: Math.round(markSize * 0.78) }}
        >
          SMSBridge
        </div>
      </div>
    </div>
  )
}
