import { NavLink } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { useDemoStore } from '../../mock-api/store';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  titanOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/batches', label: 'Batches', icon: 'folder_zip' },
  { to: '/beneficiaries', label: 'Beneficiaries', icon: 'groups' },
  { to: '/tracking', label: 'Tracking & SLA', icon: 'local_shipping' },
  { to: '/grievances', label: 'Grievances', icon: 'support_agent' },
  { to: '/reports', label: 'Reports', icon: 'summarize', titanOnly: true },
  { to: '/directory', label: 'Contact directory', icon: 'contact_phone' },
];

export function Sidebar({ mobileOpen, onCloseMobile }: { mobileOpen: boolean; onCloseMobile: () => void }) {
  const role = useDemoStore((s) => s.role);
  const items = NAV_ITEMS.filter((item) => !item.titanOnly || role === 'titan_admin');

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-secondary-900/40 lg:hidden" onClick={onCloseMobile} aria-hidden="true" />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 flex-col bg-secondary-900 text-secondary-50 transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-6 py-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500">
            <Icon name="verified" size={22} className="text-white" />
          </span>
          <div>
            <p className="font-display text-base font-bold leading-tight text-white">Gold Coin Platform</p>
            <p className="text-xs text-secondary-100">Gold Coin Delivery Scheme</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 pb-4">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex h-12 items-center gap-3 rounded-xl px-4 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-soft'
                    : 'text-secondary-100 hover:bg-secondary-700/60 hover:text-white'
                }`
              }
            >
              <Icon name={item.icon} size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-secondary-700 p-4">
          <NavLink
            to="/settings"
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex h-12 items-center gap-3 rounded-xl px-4 text-sm font-medium transition-colors ${
                isActive ? 'bg-secondary-700 text-white' : 'text-secondary-100 hover:bg-secondary-700/60 hover:text-white'
              }`
            }
          >
            <Icon name="settings" size={20} />
            Settings
          </NavLink>
        </div>
      </aside>
    </>
  );
}
