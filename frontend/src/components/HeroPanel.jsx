import BrandLogo from './BrandLogo.jsx'
import DeviceScene from './DeviceScene.jsx'
import { BoltIcon, ChartTrendIcon, GlobeIcon, ShieldCheckIcon } from './Icons.jsx'

const features = [
  { Icon: BoltIcon, l1: 'High', l2: 'Deliverability' },
  { Icon: ShieldCheckIcon, l1: 'Secure', l2: '& Reliable' },
  { Icon: GlobeIcon, l1: 'Global', l2: 'Routes' },
  { Icon: ChartTrendIcon, l1: 'Real-time', l2: 'Reporting' },
]

export default function HeroPanel() {
  return (
    <section className="hero-surface relative hidden overflow-hidden px-14 py-12 text-white lg:flex lg:min-h-screen lg:w-[54%] lg:flex-col xl:px-16">
      {/* decorative swooshes */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 840 1040"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <path d="M-40 210 C 220 120, 520 180, 900 40 L 900 -60 L -40 -60 Z" fill="#ffffff" opacity="0.06" />
        <path d="M-40 620 C 260 520, 480 700, 900 560" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="90" fill="none" />
        <path d="M-60 1040 C 160 840, 420 920, 620 1040 Z" fill="#5c0510" opacity="0.28" />
        <circle cx="760" cy="120" r="300" fill="#ffffff" opacity="0.045" />
      </svg>

      {/* desktop header */}
      <header className="relative z-10">
        <BrandLogo variant="on-dark" markSize={58} />
        <div className="mt-5 flex items-center gap-3">
          <span className="h-[9px] w-[52px] rounded-[2px] bg-brand-400/90" />
          <p className="text-[12.5px] font-semibold tracking-[0.14em] text-white/95">
            SMART MESSAGING&nbsp;&nbsp;|&nbsp;&nbsp;GLOBAL REACH&nbsp;&nbsp;|&nbsp;&nbsp;BETTER CONNECTIVITY
          </p>
        </div>
      </header>

      {/* headline */}
      <div className="relative z-10 mt-12">
        <h1 className="text-[52px] font-extrabold leading-[1.08] tracking-tight xl:text-[56px]">
          SMS &amp; SMPP
          <br />
          Messaging Platform
        </h1>
        <p className="mt-5 max-w-[470px] text-[16.5px] leading-relaxed text-white/85">
          Send, manage and track your SMS campaigns with powerful SMPP connectivity and
          real-time reporting.
        </p>
      </div>

      {/* illustration */}
      <div className="relative z-10 flex flex-1 items-center">
        <DeviceScene />
      </div>

      {/* features */}
      <footer className="relative z-10 mt-8 grid max-w-[560px] grid-cols-4 items-center">
        {features.map(({ Icon, l1, l2 }, i) => (
          <div key={l1} className="flex items-center">
            {i > 0 && <span className="mr-6 h-16 w-px bg-white/25 xl:mr-8" />}
            <div className="flex flex-1 flex-col items-center gap-2.5 text-center">
              <Icon className="h-[30px] w-[30px]" />
              <p className="text-[14.5px] font-bold leading-tight">
                {l1}
                <br />
                {l2}
              </p>
            </div>
          </div>
        ))}
      </footer>
    </section>
  )
}
