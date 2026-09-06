import { PageHeader } from '../components/ui/PageHeader';
import { Icon } from '../components/ui/Icon';
import { useDemoStore } from '../mock-api/store';
import { useToast } from '../components/ui/Toast';
import { usePageEnter } from '../lib/usePageEnter';

const ROLE_NAME: Record<string, { name: string; role: string; org: string }> = {
  tn_govt: { name: 'A. Vasantha Devi', role: 'Deputy Director, Social Welfare Dept.', org: 'Government of Tamil Nadu' },
  titan_admin: { name: 'M. Bharath Kumar', role: 'Program Manager, CBG Finance', org: 'Titan Company Limited' },
};

export function SettingsPage() {
  const role = useDemoStore((s) => s.role);
  const reducedMotion = useDemoStore((s) => s.reducedMotion);
  const setReducedMotion = useDemoStore((s) => s.setReducedMotion);
  const { showToast } = useToast();
  const profile = ROLE_NAME[role];
  const ref = usePageEnter<HTMLDivElement>();

  return (
    <div ref={ref} className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Settings" subtitle="Profile, accessibility, and platform information." />

      <section className="rounded-card border border-border bg-surface p-6 shadow-soft">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink">Profile</h2>
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary-100 font-display text-lg font-bold text-secondary-700">
            {profile.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
          </span>
          <div>
            <p className="font-display text-base font-semibold text-ink">{profile.name}</p>
            <p className="text-sm text-ink-muted">{profile.role}</p>
            <p className="text-sm text-ink-muted">{profile.org}</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-ink-faint">
          Use the "Viewing as" switch in the top bar to preview the other role — this demo has no real authentication.
        </p>
      </section>

      <section className="rounded-card border border-border bg-surface p-6 shadow-soft">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink">Accessibility</h2>
        <label className="flex items-center justify-between gap-4">
          <span>
            <span className="block text-sm font-medium text-ink">Reduce motion</span>
            <span className="block text-xs text-ink-muted">Turns off count-up numbers and entrance animations across the platform.</span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={reducedMotion}
            onClick={() => {
              setReducedMotion(!reducedMotion);
              showToast(!reducedMotion ? 'Reduced motion enabled' : 'Reduced motion disabled', 'success');
            }}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${reducedMotion ? 'bg-primary-500' : 'bg-surface-subtle'}`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${reducedMotion ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </label>
      </section>

      <section className="rounded-card border border-border bg-surface p-6 shadow-soft">
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">About this platform</h2>
        <p className="text-sm leading-relaxed text-ink-muted">
          The Gold Coin Delivery Platform tracks the Tamil Nadu Government Gold Coin Scheme, coordinating delivery
          between Titan Company Limited (coin fulfilment), Sequel (last-mile logistics), and the TN Government (Social
          Welfare Department). This build is a front-end demo populated with realistic sample data — no live backend
          or API integration is connected yet.
        </p>
        <div className="mt-4 flex items-center gap-2 rounded-btn bg-primary-50 px-4 py-3 text-sm text-primary-800">
          <Icon name="info" size={16} />
          Version 1.0 · Demo build
        </div>
      </section>
    </div>
  );
}
