import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, type ColumnDef } from '../components/ui/DataTable';
import { StatusPill } from '../components/ui/StatusPill';
import { SlaCountdown } from '../components/ui/SlaCountdown';
import { FilterSelect } from '../components/ui/FilterChip';
import { useDemoStore } from '../mock-api/store';
import { ORDER_STATUS_META } from '../lib/status';
import { formatPhone } from '../lib/sla';
import { computeSlaState } from '../lib/sla';
import type { Order, OrderStatus, SlaState } from '../types';
import { usePageEnter } from '../lib/usePageEnter';

const STATUS_OPTIONS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'pickup_requested', label: ORDER_STATUS_META.pickup_requested.label },
  { value: 'pickup_accepted', label: ORDER_STATUS_META.pickup_accepted.label },
  { value: 'picked_up', label: ORDER_STATUS_META.picked_up.label },
  { value: 'reached_origin_hub', label: ORDER_STATUS_META.reached_origin_hub.label },
  { value: 'assistant_assigned', label: ORDER_STATUS_META.assistant_assigned.label },
  { value: 'out_for_delivery', label: ORDER_STATUS_META.out_for_delivery.label },
  { value: 'delivered', label: ORDER_STATUS_META.delivered.label },
  { value: 'pod_uploaded', label: ORDER_STATUS_META.pod_uploaded.label },
  { value: 'on_hold_verification_failed', label: ORDER_STATUS_META.on_hold_verification_failed.label },
  { value: 'on_hold_data_error', label: ORDER_STATUS_META.on_hold_data_error.label },
  { value: 'rescheduled', label: ORDER_STATUS_META.rescheduled.label },
  { value: 'cancelled', label: ORDER_STATUS_META.cancelled.label },
];

const SLA_OPTIONS: { value: SlaState | 'all'; label: string }[] = [
  { value: 'all', label: 'All SLA states' },
  { value: 'within_sla', label: 'Within SLA' },
  { value: 'at_risk', label: 'At risk' },
  { value: 'breached', label: 'Breached' },
];

export function BeneficiaryListPage() {
  const orders = useDemoStore((s) => s.orders);
  const batches = useDemoStore((s) => s.batches);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [slaFilter, setSlaFilter] = useState<SlaState | 'all'>('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const ref = usePageEnter<HTMLDivElement>();
  const initialQuery = searchParams.get('q') ?? '';

  const districts = useMemo(() => Array.from(new Set(orders.map((o) => o.address.district))).sort(), [orders]);

  const filtered = useMemo(
    () =>
      orders.filter((o) => {
        if (statusFilter !== 'all' && o.status !== statusFilter) return false;
        if (slaFilter !== 'all' && computeSlaState(o) !== slaFilter) return false;
        if (districtFilter !== 'all' && o.address.district !== districtFilter) return false;
        return true;
      }),
    [orders, statusFilter, slaFilter, districtFilter],
  );

  const columns: ColumnDef<Order>[] = [
    { key: 'receiverName', header: 'Beneficiary', sortValue: (o) => o.receiverName, render: (o) => (
      <div>
        <p className="font-semibold text-ink">{o.receiverName}</p>
        <p className="text-xs text-ink-faint">{o.id}</p>
      </div>
    ) },
    { key: 'primaryMobile', header: 'Mobile', render: (o) => formatPhone(o.primaryMobile) },
    { key: 'district', header: 'District', sortValue: (o) => o.address.district, render: (o) => o.address.district },
    { key: 'batchId', header: 'Batch', sortValue: (o) => o.batchId, render: (o) => <span className="text-ink-muted">{o.batchId}</span> },
    { key: 'status', header: 'Delivery status', sortValue: (o) => o.status, render: (o) => <StatusPill meta={ORDER_STATUS_META[o.status]} size="sm" /> },
    { key: 'sla', header: 'SLA', render: (o) => <SlaCountdown order={o} size="sm" /> },
    { key: 'grievance', header: 'Grievance', render: (o) => (o.grievance ? <span className="text-xs font-semibold text-secondary-700">{o.grievance.id}</span> : <span className="text-ink-faint">—</span>) },
  ];

  return (
    <div ref={ref}>
      <PageHeader
        title="Beneficiaries"
        subtitle={`${orders.length} beneficiaries across ${batches.length} batches, statewide.`}
      />
      <DataTable
        rows={filtered}
        columns={columns}
        rowKey={(o) => o.id}
        searchable
        searchPlaceholder="Search name, mobile, order ID, AWB…"
        searchFn={(o, q) => {
          const s = q.toLowerCase();
          return (
            o.receiverName.toLowerCase().includes(s) ||
            o.primaryMobile.includes(s) ||
            o.id.toLowerCase().includes(s) ||
            (o.awb ?? '').toLowerCase().includes(s) ||
            o.uniqueCode.toLowerCase().includes(s)
          );
        }}
        onRowClick={(o) => navigate(`/beneficiaries/${o.id}`)}
        defaultQuery={initialQuery}
        filters={
          <>
            <FilterSelect label="Status" value={statusFilter} onChange={(v) => setStatusFilter(v as OrderStatus | 'all')} options={STATUS_OPTIONS} />
            <FilterSelect label="SLA" value={slaFilter} onChange={(v) => setSlaFilter(v as SlaState | 'all')} options={SLA_OPTIONS} />
            <FilterSelect
              label="District"
              value={districtFilter}
              onChange={setDistrictFilter}
              options={[{ value: 'all', label: 'All districts' }, ...districts.map((d) => ({ value: d, label: d }))]}
            />
          </>
        }
        emptyState={{ icon: 'person_search', title: 'No beneficiaries match', description: 'Try clearing filters or search.' }}
      />
    </div>
  );
}
