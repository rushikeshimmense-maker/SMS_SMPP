/** Dependency-free SVG charts: AreaChart (traffic), DonutChart (delivery), Sparkline. */

export function AreaChart({ points, height = 240, series }) {
  if (!points?.length) return null
  const W = 640, H = height, PAD = { l: 34, r: 10, t: 12, b: 26 }
  const max = Math.max(1, ...points.flatMap((p) => series.map((s) => p[s.key] || 0)))
  const yMax = Math.ceil(max / 10) * 10 || 10
  const x = (i) => PAD.l + (i * (W - PAD.l - PAD.r)) / Math.max(1, points.length - 1)
  const y = (v) => PAD.t + (1 - v / yMax) * (H - PAD.t - PAD.b)

  const line = (key) => points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p[key] || 0).toFixed(1)}`).join(' ')
  const area = (key) => `${line(key)} L${x(points.length - 1).toFixed(1)} ${y(0)} L${x(0).toFixed(1)} ${y(0)} Z`
  const gridVals = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(yMax * f))
  const labelEvery = Math.ceil(points.length / 8)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Traffic chart">
      <defs>
        {series.map((s) => (
          <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={s.color} stopOpacity="0.18" />
            <stop offset="1" stopColor={s.color} stopOpacity="0.01" />
          </linearGradient>
        ))}
      </defs>
      {gridVals.map((v, gi) => (
        <g key={`${v}-${gi}`}>
          <line x1={PAD.l} y1={y(v)} x2={W - PAD.r} y2={y(v)} stroke="#eef0f3" strokeWidth="1.2" />
          <text x={2} y={y(v) + 4} fontSize="10.5" fill="#c3c7cf">{v}</text>
        </g>
      ))}
      {series.map((s) => (
        <g key={s.key}>
          <path d={area(s.key)} fill={`url(#fill-${s.key})`} />
          <path d={line(s.key)} fill="none" stroke={s.color} strokeWidth="2.6" strokeLinecap="round" />
          {points.map((p, i) => (
            <circle key={i} cx={x(i)} cy={y(p[s.key] || 0)} r="2.4" fill="#fff" stroke={s.color} strokeWidth="1.6">
              <title>{`${p.label}: ${p[s.key] || 0} ${s.label.toLowerCase()}`}</title>
            </circle>
          ))}
        </g>
      ))}
      {points.map((p, i) =>
        i % labelEvery === 0 ? (
          <text key={i} x={x(i)} y={H - 6} fontSize="10.5" fill="#c3c7cf" textAnchor="middle">{p.label}</text>
        ) : null,
      )}
    </svg>
  )
}

export function DonutChart({ segments, size = 180, label, sublabel }) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1
  const R = 62, C = 2 * Math.PI * R
  let offset = 0
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 160 160" style={{ width: size, height: size }} className="-rotate-90">
        <circle cx="80" cy="80" r={R} fill="none" stroke="#f1f2f5" strokeWidth="17" />
        {segments.map((s) => {
          const frac = s.value / total
          const dash = `${frac * C} ${C}`
          const el = (
            <circle
              key={s.label} cx="80" cy="80" r={R} fill="none" stroke={s.color} strokeWidth="17"
              strokeDasharray={dash} strokeDashoffset={-offset * C} strokeLinecap={frac > 0.03 ? 'round' : 'butt'}
            >
              <title>{`${s.label}: ${s.value}`}</title>
            </circle>
          )
          offset += frac
          return el
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="text-[26px] font-extrabold tracking-tight text-ink">{label}</div>
        {sublabel && <div className="mt-0.5 text-[11.5px] font-medium text-gray-400">{sublabel}</div>}
      </div>
    </div>
  )
}

export function Sparkline({ data, color = '#e30613', height = 36 }) {
  if (!data?.length) return null
  const W = 120, H = height
  const max = Math.max(1, ...data)
  const x = (i) => (i * W) / (data.length - 1)
  const y = (v) => H - 3 - (v / max) * (H - 8)
  const d = data.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
      <path d={`${d} L${W} ${H} L0 ${H} Z`} fill={color} opacity="0.09" />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
