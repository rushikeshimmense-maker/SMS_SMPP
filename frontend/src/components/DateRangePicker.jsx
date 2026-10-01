import React, { useState, useRef, useEffect } from 'react'

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
)

const ChevronDownIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
)

export default function DateRangePicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [activePreset, setActivePreset] = useState('today')
  const [customForm, setCustomForm] = useState({ from: value?.from || '', to: value?.to || '' })
  const ref = useRef()

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const fmtDate = (dString) => {
    if (!dString) return ''
    const d = new Date(dString)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const applyPreset = (preset) => {
    setActivePreset(preset)
    const end = new Date()
    let start = new Date()
    if (preset === 'today') {
      // today
    } else if (preset === '7d') {
      start.setDate(end.getDate() - 6)
    } else if (preset === '30d') {
      start.setDate(end.getDate() - 29)
    }
    const fromStr = start.toISOString().split('T')[0]
    const toStr = end.toISOString().split('T')[0]
    onChange({ from: fromStr, to: toStr })
    setOpen(false)
  }

  const applyCustom = () => {
    if (customForm.from && customForm.to) {
      setActivePreset('custom')
      onChange({ from: customForm.from, to: customForm.to })
      setOpen(false)
    }
  }

  // Derive display text
  let displayText = 'Select Range'
  if (value?.from && value?.to) {
    if (value.from === value.to) {
      displayText = `${fmtDate(value.from)}`
    } else {
      displayText = `${fmtDate(value.from)} - ${fmtDate(value.to)}`
    }
  } else if (value?.from) {
    displayText = `${fmtDate(value.from)}`
  } else if (value?.to) {
    displayText = `${fmtDate(value.to)}`
  }

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setOpen(!open)}
        className="flex h-[38px] items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[13px] font-bold text-ink shadow-sm hover:bg-gray-50 transition-colors"
      >
        <span className="text-gray-400"><CalendarIcon /></span>
        {displayText}
        <span className="ml-1 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-extrabold tracking-widest text-gray-500">IST</span>
        <span className="text-gray-400"><ChevronDownIcon /></span>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-[260px] z-50 rounded-2xl bg-white p-3 shadow-lg ring-1 ring-black/5">
          <div className="flex flex-col gap-1">
            <button 
              onClick={() => applyPreset('today')}
              className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-[14px] font-bold transition-colors \${activePreset === 'today' ? 'bg-[#E31B23] text-white' : 'text-gray-600 hover:bg-gray-100'}`} 
            >
              Today
              {activePreset === 'today' && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              )}
            </button>
            <button 
              onClick={() => applyPreset('7d')}
              className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-[14px] font-bold transition-colors \${activePreset === '7d' ? 'bg-[#E31B23] text-white' : 'text-gray-600 hover:bg-gray-100'}`} 
            >
              Last 7 days
              {activePreset === '7d' && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              )}
            </button>
            <button 
              onClick={() => applyPreset('30d')}
              className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-[14px] font-bold transition-colors \${activePreset === '30d' ? 'bg-[#E31B23] text-white' : 'text-gray-600 hover:bg-gray-100'}`} 
            >
              Last 30 days
              {activePreset === '30d' && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              )}
            </button>
          </div>

          <div className="my-3 h-px bg-gray-100"></div>

          <div>
            <div className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Custom Range</div>
            <div className="flex flex-col gap-2">
              <input 
                type="date" 
                value={customForm.from}
                onChange={e => setCustomForm({...customForm, from: e.target.value})}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[13px] font-semibold text-ink outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
              <input 
                type="date" 
                value={customForm.to}
                onChange={e => setCustomForm({...customForm, to: e.target.value})}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[13px] font-semibold text-ink outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
              <button 
                onClick={applyCustom}
                className="mt-1 w-full rounded-xl bg-[#F06B70] hover:bg-[#E31B23] px-4 py-2.5 text-[14px] font-bold text-white transition-colors"
              >
                Apply range
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
