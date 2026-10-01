import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const ToastCtx = createContext(() => {})

export function useToast() {
  return useContext(ToastCtx)
}

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)

  const push = useCallback((message, tone = 'info') => {
    setToast({ message, tone, id: Date.now() })
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  const tones = {
    info: 'bg-ink text-white',
    success: 'bg-emerald-600 text-white',
    error: 'bg-rose-600 text-white',
  }

  return (
    <ToastCtx.Provider value={push}>
      {children}
      {toast && (
        <div
          className={`fixed bottom-4 left-4 right-4 z-[80] flex max-w-[380px] items-start gap-3 rounded-xl px-4 py-3.5 text-white shadow-2xl sm:bottom-6 sm:left-auto sm:right-6 ${tones[toast.tone] || tones.info}`}
          role="status"
        >
          <p className="text-[13.5px] leading-snug">{toast.message}</p>
        </div>
      )}
    </ToastCtx.Provider>
  )
}
