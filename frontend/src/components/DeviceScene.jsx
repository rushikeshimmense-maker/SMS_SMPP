import { useEffect, useRef, useState } from 'react'
import { BrandMark } from './BrandLogo.jsx'
import { ChatDotsIcon, MiniIcon } from './Icons.jsx'

/* Scale a fixed-size canvas to fit its responsive wrapper. */
function useFitScale(ref, baseW) {
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      setScale(Math.min(1, el.clientWidth / baseW))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref, baseW])
  return scale
}

/* ---------------------------------------------------------------- */
/* Mini dashboard rendered at 1024×640 and scaled into the laptop.  */
/* ---------------------------------------------------------------- */
function MiniDashboard() {
  const menu = [
    { icon: 'dashboard', label: 'Dashboard', active: true },
    { icon: 'send', label: 'Send SMS' },
    { icon: 'campaigns', label: 'Campaigns' },
    { icon: 'reports', label: 'Reports' },
    { icon: 'smpp', label: 'SMPP' },
    { icon: 'settings', label: 'Settings' },
  ]
  const stats = [
    { label: 'Total Sent', value: '125,480', chip: 'bg-emerald-50 text-emerald-600' },
    { label: 'Delivered', value: '118,932', chip: 'bg-sky-50 text-sky-600' },
    { label: 'Failed', value: '2,341', chip: 'bg-rose-50 text-rose-600' },
    { label: 'Pending', value: '4,207', chip: 'bg-amber-50 text-amber-600' },
  ]
  return (
    <div
      className="flex h-full w-full bg-[#f4f5f8]"
      style={{ width: 1024, height: 640 }}
    >
      {/* Sidebar */}
      <aside className="flex w-[218px] flex-col border-r border-gray-100 bg-white">
        <div className="flex items-center gap-2.5 px-6 pb-4 pt-6">
          <BrandMark size={30} variant="on-light" />
          <div className="leading-none">
            <div className="text-[16px] font-extrabold tracking-tight text-ink">SMSBridge</div>
          </div>
        </div>
        <nav className="mt-3 flex flex-col gap-1.5 px-4">
          {menu.map((m) => (
            <div
              key={m.label}
              className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold ${
                m.active
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'text-gray-500'
              }`}
            >
              <MiniIcon name={m.icon} className="h-4 w-4" />
              {m.label}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-7">
        <header className="mb-5 flex items-center justify-between">
          <h2 className="text-[19px] font-extrabold text-ink">Dashboard</h2>
          <div className="flex items-center gap-3.5 text-gray-400">
            <MiniIcon name="search" className="h-[18px] w-[18px]" />
            <MiniIcon name="bell" className="h-[18px] w-[18px]" />
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-[12px] font-bold text-white">
              N
            </div>
          </div>
        </header>

        <div className="grid grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-white p-4 shadow-[0_1px_4px_rgba(20,20,43,0.06)]">
              <span className={`rounded-md px-2 py-[3px] text-[9.5px] font-bold ${s.chip}`}>
                {s.label}
              </span>
              <div className="mt-2 text-[21px] font-extrabold tracking-tight text-ink">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-[1fr_220px] gap-4">
          {/* Traffic chart */}
          <div className="rounded-xl bg-white p-4 shadow-[0_1px_4px_rgba(20,20,43,0.06)]">
            <div className="text-[13px] font-extrabold text-ink">SMS Traffic</div>
            <svg viewBox="0 0 520 210" className="mt-2 w-full">
              <defs>
                <linearGradient id="trafficFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#e30613" stopOpacity="0.22" />
                  <stop offset="1" stopColor="#e30613" stopOpacity="0.01" />
                </linearGradient>
              </defs>
              {[24, 62, 100, 138].map((y, i) => (
                <g key={y}>
                  <line x1="34" y1={y} x2="512" y2={y} stroke="#eef0f3" strokeWidth="1.4" />
                  <text x="10" y={y + 4} fontSize="11" fill="#c3c7cf">{[80, 60, 40, 20][i]}</text>
                </g>
              ))}
              <path
                d="M34 168 C 64 158, 84 164, 112 146 S 164 138, 192 122 S 244 116, 272 96 S 324 92, 352 74 S 404 68, 432 50 S 484 44, 512 30 L 512 176 L 34 176 Z"
                fill="url(#trafficFill)"
              />
              <path
                d="M34 168 C 64 158, 84 164, 112 146 S 164 138, 192 122 S 244 116, 272 96 S 324 92, 352 74 S 404 68, 432 50 S 484 44, 512 30"
                fill="none"
                stroke="#e30613"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              {['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'].map((t, i) => (
                <text key={t} x={34 + i * 95.6} y="198" fontSize="11" fill="#c3c7cf">{t}</text>
              ))}
            </svg>
          </div>

          {/* Delivery rate */}
          <div className="rounded-xl bg-white p-4 shadow-[0_1px_4px_rgba(20,20,43,0.06)]">
            <div className="text-[13px] font-extrabold text-ink">Delivery Rate</div>
            <div className="mt-2 flex justify-center">
              <svg viewBox="0 0 90 90" className="h-[92px] w-[92px] -rotate-90">
                <circle cx="45" cy="45" r="34" fill="none" stroke="#f1f2f5" strokeWidth="12" />
                <circle
                  cx="45" cy="45" r="34" fill="none" stroke="#e30613" strokeWidth="12"
                  strokeDasharray="202 214" strokeLinecap="round"
                />
                <circle
                  cx="45" cy="45" r="34" fill="none" stroke="#fbbf24" strokeWidth="12"
                  strokeDasharray="10 214" strokeDashoffset="-204" strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="mt-3 space-y-1.5">
              {[
                ['bg-brand-600', 'Delivered', '94.7%'],
                ['bg-amber-400', 'Pending', '3.4%'],
                ['bg-gray-300', 'Failed', '1.9%'],
              ].map(([c, l, v]) => (
                <div key={l} className="flex items-center gap-2 text-[10.5px]">
                  <span className={`h-2 w-2 rounded-full ${c}`} />
                  <span className="flex-1 font-medium text-gray-500">{l}</span>
                  <span className="font-bold text-ink">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function Laptop() {
  return (
    <div className="laptop-shadow w-[432px]">
      <div className="rounded-t-[14px] bg-[#17181c] p-[9px] pb-[7px]">
        <div className="relative overflow-hidden rounded-[7px] bg-white" style={{ height: 258 }}>
          <div className="origin-top-left" style={{ transform: 'scale(0.403)', width: 1024, height: 640 }}>
            <MiniDashboard />
          </div>
        </div>
      </div>
      {/* base */}
      <div className="mx-auto h-[11px] w-[112%] -translate-x-[5.3%] rounded-b-[10px] bg-gradient-to-b from-[#d3d6dd] via-[#b8bcc6] to-[#8f95a1]" />
      <div className="mx-auto h-[5px] w-[34%] rounded-b-[8px] bg-[#828894]" />
    </div>
  )
}

function Phone() {
  return (
    <div className="phone-shadow h-[268px] w-[138px] rounded-[26px] bg-[#0e0f13] p-[9px]">
      <div className="relative flex h-full flex-col items-center rounded-[19px] bg-white px-3.5 pt-11">
        <div className="absolute left-1/2 top-[7px] h-[5px] w-[34px] -translate-x-1/2 rounded-full bg-[#26272c]" />
        <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[17px] bg-brand-600 shadow-lg shadow-brand-600/40">
          <ChatDotsIcon className="h-7 w-7 text-white" />
        </div>
        <p className="mt-4 text-center text-[10.5px] font-bold leading-snug text-gray-700">
          Your message has
          <br />
          been delivered!
        </p>
        <p className="mt-auto mb-5 text-[8px] font-medium text-gray-400">10:24 AM</p>
      </div>
    </div>
  )
}

function Tower() {
  const s = { fill: 'none', stroke: '#ffffff', strokeLinecap: 'round', strokeLinejoin: 'round' }
  return (
    <svg viewBox="0 0 180 310" className="h-full w-auto" aria-hidden="true">
      {/* radio waves */}
      <g stroke="#ffffff" fill="none" strokeLinecap="round">
        <path d="M76 30 Q 67 17 76 4" strokeWidth="2.6" />
        <path d="M66 37 Q 51 17 66 -3" strokeWidth="2.6" opacity="0.72" />
        <path d="M56 44 Q 35 17 56 -10" strokeWidth="2.6" opacity="0.45" />
        <path d="M104 30 Q 113 17 104 4" strokeWidth="2.6" />
        <path d="M114 37 Q 129 17 114 -3" strokeWidth="2.6" opacity="0.72" />
        <path d="M124 44 Q 145 17 124 -10" strokeWidth="2.6" opacity="0.45" />
      </g>
      {/* mast */}
      <path d="M90 48 L90 16" {...s} strokeWidth="3.4" />
      <path d="M78 34 L102 34" {...s} strokeWidth="2.4" />
      <rect x="77" y="48" width="26" height="22" rx="2.5" {...s} strokeWidth="2.4" />
      <circle cx="68" cy="56" r="4.5" {...s} strokeWidth="2.2" />
      <circle cx="112" cy="56" r="4.5" {...s} strokeWidth="2.2" />
      {/* top platform */}
      <path d="M58 74 L122 74" {...s} strokeWidth="3.6" />
      {/* legs */}
      <path d="M52 296 L74 74" {...s} strokeWidth="3.2" />
      <path d="M128 296 L106 74" {...s} strokeWidth="3.2" />
      <path d="M74 296 L83 74" {...s} strokeWidth="1.9" opacity="0.8" />
      <path d="M106 296 L97 74" {...s} strokeWidth="1.9" opacity="0.8" />
      {/* horizontal braces */}
      <path d="M56 262 L124 262 M60 228 L120 228 M64 194 L116 194 M68 160 L112 160 M71 126 L109 126 M74 94 L106 94" {...s} strokeWidth="1.9" opacity="0.85" />
      {/* X lattice */}
      <g {...s} strokeWidth="1.25" opacity="0.55">
        <path d="M56 262 L120 228 M124 262 L60 228" />
        <path d="M60 228 L116 194 M120 228 L64 194" />
        <path d="M64 194 L112 160 M116 194 L68 160" />
        <path d="M68 160 L109 126 M112 160 L71 126" />
        <path d="M71 126 L106 94 M109 126 L74 94" />
      </g>
      {/* red pedestal */}
      <g stroke="none">
        <rect x="44" y="288" width="92" height="14" rx="4" fill="#ffffff" opacity="0.32" />
        <rect x="56" y="302" width="68" height="10" rx="3.5" fill="#ffffff" opacity="0.22" />
      </g>
    </svg>
  )
}

function CloudBadge() {
  return (
    <div className="relative animate-floaty">
      <svg viewBox="0 0 168 100" className="h-auto w-[168px] drop-shadow-lg">
        <defs>
          <linearGradient id="cloudG" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff6b73" />
            <stop offset="1" stopColor="#e30613" />
          </linearGradient>
        </defs>
        <path
          d="M38 94 C 16 94 4 78 6 60 C 8 45 21 35 36 38 C 41 18 60 6 80 12 C 92 0 118 2 126 20 C 148 16 164 34 160 54 C 166 70 154 94 130 94 Z"
          fill="url(#cloudG)"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center pb-3 text-[21px] font-extrabold tracking-wide text-white">
        SMPP
      </span>
    </div>
  )
}

function DotBubble() {
  return (
    <div className="relative -rotate-[6deg] animate-floaty">
      <div className="flex items-center gap-[7px] rounded-[18px] bg-brand-400 px-4 py-3.5 shadow-lg shadow-red-950/25">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-[9px] w-[9px] rounded-full bg-white" />
        ))}
      </div>
      <div className="absolute -bottom-[6px] left-5 h-0 w-0 border-l-[10px] border-t-[10px] border-l-transparent border-t-brand-400" />
    </div>
  )
}

export default function DeviceScene() {
  const wrapRef = useRef(null)
  const scale = useFitScale(wrapRef, 600)

  return (
    <div ref={wrapRef} className="relative mx-auto mt-10 w-full max-w-[600px]" style={{ height: 420 * scale }}>
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: 600, height: 420, transform: `scale(${scale})` }}
      >
        {/* dashed orbit */}
        <div className="absolute left-[262px] top-[8px] h-[318px] w-[318px] rounded-full border-2 border-dashed border-white/45" />

        {/* SMPP cloud */}
        <div className="absolute left-[352px] top-[-14px]">
          <CloudBadge />
        </div>

        {/* tower */}
        <div className="absolute left-[356px] top-[36px] h-[318px]">
          <Tower />
        </div>

        {/* chat "typing" bubble */}
        <div className="absolute left-[2px] top-[34px]">
          <DotBubble />
        </div>

        {/* laptop */}
        <div className="absolute bottom-[26px] left-0">
          <Laptop />
        </div>

        {/* phone */}
        <div className="absolute bottom-0 left-[318px]">
          <div className="animate-floaty-slow">
            <Phone />
          </div>
        </div>
      </div>
    </div>
  )
}
