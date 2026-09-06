import type { Order } from '../../types';
import { computeSlaState, daysRemaining } from '../../lib/sla';
import { SLA_STATE_META } from '../../lib/status';
import { StatusPill } from './StatusPill';

interface SlaCountdownProps {
  order: Order;
  size?: 'sm' | 'md';
}

export function SlaCountdown({ order, size = 'md' }: SlaCountdownProps) {
  if (order.status === 'rescheduled') {
    return <StatusPill meta={{ label: 'Rescheduled — SLA paused', icon: 'event_repeat', tone: 'warning' }} size={size} />;
  }
  if (order.status === 'delivered' || order.status === 'pod_uploaded') {
    return <StatusPill meta={{ label: 'Delivered within window', icon: 'check_circle', tone: 'success' }} size={size} />;
  }
  if (order.status === 'cancelled') {
    return <StatusPill meta={{ label: 'Cancelled — SLA not applicable', icon: 'block', tone: 'neutral' }} size={size} />;
  }

  const state = computeSlaState(order);
  const remaining = daysRemaining(order);
  const meta = SLA_STATE_META[state];

  const label =
    state === 'breached'
      ? `Breached by ${Math.abs(remaining)} day${Math.abs(remaining) === 1 ? '' : 's'}`
      : state === 'at_risk'
        ? `${remaining} day${remaining === 1 ? '' : 's'} left — at risk`
        : `${remaining} day${remaining === 1 ? '' : 's'} left`;

  return <StatusPill meta={{ ...meta, label }} size={size} />;
}
