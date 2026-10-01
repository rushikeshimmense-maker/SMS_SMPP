import { Component } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth.jsx'
import { ToastProvider } from './components/Toast.jsx'
import LoginPage from './components/LoginPage.jsx'
import AppLayout from './components/AppLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import SendSms from './pages/SendSms.jsx'
import Campaigns from './pages/Campaigns.jsx'
import Contacts from './pages/Contacts.jsx'
import Reports from './pages/Reports.jsx'
import Users from './pages/Users.jsx'
import SmppCenter from './pages/SmppCenter.jsx'
import MySmpp from './pages/MySmpp.jsx'
import Billing from './pages/Billing.jsx'
import Packages from './pages/Packages.jsx'
import Docs from './pages/Docs.jsx'
import Admin from './pages/Admin.jsx'
import Profile from './pages/Profile.jsx'
import Settings from './pages/Settings.jsx'
import Approvals from './pages/Approvals.jsx'; import MyDlt from './pages/MyDlt.jsx';
import TrafficRouting from './pages/TrafficRouting.jsx'
import GatewayCenter from './pages/GatewayCenter.jsx'
import Integrations from './pages/Integrations.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[app] render failure', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-lg rounded-2xl border border-red-100 bg-white p-8 text-center shadow-xl">
          <h1 className="text-2xl font-extrabold text-gray-900">The panel could not load</h1>
          <p className="mt-3 text-sm text-gray-500">Refresh the page. If the problem continues, contact your administrator.</p>
          <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs text-left overflow-auto rounded whitespace-pre-wrap">{String(this.state.error.stack || this.state.error)}</div>
          <button onClick={() => window.location.reload()} className="mt-6 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white">Reload panel</button>
        </div>
      </div>
    )
  }
}

function Protected({ children, roles }) {
  const { user, booting } = useAuth()
  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-[14px] font-semibold text-gray-400">Loading platform…</div>
      </div>
    )
  }
  if (!user) return <Navigate to="/" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return children
}

function SmppRoute() {
  const { user } = useAuth()
  return user?.role === 'user' ? <MySmpp /> : <SmppCenter />
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ErrorBoundary>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            element={
              <Protected>
                <AppLayout />
              </Protected>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/send" element={<SendSms />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/users" element={<Protected roles={['superadmin', 'reseller']}><Users /></Protected>} />
            <Route path="/smpp" element={<SmppRoute />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/traffic-routing" element={<Protected roles={['superadmin', 'reseller']}><TrafficRouting /></Protected>} />
            <Route path="/gateway" element={<Protected roles={['superadmin']}><GatewayCenter /></Protected>} />
            <Route path="/integrations" element={<Protected roles={['superadmin', 'reseller', 'user']}><Integrations /></Protected>} />
          <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Protected roles={['superadmin']}><Settings /></Protected>} />
            <Route path="/approvals" element={<Protected roles={['superadmin', 'reseller']}><Approvals /></Protected>} /><Route path="/my-dlt" element={<MyDlt />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </ToastProvider>
  )
}
