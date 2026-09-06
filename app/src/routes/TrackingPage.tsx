import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, type ColumnDef } from '../components/ui/DataTable';
import { StatusPill } from '../components/ui/StatusPill';
import { SlaCountdown } from '../components/ui/SlaCountdown';
import { ProgressBar } from '../components/ui/ProgressRing';
import { FilterSelect } from '../components/ui/FilterChip';
import { useDemoStore } from '../mock-api/store';
import { ORDER_STATUS_META } from '../lib/status';
import { computeSlaState, daysRemaining } from '../lib/sla';
import type { Order } from '../types';
import { usePageEnter } from '../lib/usePageEnter';

export function TrackingPage() {
  const orders = useDemoStore((s) => s.orders);
  const navigate = useNavigate();
  const [districtFilter, setDistrictFilter] = useState('all');
  const ref = usePageEnter<HTMLDivElement>();

  const districts = useMemo(() => Array.from(new Set(orders.map((o) => o.address.district))).sort(), [orders]);

  const scoped = useMemo(
    () => (districtFilter === 'all' ? orders : orders.filter((o) => o.address.district === districtFilter)),
    [orders, districtFilter],
  );

  const priorityOrders = useMemo(
    () =>
      [...scoped]
        .filter((o) => computeSlaState(o) !== 'within_sla')
        .sort((a, b) => daysRemaining(a) - daysRemaining(b)),
    [scoped],
  );

  const byDistrict = useMemo(() => {
    return districts.map((d) => {
      const districtOrders = orders.filter((o) => o.address.district === d);
      const within = districtOrders.filter((o) => computeSlaState(o) === 'within_sla').length;
      const atRisk = districtOrders.filter((o) => computeSlaState(o) === 'at_risk').length;
      const breached = districtOrders.filter((o) => computeSlaState(o) === 'breached').length;
      return { district: d, total: districtOrders.length, within, atRisk, breached };
    });
  }, [orders, districts]);

  const columns: ColumnDef<Order>[] = [
    { key: 'receiverName', header: 'Beneficiary', sortValue: (o) => o.receiverName, render: (o) => (
      <div>
        <p className="font-semibold text-ink">{o.receiverName}</p>
        <p className="text-xs text-ink-faint">{o.id}</p>
      </div>
    ) },
    { key: 'district', header: 'District', sortValue: (o) => o.address.district, render: (o) => o.address.district },
    { key: 'status', header: 'Delivery status', render: (o) => <StatusPill meta={ORDER_STATUS_META[o.status]} size="sm" /> },
    { key: 'sla', header: 'SLA', sortValue: (o) => daysRemaining(o), render: (o) => <SlaCountdown order={o} size="sm" /> },
  ];

  return (
    <div ref={ref}>
      <PageHeader title="SLA tracking" subtitle="Statewide delivery-time compliance, district by district." />

      <div className="mb-6 rounded-card border border-border bg-surface p-6 shadow-soft">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink">SLA compliance by district</h2>
        <div className="space-y-4">
          {byDistrict.map((d) => (
            <div key={d.district}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-ink">{d.district}</span>
                <span className="text-ink-faint">{d.total} beneficiaries</span>
              </div>
              <ProgressBar
                height={10}
                segments={[
                  { value: d.within, color: 'var(--color-success)', label: `${d.within} within SLA` },
                  { value: d.atRisk, color: 'var(--color-warning)', label: `${d.atRisk} at risk` },
                  { value: d.breached, color: 'var(--color-danger)', label: `${d.breached} breached` },
                ]}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ink">Needs attention first</h2>
        <FilterSelect
          label="District"
          value={districtFilter}
          onChange={setDistrictFilter}
          options={[{ value: 'all', label: 'All districts' }, ...districts.map((d) => ({ value: d, label: d }))]}
        />
      </div>
      <DataTable
        rows={priorityOrders}
        columns={columns}
        rowKey={(o) => o.id}
        onRowClick={(o) => navigate(`/beneficiaries/${o.id}`)}
        searchable
        searchPlaceholder="Search beneficiary…"
        searchFn={(o, q) => o.receiverName.toLowerCase().includes(q.toLowerCase())}
        emptyState={{ icon: 'task_alt', title: 'Nothing at risk', description: 'Every beneficiary in scope is within their SLA window.' }}
      />
    </div>
  );
}
