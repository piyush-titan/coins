import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { RoleSwitcher } from '../ui/RoleSwitcher';
import { useDemoStore } from '../../mock-api/store';
import { relativeTime } from '../../lib/sla';

const ROLE_NAME: Record<string, string> = {
  tn_govt: 'A. Vasantha Devi',
  titan_admin: 'M. Bharath Kumar',
};

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const role = useDemoStore((s) => s.role);
  const notifications = useDemoStore((s) => s.notifications);
  const [notifOpen, setNotifOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  return (
    <header className="sticky top-0 z-20 flex h-18 items-center gap-3 border-b border-border bg-surface/90 px-4 py-3 backdrop-blur-sm sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-btn text-ink-muted hover:bg-surface-subtle lg:hidden"
        aria-label="Open navigation menu"
      >
        <Icon name="menu" size={22} />
      </button>

      <form
        className="relative hidden max-w-sm flex-1 sm:block"
        onSubmit={(e) => {
          e.preventDefault();
          if (search.trim()) navigate(`/beneficiaries?q=${encodeURIComponent(search.trim())}`);
        }}
      >
        <Icon name="search" size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="text"
          placeholder="Search beneficiary, mobile, AWB, code…"
          className="h-11 w-full rounded-pill border border-border bg-surface-muted pl-10 pr-4 text-sm text-ink placeholder:text-ink-faint focus:border-primary-500 focus:bg-surface focus:outline-none"
        />
      </form>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <RoleSwitcher />

        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((o) => !o)}
            className="relative flex h-11 w-11 items-center justify-center rounded-full text-ink-muted hover:bg-surface-subtle"
            aria-label="Notifications"
          >
            <Icon name="notifications" size={22} />
            {unreadCount > 0 && (
              <span className="absolute right-2 top-2 flex h-2.5 w-2.5 rounded-full bg-danger ring-2 ring-surface" />
            )}
          </button>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-btn border border-border bg-surface shadow-lift">
                <div className="border-b border-border px-4 py-3">
                  <p className="font-display text-sm font-semibold text-ink">Notifications</p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className={`border-b border-border px-4 py-3 last:border-b-0 ${!n.read ? 'bg-primary-50/40' : ''}`}>
                      <p className="text-sm font-medium text-ink">{n.title}</p>
                      <p className="mt-0.5 text-xs text-ink-muted">{n.body}</p>
                      <p className="mt-1 text-[11px] text-ink-faint">{relativeTime(n.timestamp)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="hidden items-center gap-2.5 border-l border-border pl-3 sm:flex">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-100 font-display text-sm font-bold text-secondary-700">
            {ROLE_NAME[role].split(' ').map((p) => p[0]).slice(0, 2).join('')}
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-ink">{ROLE_NAME[role]}</p>
            <p className="text-xs text-ink-muted">{role === 'titan_admin' ? 'Titan CBG Finance' : 'TN Govt, Social Welfare'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
