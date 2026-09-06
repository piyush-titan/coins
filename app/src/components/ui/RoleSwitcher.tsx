import { useState } from 'react';
import { useDemoStore } from '../../mock-api/store';
import { Icon } from './Icon';
import type { Role } from '../../types';

const ROLE_LABEL: Record<Role, string> = {
  tn_govt: 'TN Government',
  titan_admin: 'Titan Admin',
};

/** Demo convenience: swaps the active role instantly, no reload, no real auth. */
export function RoleSwitcher() {
  const role = useDemoStore((s) => s.role);
  const setRole = useDemoStore((s) => s.setRole);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 items-center gap-2 rounded-pill border border-secondary-100 bg-secondary-50 pl-3 pr-2.5 text-sm font-semibold text-secondary-700 transition-colors hover:bg-secondary-100"
      >
        <Icon name="switch_account" size={18} />
        <span className="hidden sm:inline">Viewing as:</span>
        {ROLE_LABEL[role]}
        <Icon name={open ? 'expand_less' : 'expand_more'} size={18} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-btn border border-border bg-surface shadow-lift">
            {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setRole(r);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-4 py-3 text-left text-sm transition-colors hover:bg-surface-muted ${
                  role === r ? 'font-semibold text-primary-700' : 'text-ink'
                }`}
              >
                <Icon name={role === r ? 'radio_button_checked' : 'radio_button_unchecked'} size={18} className={role === r ? 'text-primary-500' : 'text-ink-faint'} />
                Continue as {ROLE_LABEL[r]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
