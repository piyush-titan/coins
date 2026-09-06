import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/ui/Icon';
import { useDemoStore } from '../mock-api/store';
import type { Role } from '../types';
import { usePageEnter } from '../lib/usePageEnter';

const ROLE_CARDS: { role: Role; title: string; description: string; icon: string; bullets: string[] }[] = [
  {
    role: 'tn_govt',
    title: 'Continue as TN Government',
    description: 'Social Welfare Department reviewer — view and print access to delivery status, verification outcomes, and grievance cases.',
    icon: 'account_balance',
    bullets: ['Upload and confirm beneficiary batches', 'Track delivery & SLA status statewide', 'View grievance outcomes — no edit access'],
  },
  {
    role: 'titan_admin',
    title: 'Continue as Titan Admin',
    description: 'Titan CBG Finance / developer — full view access across every order, batch, reschedule, grievance, and proof-of-delivery document.',
    icon: 'corporate_fare',
    bullets: ['Full visibility into every batch & order', 'Reporting, reverse lookup & activity log', 'Confirm batches ready for order creation'],
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const setRole = useDemoStore((s) => s.setRole);
  const ref = usePageEnter<HTMLDivElement>();

  function chooseRole(role: Role) {
    setRole(role);
    navigate('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-primary-50 via-surface to-surface">
      <div ref={ref} className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 py-16">
        <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-700 shadow-lift">
          <Icon name="verified" size={34} className="text-white" />
        </span>
        <h1 className="text-center font-display text-3xl font-bold text-ink sm:text-4xl">Gold Coin Delivery Platform</h1>
        <p className="mt-3 max-w-xl text-center text-base text-ink-muted">
          Tamil Nadu Government Gold Coin Scheme — verified delivery and audit trail for Titan Company Limited and TN
          Government reviewers.
        </p>

        <div className="mt-12 grid w-full gap-6 sm:grid-cols-2">
          {ROLE_CARDS.map((card) => (
            <button
              key={card.role}
              type="button"
              onClick={() => chooseRole(card.role)}
              className="group flex flex-col items-start rounded-card border border-border bg-surface p-7 text-left shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-primary-300 hover:shadow-lift"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 transition-colors group-hover:bg-primary-100">
                <Icon name={card.icon} size={26} className="text-primary-600" />
              </span>
              <h2 className="mt-5 font-display text-xl font-bold text-ink">{card.title}</h2>
              <p className="mt-2 text-sm text-ink-muted">{card.description}</p>
              <ul className="mt-4 space-y-2">
                {card.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-ink">
                    <Icon name="check_circle" size={16} className="mt-0.5 shrink-0 text-primary-500" />
                    {b}
                  </li>
                ))}
              </ul>
              <span className="mt-6 inline-flex items-center gap-1.5 rounded-btn bg-gradient-to-b from-primary-500 to-primary-700 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-transform group-hover:-translate-y-0.5">
                Continue
                <Icon name="arrow_forward" size={18} />
              </span>
            </button>
          ))}
        </div>

        <p className="mt-10 max-w-lg text-center text-xs text-ink-faint">
          This is a demo build for internal review. The role switch above and the "Viewing as" control inside the app
          are demo conveniences only — not a real authentication system.
        </p>
      </div>
    </div>
  );
}
