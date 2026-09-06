import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, type ColumnDef } from '../components/ui/DataTable';
import { StatusPill } from '../components/ui/StatusPill';
import { useDemoStore } from '../mock-api/store';
import { GRIEVANCE_STATUS_META } from '../lib/status';
import { formatDateTime } from '../lib/sla';
import type { GrievanceCase, Order } from '../types';
import { usePageEnter } from '../lib/usePageEnter';

interface Row {
  grievance: GrievanceCase;
  order: Order;
}

export function GrievancesPage() {
  const orders = useDemoStore((s) => s.orders);
  const navigate = useNavigate();
  const ref = usePageEnter<HTMLDivElement>();

  const rows: Row[] = useMemo(
    () => orders.filter((o) => o.grievance).map((o) => ({ grievance: o.grievance!, order: o })),
    [orders],
  );

  const openCount = rows.filter((r) => r.grievance.status === 'open').length;
  const inProgressCount = rows.filter((r) => r.grievance.status === 'in_progress').length;
  const resolvedCount = rows.filter((r) => r.grievance.status === 'resolved').length;

  const columns: ColumnDef<Row>[] = [
    { key: 'id', header: 'Case', sortValue: (r) => r.grievance.id, render: (r) => <span className="font-semibold text-ink">{r.grievance.id}</span> },
    { key: 'beneficiary', header: 'Beneficiary', sortValue: (r) => r.order.receiverName, render: (r) => (
      <div>
        <p className="font-medium text-ink">{r.order.receiverName}</p>
        <p className="text-xs text-ink-faint">{r.order.id}</p>
      </div>
    ) },
    { key: 'category', header: 'Category', render: (r) => r.grievance.category },
    { key: 'createdAt', header: 'Filed', sortValue: (r) => r.grievance.createdAt, render: (r) => formatDateTime(r.grievance.createdAt) },
    { key: 'status', header: 'Status', sortValue: (r) => r.grievance.status, render: (r) => <StatusPill meta={GRIEVANCE_STATUS_META[r.grievance.status]} /> },
  ];

  return (
    <div ref={ref}>
      <PageHeader title="Grievances" subtitle="View-only case log — resolution happens outside this platform per current scope." />

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-card border border-border bg-surface p-4 text-center shadow-soft">
          <p className="font-display text-2xl font-bold text-danger">{openCount}</p>
          <p className="text-xs font-medium text-ink-muted">Open</p>
        </div>
        <div className="rounded-card border border-border bg-surface p-4 text-center shadow-soft">
          <p className="font-display text-2xl font-bold text-warning">{inProgressCount}</p>
          <p className="text-xs font-medium text-ink-muted">In progress</p>
        </div>
        <div className="rounded-card border border-border bg-surface p-4 text-center shadow-soft">
          <p className="font-display text-2xl font-bold text-success">{resolvedCount}</p>
          <p className="text-xs font-medium text-ink-muted">Resolved</p>
        </div>
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(r) => r.grievance.id}
        onRowClick={(r) => navigate(`/beneficiaries/${r.order.id}`)}
        searchable
        searchPlaceholder="Search case ID or beneficiary…"
        searchFn={(r, q) => {
          const s = q.toLowerCase();
          return r.grievance.id.toLowerCase().includes(s) || r.order.receiverName.toLowerCase().includes(s);
        }}
        emptyState={{ icon: 'support_agent', title: 'No grievances filed', description: 'Grievance cases will appear here once filed.' }}
      />
    </div>
  );
}
