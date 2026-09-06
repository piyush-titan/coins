import { useMemo, useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, type ColumnDef } from '../components/ui/DataTable';
import { Icon } from '../components/ui/Icon';
import { StatusPill } from '../components/ui/StatusPill';
import { useDemoStore } from '../mock-api/store';
import { ORDER_STATUS_META } from '../lib/status';
import { formatDateTime } from '../lib/sla';
import { useToast } from '../components/ui/Toast';
import type { ActivityLogEntry, Order } from '../types';
import { usePageEnter } from '../lib/usePageEnter';

function toCsv(rows: Record<string, string | number>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  return [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n');
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const EXPORT_PRESETS = [
  { key: 'all', label: 'All beneficiaries', icon: 'groups', filter: () => true },
  { key: 'delivered', label: 'Delivered this cycle', icon: 'check_circle', filter: (o: Order) => o.status === 'delivered' || o.status === 'pod_uploaded' },
  { key: 'on_hold', label: 'On hold (verification / data)', icon: 'error', filter: (o: Order) => o.status.startsWith('on_hold') },
  { key: 'rescheduled', label: 'Rescheduled', icon: 'event_repeat', filter: (o: Order) => o.status === 'rescheduled' },
  { key: 'grievance', label: 'With a grievance filed', icon: 'support_agent', filter: (o: Order) => Boolean(o.grievance) },
];

export function ReportsPage() {
  const orders = useDemoStore((s) => s.orders);
  const activityLog = useDemoStore((s) => s.activityLog);
  const logActivity = useDemoStore((s) => s.logActivity);
  const { showToast } = useToast();
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResult, setLookupResult] = useState<Order[] | null>(null);
  const ref = usePageEnter<HTMLDivElement>();

  function runExport(preset: (typeof EXPORT_PRESETS)[number]) {
    const scoped = orders.filter(preset.filter);
    const rows = scoped.map((o) => ({
      OrderID: o.id,
      Beneficiary: o.receiverName,
      Mobile: o.primaryMobile,
      District: o.address.district,
      Status: ORDER_STATUS_META[o.status].label,
      AWB: o.awb ?? '',
      SLAWindowDays: o.slaWindowDays,
    }));
    downloadCsv(`${preset.key}-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows));
    logActivity('Titan Admin', 'Exported', `${preset.label} (${scoped.length} records, CSV)`);
    showToast(`Exported ${scoped.length} records`, 'success');
  }

  function runLookup(e: React.FormEvent) {
    e.preventDefault();
    const q = lookupQuery.trim().toLowerCase();
    if (!q) {
      setLookupResult(null);
      return;
    }
    const matches = orders.filter(
      (o) => (o.awb ?? '').toLowerCase().includes(q) || o.uniqueCode.toLowerCase().includes(q) || o.pod?.coinSerialNumber?.toLowerCase().includes(q),
    );
    setLookupResult(matches);
    logActivity('Titan Admin', 'Reverse lookup', q);
  }

  const activityColumns: ColumnDef<ActivityLogEntry>[] = useMemo(
    () => [
      { key: 'timestamp', header: 'When', sortValue: (a) => a.timestamp, render: (a) => formatDateTime(a.timestamp) },
      { key: 'actor', header: 'Actor', render: (a) => a.actor },
      { key: 'action', header: 'Action', render: (a) => <span className="font-medium text-ink">{a.action}</span> },
      { key: 'target', header: 'Target', render: (a) => <span className="text-ink-muted">{a.target}</span> },
    ],
    [],
  );

  const lookupColumns: ColumnDef<Order>[] = [
    { key: 'id', header: 'Order', render: (o) => o.id },
    { key: 'receiverName', header: 'Beneficiary', render: (o) => o.receiverName },
    { key: 'awb', header: 'AWB', render: (o) => o.awb ?? '—' },
    { key: 'uniqueCode', header: 'Unique code', render: (o) => o.uniqueCode },
    { key: 'serial', header: 'Coin serial', render: (o) => o.pod?.coinSerialNumber ?? '—' },
    { key: 'status', header: 'Status', render: (o) => <StatusPill meta={ORDER_STATUS_META[o.status]} size="sm" /> },
  ];

  return (
    <div ref={ref}>
      <PageHeader title="Reports" subtitle="Titan Admin only — export presets, reverse lookup, and platform activity log." />

      <section className="mb-6 rounded-card border border-border bg-surface p-6 shadow-soft">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink">Export presets</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {EXPORT_PRESETS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => runExport(p)}
              className="flex items-center gap-3 rounded-btn border border-border p-4 text-left transition-colors hover:border-primary-300 hover:bg-primary-50/30"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50">
                <Icon name={p.icon} size={20} className="text-primary-600" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{p.label}</p>
                <p className="text-xs text-ink-muted">{orders.filter(p.filter).length} records · CSV</p>
              </div>
              <Icon name="download" size={18} className="ml-auto shrink-0 text-ink-faint" />
            </button>
          ))}
        </div>
      </section>

      <section className="mb-6 rounded-card border border-border bg-surface p-6 shadow-soft">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink">Reverse lookup</h2>
        <form onSubmit={runLookup} className="flex flex-wrap gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Icon name="search" size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              placeholder="AWB, unique/voucher code, or coin serial number…"
              className="h-11 w-full rounded-btn border border-border bg-surface-muted pl-10 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-primary-500 focus:bg-surface focus:outline-none"
            />
          </div>
          <button type="submit" className="flex h-11 items-center gap-2 rounded-btn bg-gradient-to-b from-primary-500 to-primary-700 px-5 text-sm font-semibold text-white shadow-soft">
            <Icon name="search" size={18} />
            Look up
          </button>
        </form>
        {lookupResult && (
          <div className="mt-4">
            {lookupResult.length === 0 ? (
              <p className="rounded-btn bg-surface-muted px-4 py-3 text-sm text-ink-muted">No matching order found for "{lookupQuery}".</p>
            ) : (
              <DataTable rows={lookupResult} columns={lookupColumns} rowKey={(o) => o.id} emptyState={{ icon: 'search_off', title: 'No results' }} />
            )}
          </div>
        )}
      </section>

      <section className="rounded-card border border-border bg-surface p-6 shadow-soft">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink">Activity log</h2>
        <DataTable
          rows={activityLog}
          columns={activityColumns}
          rowKey={(a) => a.id}
          searchable
          searchPlaceholder="Search activity…"
          searchFn={(a, q) => (a.actor + a.action + a.target).toLowerCase().includes(q.toLowerCase())}
          emptyState={{ icon: 'history', title: 'No activity yet' }}
        />
      </section>
    </div>
  );
}
