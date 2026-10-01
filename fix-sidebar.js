import fs from 'fs';
let code = fs.readFileSync('frontend/src/components/AppLayout.jsx', 'utf8');

// 1. Add missing states
code = code.replace(
  "const [adminOpen, setAdminOpen] = useState(() => ['/admin', '/traffic-routing', '/approvals'].includes(location.pathname))",
  `const [adminOpen, setAdminOpen] = useState(() => ['/admin', '/traffic-routing', '/approvals'].includes(location.pathname))
  const [reportsOpen, setReportsOpen] = useState(() => location.pathname === '/reports')
  const [generalOpen, setGeneralOpen] = useState(true)
  const [deliveryOpen, setDeliveryOpen] = useState(false)`
);

// 2. Add useSearchParams
code = code.replace(
  "const location = useLocation()",
  "const location = useLocation()\n  const [searchParams] = useSearchParams()"
);

if (!code.includes("useSearchParams")) {
  code = code.replace(
    "import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'",
    "import { Link, NavLink, useNavigate, useLocation, useSearchParams } from 'react-router-dom'"
  );
}

// 3. Replace navItems function
const oldNavItemsRegex = /const navItems = \(extra = ''\) =>[\s\S]*?\]\)/;

const newNavItems = `const navItems = (extra = '') =>
    nav.flatMap((n) => {
      if (n.to === '/reports') {
        return [
          <Fragment key={n.to}>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setReportsOpen((open) => !open)}
                className={\`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14px] font-semibold transition \${extra} \${
                  location.pathname === '/reports'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }\`}
              >
                <MiniIcon name="reports" className="h-[18px] w-[18px]" />
                <span className="flex-1 text-left">Reports</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={\`h-4 w-4 transition-transform \${reportsOpen ? 'rotate-180' : ''}\`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {reportsOpen && (
                <div className="ml-5 space-y-1 border-l border-gray-200 pl-3">
                  <button onClick={() => setGeneralOpen(!generalOpen)} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition">
                    <span>General Report</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={\`h-3.5 w-3.5 transition-transform \${generalOpen ? 'rotate-180' : ''}\`}><path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" /></svg>
                  </button>
                  {generalOpen && (
                    <div className="ml-4 space-y-1 border-l border-gray-100 pl-2">
                      <Link to="/reports?tab=Summary" className={\`block rounded-lg px-3 py-1.5 text-[12.5px] \${searchParams.get('tab') === 'Summary' || !searchParams.get('tab') ? 'text-brand-600 font-bold bg-brand-50' : 'text-gray-500 font-semibold hover:bg-gray-50 hover:text-gray-700'}\`}>Summary</Link>
                      <Link to="/reports?tab=Campaign Report" className={\`block rounded-lg px-3 py-1.5 text-[12.5px] \${searchParams.get('tab') === 'Campaign Report' ? 'text-brand-600 font-bold bg-brand-50' : 'text-gray-500 font-semibold hover:bg-gray-50 hover:text-gray-700'}\`}>Campaign Report</Link>
                      <button onClick={() => setDeliveryOpen(!deliveryOpen)} className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-[12.5px] font-semibold text-gray-500 hover:bg-gray-50">
                        <span>Delivery Report</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={\`h-3 w-3 transition-transform \${deliveryOpen ? 'rotate-180' : ''}\`}><path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" /></svg>
                      </button>
                      {deliveryOpen && (
                        <div className="ml-3 space-y-1 border-l border-gray-100 pl-2">
                          <Link to="/reports?tab=Delivery Report" className={\`block rounded-lg px-3 py-1.5 text-[12px] \${searchParams.get('tab') === 'Delivery Report' ? 'text-brand-600 font-bold bg-brand-50' : 'text-gray-400 font-semibold hover:bg-gray-50 hover:text-gray-600'}\`}>All Deliveries</Link>
                          <Link to="/reports?tab=Advanced Search" className={\`block rounded-lg px-3 py-1.5 text-[12px] \${searchParams.get('tab') === 'Advanced Search' ? 'text-brand-600 font-bold bg-brand-50' : 'text-gray-400 font-semibold hover:bg-gray-50 hover:text-gray-600'}\`}>Advanced Search</Link>
                        </div>
                      )}
                    </div>
                  )}
                  <Link to="/reports?tab=Route Reports" className={\`block rounded-lg px-3 py-2 text-[13px] font-semibold transition \${searchParams.get('tab') === 'Route Reports' ? 'text-brand-600 bg-brand-50' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}\`}>Route Report</Link>
                  <Link to="/reports?tab=Credit Report" className={\`block rounded-lg px-3 py-2 text-[13px] font-semibold transition \${searchParams.get('tab') === 'Credit Report' ? 'text-brand-600 bg-brand-50' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}\`}>Credit Report</Link>
                  <Link to="/reports?tab=X-Dropped" className={\`block rounded-lg px-3 py-2 text-[13px] font-semibold transition \${searchParams.get('tab') === 'X-Dropped' ? 'text-brand-600 bg-brand-50' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}\`}>X-Dropped</Link>
                  <Link to="/reports?tab=API Report" className={\`block rounded-lg px-3 py-2 text-[13px] font-semibold transition \${searchParams.get('tab') === 'API Report' ? 'text-brand-600 bg-brand-50' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}\`}>API Report</Link>
                  <Link to="/reports?tab=Tiny URL Report" className={\`block rounded-lg px-3 py-2 text-[13px] font-semibold transition \${searchParams.get('tab') === 'Tiny URL Report' ? 'text-brand-600 bg-brand-50' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}\`}>Smart SMS</Link>
                </div>
              )}
            </div>
          </Fragment>
        ]
      }

      return [
        <Fragment key={n.to}>
          <NavLink
            to={n.to}
            className={({ isActive }) =>
              \`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14px] font-semibold transition \${extra} \${
                isActive && n.to !== '/reports'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }\`
            }
          >
            <MiniIcon name={n.icon} className="h-[18px] w-[18px]" />
            {n.label}
          </NavLink>
          {n.to === '/dashboard' && user?.role === 'superadmin' && (
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setAdminOpen((open) => !open)}
                aria-expanded={adminOpen}
                className={\`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14px] font-semibold transition \${extra} \${
                  ['/admin', '/traffic-routing', '/approvals'].includes(location.pathname)
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }\`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                  <path d="M12 2l8 3.5v5.2c0 5-3.4 8.7-8 11.3-4.6-2.6-8-6.3-8-11.3V5.5L12 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.8 12l2.2 2.2 4.2-4.4" />
                </svg>
                <span className="flex-1 text-left">Admin</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={\`h-4 w-4 transition-transform \${adminOpen ? 'rotate-180' : ''}\`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {adminOpen && (
                <div className="ml-5 space-y-1 border-l border-gray-200 pl-3">
                  {[
                    ['/admin', 'Manage User'],
                    ['/traffic-routing', 'Traffic Routing'],
                    ['/approvals', 'Configuration'],
                  ].map(([to, label]) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) =>
                        \`block rounded-lg px-3 py-2 text-[13px] font-semibold transition \${
                          isActive ? 'bg-brand-50 text-brand-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                        }\`
                      }
                    >
                      {label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )}
        </Fragment>,
      ]
    })`;

if (oldNavItemsRegex.test(code)) {
  code = code.replace(oldNavItemsRegex, newNavItems);
  fs.writeFileSync('frontend/src/components/AppLayout.jsx', code);
  console.log("Success replacing AppLayout");
} else {
  console.log("Failed to replace AppLayout nav block");
}
