import { useEffect } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { useToast } from './Toast.jsx'
import HeroPanel from './HeroPanel.jsx'
import LoginForm from './LoginForm.jsx'

export default function LoginPage() {
  const { user, booting } = useAuth()
  const [params] = useSearchParams()
  const toast = useToast()

  useEffect(() => {
    if (params.get('session') === 'expired') {
      toast('Your session has expired. Please sign in again.', 'error')
    }
  }, [params, toast])

  // keep authenticated users inside the panel (never look "logged out")
  // Allows the owner to review the login screen without ending an active demo session.
  if (user && params.get('preview') !== 'login') return <Navigate to="/dashboard" replace />

  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-[14px] font-semibold text-gray-400">Loading platform…</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-white">
      <HeroPanel />
      <LoginForm />
    </div>
  )
}
