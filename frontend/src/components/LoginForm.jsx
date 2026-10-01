import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useAuth } from '../lib/auth.jsx'
import BrandLogo from './BrandLogo.jsx'
import { Modal, Button, Field, inputCls } from './ui.jsx'
import { useToast } from './Toast.jsx'
import {
  ArrowRightIcon, CheckIcon, ChevronDownIcon, EyeIcon, EyeOffIcon,
  GlobeIcon, InfoIcon, LockIcon, SpinnerIcon, UserIcon,
} from './Icons.jsx'

const LANGUAGES = ['English', 'हिन्दी', 'Español', 'Français', 'العربية']

function LanguageSelect({ lang, onPick }) {
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)

  useEffect(() => {
    function onDoc(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[14px] font-medium text-ink shadow-sm transition hover:border-gray-300"
      >
        <GlobeIcon className="h-[18px] w-[18px] text-gray-600" />
        {lang}
        <ChevronDownIcon className="h-3.5 w-3.5 text-gray-500" />
      </button>
      {open && (
        <ul className="absolute right-0 z-30 mt-2 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-xl">
          {LANGUAGES.map((l) => (
            <li key={l}>
              <button
                type="button"
                onClick={() => { onPick(l); setOpen(false) }}
                className={`flex w-full items-center justify-between px-4 py-2 text-left text-[14px] transition hover:bg-gray-50 ${
                  l === lang ? 'font-semibold text-brand-600' : 'text-gray-700'
                }`}
              >
                {l}
                {l === lang && <CheckIcon className="h-3.5 w-3.5" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function LoginForm() {
  const navigate = useNavigate()
  const toast = useToast()
  const { login } = useAuth()

  const [lang, setLang] = useState('English')
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // forgot password modal
  const [forgot, setForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')

  // second login step, displayed in this same page layout
  const [security, setSecurity] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!userId.trim()) errs.userId = 'User ID is required'
    if (!password) errs.password = 'Password is required'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    try {
      await api('/auth/login', { method: 'POST', body: { userId, password, remember } })
      const q = await api('/auth/security-question', { method: 'POST', body: { userId } })
      if (q.setupRequired) setSecurity({ setupRequired: true, question: "", answer: "" }); else setSecurity({ question: q.question, answer: "" })
      setErrors({})
    } catch (err) {
      setErrors({ password: err.message })
    } finally {
      setLoading(false)
    }
  }

    async function setupSecurity(e) {
    e.preventDefault()
    if (!security?.question.trim() || !security?.answer.trim()) {
      setErrors({ answer: 'Both question and answer are required' })
      return
    }
    setLoading(true)
    try {
      const d = await api('/auth/setup-security', { method: 'POST', body: { userId, question: security.question, answer: security.answer } })
      login(d.token, remember, d.user)
      navigate('/dashboard')
    } catch (err) {
      setErrors({ answer: err.message })
    } finally {
      setLoading(false)
    }
  }

  async function answerQuestion(e) {
    e.preventDefault()
    if (!security?.answer.trim()) {
      setErrors({ answer: 'Security answer is required' })
      return
    }
    setLoading(true)
    try {
      const d = await api('/auth/security-answer', { method: 'POST', body: { userId, answer: security.answer } })
      login(d.token, remember, d.user)
      navigate('/dashboard')
    } catch (err) {
      setErrors({ answer: err.message })
    } finally {
      setLoading(false)
    }
  }

  async function sendReset() {
    try {
      await api('/auth/forgot', { method: 'POST', body: { email: forgotEmail } })
      setForgot(false)
      setForgotEmail('')
      toast('If that account exists, a reset link has been sent.', 'success')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const fieldBase =
    'h-[56px] w-full rounded-xl border bg-white py-[17px] pl-[52px] text-[15px] leading-[20px] text-ink outline-none transition placeholder:text-gray-400'

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-white px-5 pb-6 pt-20 sm:px-10 lg:w-[46%] lg:px-12 lg:pt-8 xl:px-16">
      {/* language */}
      <div className="absolute right-6 top-6 sm:right-8 lg:right-10">
        <LanguageSelect
          lang={lang}
          onPick={(l) => {
            setLang(l)
            if (l !== 'English') toast(`${l} selected — full translations arrive in a later step.`)
          }}
        />
      </div>

      {/* centered auth card */}
      <div className="mx-auto flex w-full max-w-[452px] flex-1 flex-col justify-center py-10">
        <BrandLogo variant="on-light" markSize={54} className="self-center" />

        <h1 className="mt-9 text-center text-[31px] font-extrabold tracking-tight text-ink">
          {security ? 'Security Verification' : 'Welcome Back'}
        </h1>
        <p className="mt-2 text-center text-[15.5px] text-muted">
          {security ? 'Answer your security question to continue' : 'Sign in to your SMS & SMPP account'}
        </p>

        {!security ? (
        <form onSubmit={handleSubmit} noValidate className="mt-9 space-y-4">
          {/* User ID */}
          <div>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <UserIcon className="h-[21px] w-[21px]" />
              </span>
              <input
                type="text"
                autoComplete="username"
                placeholder="User ID"
                value={userId}
                onChange={(e) => { setUserId(e.target.value); setErrors({}) }}
                className={`${fieldBase} pr-4 ${
                  errors.userId ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100'
                }`}
              />
            </div>
            {errors.userId && <p className="mt-1.5 pl-1 text-[12.5px] font-medium text-red-500">{errors.userId}</p>}
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <LockIcon className="h-[21px] w-[21px]" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors({}) }}
                className={`${fieldBase} pr-12 ${
                  errors.password ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
              >
                {showPassword ? <EyeOffIcon className="h-[21px] w-[21px]" /> : <EyeIcon className="h-[21px] w-[21px]" />}
              </button>
            </div>
            {errors.password && <p className="mt-1.5 pl-1 text-[12.5px] font-medium text-red-500">{errors.password}</p>}
          </div>

          {/* remember / forgot */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex cursor-pointer select-none items-center gap-2.5">
              <input type="checkbox" className="sr-only" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span
                className={`flex h-[21px] w-[21px] items-center justify-center rounded-[6px] border transition ${
                  remember ? 'border-brand-600 bg-brand-600 text-white' : 'border-gray-300 bg-white text-transparent'
                }`}
              >
                <CheckIcon className="h-3 w-3" />
              </span>
              <span className="text-[14.5px] font-medium text-gray-700">Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => setForgot(true)}
              className="text-[14px] font-semibold text-brand-600 transition hover:text-brand-700 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          {/* login */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex h-[56px] w-full items-center justify-center gap-2.5 rounded-xl bg-brand-600 text-[17px] font-bold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-80"
          >
            {loading ? (
              <><SpinnerIcon className="h-5 w-5" /> Signing in…</>
            ) : (
              <>Login <ArrowRightIcon className="h-5 w-5" /></>
            )}
          </button>
        </form>
        ) : security.setupRequired ? (
          <form onSubmit={setupSecurity} noValidate className="mt-9 space-y-4">
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 mb-4">
              <div className="text-[13px] font-bold text-blue-800">Set Security Question</div>
              <div className="mt-1 text-[13px] text-blue-600">You are logging in for the first time. Set a security question and answer.</div>
            </div>
            <div>
              <div className="relative">
                <select
                    value={security.question}
                    onChange={(e) => { setSecurity({ ...security, question: e.target.value }); setErrors({}) }}
                    className="h-[56px] w-full rounded-xl border border-gray-200 bg-white px-4 text-[15px] leading-[20px] text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 placeholder:text-gray-400 appearance-none bg-no-repeat"
                    style={{ backgroundPosition: 'right 16px center', backgroundImage: `url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")` }}
                  >
                    <option value="" disabled>Select a security question</option>
                    <option value="What is your favorite color?">What is your favorite color?</option>
                    <option value="What is your pet's name?">What is your pet's name?</option>
                    <option value="In what city were you born?">In what city were you born?</option>
                  </select>
              </div>
            </div>
            <div>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <LockIcon className="h-[21px] w-[21px]" />
                </span>
                <input
                  type="text"
                  placeholder="Security answer"
                  value={security.answer}
                  onChange={(e) => { setSecurity({ ...security, answer: e.target.value }); setErrors({}) }}
                  className={`${fieldBase} pr-4 border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100`}
                />
              </div>
              {errors.answer && <p className="mt-1.5 pl-1 text-[12.5px] font-medium text-red-500">{errors.answer}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex h-[56px] w-full items-center justify-center gap-2.5 rounded-xl bg-brand-600 text-[17px] font-bold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-80"
            >
              {loading ? <><SpinnerIcon className="h-5 w-5" /> Saving…</> : <>Save & Continue <ArrowRightIcon className="h-5 w-5" /></>}
            </button>
            <button
              type="button"
              onClick={() => { setSecurity(null); setErrors({}); setPassword('') }}
              className="h-11 w-full text-[14px] font-semibold text-gray-500 transition hover:text-brand-600"
            >
              ← Back to login
            </button>
          </form>
        ) : (
          <form onSubmit={answerQuestion} noValidate className="mt-9 space-y-4">
            <div className="rounded-xl border border-gray-100 bg-[#fafbfc] p-4">
              <div className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Security question</div>
              <div className="mt-1.5 text-[15px] font-semibold leading-relaxed text-ink">{security.question}</div>
            </div>
            <div>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <LockIcon className="h-[21px] w-[21px]" />
                </span>
                <input
                  autoFocus
                  type="password"
                  autoComplete="off"
                  placeholder="Security answer"
                  value={security.answer}
                  onChange={(e) => { setSecurity({ ...security, answer: e.target.value }); setErrors({}) }}
                  className={`${fieldBase} pr-4 ${
                    errors.answer ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100'
                  }`}
                />
              </div>
              {errors.answer && <p className="mt-1.5 pl-1 text-[12.5px] font-medium text-red-500">{errors.answer}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex h-[56px] w-full items-center justify-center gap-2.5 rounded-xl bg-brand-600 text-[17px] font-bold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-80"
            >
              {loading ? <><SpinnerIcon className="h-5 w-5" /> Verifying…</> : <>Verify & Continue <ArrowRightIcon className="h-5 w-5" /></>}
            </button>
            <button
              type="button"
              onClick={() => { setSecurity(null); setErrors({}); setPassword('') }}
              className="h-11 w-full text-[14px] font-semibold text-gray-500 transition hover:text-brand-600"
            >
              ← Back to login
            </button>
          </form>
        )}
      {/* demo hint */}
        {!security && <div className="mt-6 text-center">
          <p className="mb-2 text-[11.5px] font-semibold uppercase tracking-wide text-gray-400">Demo accounts — tap to fill</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              ['superadmin', 'super@123', 'Super Admin', 'bg-rose-50 text-rose-600 border-rose-200'],
              ['reseller1', 'reseller@123', 'Reseller', 'bg-violet-50 text-violet-600 border-violet-200'],
              ['user1', 'user@123', 'User', 'bg-emerald-50 text-emerald-600 border-emerald-200'],
            ].map(([u, p, label, cls]) => (
              <button
                key={u}
                type="button"
                onClick={() => { setUserId(u); setPassword(p); setErrors({}) }}
                className={`flex items-center gap-1.5 rounded-full border border-dashed px-3.5 py-1.5 text-[12px] font-bold transition hover:opacity-80 ${cls}`}
              >
                {label} · {u}
              </button>
            ))}
          </div>
        </div>}
      </div>

      {/* footer */}
      <footer className="pb-2 text-center">
        <p className="text-[13.5px] text-gray-400">
          © {new Date().getFullYear()} SMSBridge. All rights reserved.
        </p>
        <p className="mt-1.5 text-[13px] font-semibold">
          <button type="button" className="text-brand-600 hover:underline">SMS</button>
          <span className="mx-2 text-gray-300">|</span>
          <button type="button" className="text-brand-600 hover:underline">SMPP</button>
          <span className="mx-2 text-gray-300">|</span>
          <button type="button" className="text-brand-600 hover:underline">Global Messaging Platform</button>
        </p>
      </footer>

      {/* forgot password modal */}
      <Modal open={forgot} onClose={() => setForgot(false)} title="Reset your password" width="max-w-md">
        <p className="mb-4 text-[13.5px] leading-relaxed text-gray-500">
          Enter the email linked to your account and we&apos;ll send a reset link.
        </p>
        <Field label="Email address">
          <input className={inputCls} type="email" placeholder="you@company.com"
            value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
        </Field>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setForgot(false)}>Cancel</Button>
          <Button onClick={sendReset} disabled={!forgotEmail.trim()}>Send reset link</Button>
        </div>
      </Modal>

    </div>
  )
}






