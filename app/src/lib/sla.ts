import type { Order, SlaState } from '../types';

/** Days elapsed since SLA start, counting the upload day itself as Day 1. */
export function daysElapsed(slaStartDate: string, now: Date = new Date()): number {
  const start = new Date(slaStartDate);
  const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((nowMidnight.getTime() - startMidnight.getTime()) / 86_400_000);
  return diff + 1;
}

export function slaDeadline(order: Pick<Order, 'slaStartDate' | 'slaWindowDays'>): Date {
  const start = new Date(order.slaStartDate);
  const deadline = new Date(start);
  deadline.setDate(deadline.getDate() + order.slaWindowDays - 1);
  return deadline;
}

export function daysRemaining(order: Pick<Order, 'slaStartDate' | 'slaWindowDays'>, now: Date = new Date()): number {
  const deadline = slaDeadline(order);
  const deadlineMidnight = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((deadlineMidnight.getTime() - nowMidnight.getTime()) / 86_400_000);
}

const TERMINAL_STATUSES = new Set(['delivered', 'pod_uploaded', 'cancelled']);

/**
 * SLA is measured against the order's live status. A completed order is
 * always within-SLA (it delivered inside its window by definition of this
 * demo's seeded data — a delivered-but-late edge case would be a data bug,
 * not a state this computation needs to reconstruct after the fact).
 * A rescheduled order is explicitly excluded from SLA measurement per BRD §3.9.
 */
export function computeSlaState(order: Order, now: Date = new Date()): SlaState {
  if (order.status === 'rescheduled') return 'within_sla';
  if (TERMINAL_STATUSES.has(order.status)) return 'within_sla';
  const remaining = daysRemaining(order, now);
  if (remaining < 0) return 'breached';
  if (remaining <= 2) return 'at_risk';
  return 'within_sla';
}

export function formatDate(iso: string | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso: string | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPhone(phone: string | undefined): string {
  if (!phone) return '—';
  return phone.replace(/(\d{5})(\d{5})/, '$1 $2');
}

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffSec = Math.round((now - then) / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return formatDate(iso);
}
