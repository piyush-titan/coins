import { useState } from 'react';
import { useDemoStore } from '../../mock-api/store';
import { Icon } from './Icon';
import { useToast } from './Toast';
import { ORDER_STATUS_META } from '../../lib/status';
import { ORDER_STATUS_SEQUENCE } from '../../types';

/**
 * Demo-only control surface. Deliberately styled to look nothing like the
 * real product (dashed border, dark chip, monospace-flavoured labels) so no
 * presenter or reviewer mistakes it for a shipped feature.
 */
export function DevControlPanel() {
  const [open, setOpen] = useState(false);
  const orders = useDemoStore((s) => s.orders);
  const advanceOrderStatus = useDemoStore((s) => s.advanceOrderStatus);
  const resetDemoData = useDemoStore((s) => s.resetDemoData);
  const { showToast } = useToast();
  const [selectedOrderId, setSelectedOrderId] = useState('');

  const advanceable = orders.filter((o) => {
    const idx = ORDER_STATUS_SEQUENCE.indexOf(o.status);
    return idx >= 0 && idx < ORDER_STATUS_SEQUENCE.length - 1;
  });

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2">
      {open && (
        <div className="w-80 rounded-xl border-2 border-dashed border-secondary-300 bg-secondary-900 p-4 text-secondary-50 shadow-lift">
          <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary-100">
            <Icon name="terminal" size={16} />
            Dev / demo controls — not part of the product
          </p>

          <div className="mb-3">
            <label className="mb-1.5 block text-xs font-medium text-secondary-100">Simulate next tracking event</label>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="mb-2 w-full rounded-lg border border-secondary-300 bg-secondary-700 px-2 py-2 text-xs text-white focus:outline-none"
            >
              <option value="">Select an order…</option>
              {advanceable.slice(0, 40).map((o) => (
                <option key={o.id} value={o.id}>
                  {o.id} — {ORDER_STATUS_META[o.status].label}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!selectedOrderId}
              onClick={() => {
                advanceOrderStatus(selectedOrderId);
                showToast('Advanced order to its next tracking event.', 'success');
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 px-3 py-2 text-xs font-semibold text-secondary-900 transition-colors hover:bg-primary-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon name="skip_next" size={16} />
              Advance status
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              resetDemoData();
              showToast('Demo data reset to the seeded state.', 'warning');
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-secondary-300 px-3 py-2 text-xs font-semibold text-secondary-50 transition-colors hover:bg-secondary-700"
          >
            <Icon name="restart_alt" size={16} />
            Reset demo data
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle dev control panel"
        className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-secondary-300 bg-secondary-900 text-secondary-50 shadow-lift transition-transform hover:scale-105"
      >
        <Icon name={open ? 'close' : 'build'} size={22} />
      </button>
    </div>
  );
}
