export const NAV_BY_ROLE = {
  superadmin: [
    { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/reports', icon: 'reports', label: 'Reports' },
    { to: '/smpp', icon: 'smpp', label: 'SMPP Center' },
    { to: '/gateway', icon: 'gateway', label: 'Gateway Center' },
    { to: '/integrations', icon: 'integrations', label: 'Integrations' },
    { to: '/settings', icon: 'settings', label: 'Settings' },
  ],
  reseller: [
    { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/send', icon: 'reports', label: 'Send SMS' },
    { to: '/reports', icon: 'reports', label: 'Reports' },
    { to: '/my-dlt', icon: 'smpp', label: 'DLT Management' },
    { to: '/integrations', icon: 'integrations', label: 'Integrations' },
    { to: '/smpp', icon: 'smpp', label: 'SMPP Center' },
  ],
  user: [
    { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/send', icon: 'reports', label: 'Send SMS' },
    { to: '/reports', icon: 'reports', label: 'Reports' },
    { to: '/my-dlt', icon: 'smpp', label: 'DLT Management' },
    { to: '/integrations', icon: 'integrations', label: 'Integrations' },
  ],
}
