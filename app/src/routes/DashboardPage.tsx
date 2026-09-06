import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { Icon } from '../components/ui/Icon';
import { StatusPill } from '../components/ui/StatusPill';
import { ProgressBar } from '../components/ui/ProgressRing';
import { useDemoStore } from '../mock-api/store';
import { computeSlaState } from '../lib/sla';
import { ORDER_STATUS_META, BATCH_STATUS_META } from '../lib/status';
import { ORDER_STATUS_SEQUENCE } from '../types';
import { relativeTime } from '../lib/sla';
import { usePageEnter } from '../lib/usePageEnter';

export function DashboardPage() {
  const role = useDemoStore((s) => s.role);
  const orders = useDemoStore((s) => s.orders);
  const batches = useDemoStore((s) => s.batches);
  const navigate = useNavigate();
  const ref = usePageEnter<HTMLDivElement>();

  const stats = useMemo(() => {
    const delivered = orders.filter((o) => o.status === 'delivered' || o.status === 'pod_uploaded').length;
    const onHold = orders.filter((o) => o.status.startsWith('on_hold')).length;
    const inProgress = orders.length - delivered - onHold - orders.filter((o) => o.status === 'cancelled' || o.status === 'rescheduled').length;
    const slaStates = orders.map((o) => computeSlaState(o));
    const atRiskOrBreached = slaStates.filter((s) => s !== 'within_sla').length;
    return { total: orders.length, delivered, inProgress, onHold, atRiskOrBreached };
  }, [orders]);

  const slaBreakdown = useMemo(() => {
    const within = orders.filter((o) => computeSlaState(o) === 'within_sla').length;
    const atRisk = orders.filter((o) => computeSlaState(o) === 'at_risk').length;
    const breached = orders.filter((o) => computeSlaState(o) === 'breached').length;
    return [
      { name: 'Within SLA', value: within, color: 'var(--color-success)' },
      { name: 'At risk', value: atRisk, color: 'var(--color-warning)' },
      { name: 'Breached', value: breached, color: 'var(--color-danger)' },
    ];
  }, [orders]);

  const funnelData = useMemo(
    () =>
      ORDER_STATUS_SEQUENCE.map((status) => ({
        status,
        label: ORDER_STATUS_META[status].label,
        count: orders.filter((o) => o.status === status).length,
      })),
    [orders],
  );

  const recentActivity = useMemo(() => {
    const events: { id: string; icon: string; text: string; timestamp: string; tone: string }[] = [];
    orders.forEach((o) => {
      const last = o.statusHistory[o.statusHistory.length - 1];
      if (last) {
        events.push({
          id: `${o.id}-status`,
          icon: ORDER_STATUS_META[o.status].icon,
          text: `${o.receiverName} (${o.id}) → ${ORDER_STATUS_META[o.status].label}`,
          timestamp: last.timestamp,
          tone: ORDER_STATUS_META[o.status].tone,
        });
      }
      if (o.reschedules.length > 0) {
        const r = o.reschedules[o.reschedules.length - 1];
        events.push({ id: `${o.id}-resched`, icon: 'event_repeat', text: `${o.receiverName} (${o.id}) rescheduled to ${new Date(r.newDate).toLocaleDateString('en-IN')}`, timestamp: r.loggedAt, tone: 'warning' });
      }
      if (o.grievance) {
        events.push({ id: `${o.id}-griev`, icon: 'support_agent', text: `Grievance ${o.grievance.id} for ${o.receiverName} — ${o.grievance.status.replace('_', ' ')}`, timestamp: o.grievance.updatedAt, tone: 'secondary' });
      }
    });
    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8);
  }, [orders]);

  const batchesAwaitingConfirmation = batches.filter((b) => b.status === 'validation_pending');

  return (
    <div ref={ref}>
      <PageHeader
        title={role === 'titan_admin' ? 'Titan Admin overview' : 'TN Government overview'}
        subtitle="A statewide snapshot of every gold coin delivery cycle currently in motion."
        actions={
          <button
            type="button"
            onClick={() => navigate('/batches/upload')}
            className="flex h-11 items-center gap-2 rounded-btn bg-gradient-to-b from-primary-500 to-primary-700 px-4 text-sm font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5"
          >
            <Icon name="upload_file" size={18} />
            Upload new batch
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total beneficiaries" value={stats.total} icon="groups" variant="hero-secondary" delta={{ direction: 'up', label: `${batches.filter(b=>b.status==='confirmed').length} active batches` }} />
        <StatCard label="Delivered" value={stats.delivered} icon="check_circle" delta={{ direction: 'up', label: `${stats.total ? Math.round((stats.delivered / stats.total) * 100) : 0}% of total` }} />
        <StatCard label="In progress" value={stats.inProgress} icon="local_shipping" />
        <StatCard label="At-risk / breached" value={stats.atRiskOrBreached} icon="warning" delta={{ direction: stats.atRiskOrBreached > 0 ? 'down' : 'up', label: stats.atRiskOrBreached > 0 ? 'needs attention' : 'all clear' }} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-card border border-border bg-surface p-6 shadow-soft lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">SLA breakdown</h2>
              <p className="text-sm text-ink-muted">Every beneficiary across every active batch, by SLA state.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/tracking')}
              className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
            >
              View full breakdown <Icon name="arrow_forward" size={16} />
            </button>
          </div>
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <div className="h-48 w-48 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={slaBreakdown} dataKey="value" nameKey="name" innerRadius={58} outerRadius={80} paddingAngle={3} strokeWidth={0}>
                    {slaBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid var(--color-border)', fontSize: 13, fontFamily: 'Inter' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full flex-1 space-y-3">
              {slaBreakdown.map((s) => (
                <div key={s.name} className="flex items-center justify-between rounded-btn bg-surface-muted px-4 py-3">
                  <span className="flex items-center gap-2 text-sm font-medium text-ink">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.name}
                  </span>
                  <span className="font-display text-lg font-bold text-ink">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {role === 'titan_admin' ? (
            <div className="rounded-card border border-transparent bg-gradient-to-br from-secondary-500 to-secondary-900 p-6 text-white shadow-lift">
              <h2 className="font-display text-lg font-semibold">Batches awaiting confirmation</h2>
              <p className="mt-1 text-sm text-secondary-100">Clean batches TN Govt has not yet confirmed — nothing downstream happens until they do.</p>
              <div className="mt-4 space-y-2">
                {batchesAwaitingConfirmation.length === 0 && (
                  <p className="rounded-btn bg-white/10 px-4 py-3 text-sm text-secondary-50">No batches are waiting — all clean batches have been confirmed.</p>
                )}
                {batchesAwaitingConfirmation.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => navigate(`/batches/${b.id}`)}
                    className="flex w-full items-center justify-between rounded-btn bg-white/10 px-4 py-3 text-left transition-colors hover:bg-white/20"
                  >
                    <span>
                      <span className="block text-sm font-semibold">{b.id}</span>
                      <span className="block text-xs text-secondary-100">{b.totalRecords} records</span>
                    </span>
                    <Icon name="chevron_right" size={20} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-card border border-transparent bg-gradient-to-br from-secondary-500 to-secondary-900 p-6 text-white shadow-lift">
              <h2 className="font-display text-lg font-semibold">Verification checklist</h2>
              <p className="mt-1 text-sm text-secondary-100">Live proportion of beneficiaries passing all 3 identity checks at handover.</p>
              <div className="mt-4">
                <ProgressBar
                  height={16}
                  segments={[
                    { value: orders.filter((o) => o.verification.every((v) => v.status === 'passed')).length, color: 'var(--color-primary-300)', label: 'Fully verified' },
                    { value: orders.filter((o) => o.verification.some((v) => v.status === 'failed')).length, color: '#F2A6A6', label: 'Verification failed' },
                    { value: orders.filter((o) => o.verification.every((v) => v.status === 'pending')).length, color: 'rgba(255,255,255,0.25)', label: 'Not yet attempted' },
                  ]}
                />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <p className="font-display text-xl font-bold">{orders.filter((o) => o.verification.every((v) => v.status === 'passed')).length}</p>
                  <p className="text-secondary-100">Verified</p>
                </div>
                <div>
                  <p className="font-display text-xl font-bold">{orders.filter((o) => o.verification.some((v) => v.status === 'failed')).length}</p>
                  <p className="text-secondary-100">Failed</p>
                </div>
                <div>
                  <p className="font-display text-xl font-bold">{orders.filter((o) => o.verification.every((v) => v.status === 'pending')).length}</p>
                  <p className="text-secondary-100">Pending</p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-card border border-border bg-surface p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold text-ink">Recent activity</h2>
            <ul className="mt-4 space-y-3">
              {recentActivity.map((e) => (
                <li key={e.id} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50">
                    <Icon name={e.icon} size={16} className="text-primary-600" />
                  </span>
                  <div>
                    <p className="text-sm text-ink">{e.text}</p>
                    <p className="text-xs text-ink-faint">{relativeTime(e.timestamp)}</p>
                  </div>
                </li>
              ))}
              {recentActivity.length === 0 && <p className="text-sm text-ink-muted">No activity yet.</p>}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-card border border-border bg-surface p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold text-ink">Delivery status funnel</h2>
        <p className="text-sm text-ink-muted">Beneficiaries currently at each stage of Sequel's delivery pipeline.</p>
        <div className="mt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData} margin={{ left: -20 }}>
              <CartesianGrid vertical={false} stroke="var(--color-border)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: 'var(--color-ink-muted)' }}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={70}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--color-ink-muted)' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--color-border)', fontSize: 13, fontFamily: 'Inter' }} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={48}>
                {funnelData.map((entry) => (
                  <Cell key={entry.status} fill={entry.status === 'delivered' || entry.status === 'pod_uploaded' ? 'var(--color-primary-500)' : 'var(--color-secondary-500)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 rounded-card border border-border bg-surface p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Batch status at a glance</h2>
          <button onClick={() => navigate('/batches')} className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700">
            View all batches <Icon name="arrow_forward" size={16} />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {batches.map((b) => (
            <button
              key={b.id}
              onClick={() => navigate(`/batches/${b.id}`)}
              className="flex flex-col items-start gap-2 rounded-btn border border-border p-4 text-left transition-colors hover:border-primary-300 hover:bg-primary-50/30"
            >
              <span className="font-display text-sm font-bold text-ink">{b.id}</span>
              <StatusPill meta={BATCH_STATUS_META[b.status]} size="sm" />
              <span className="text-xs text-ink-muted">{b.totalRecords} records · SLA {b.slaWindowDays === 'mixed' ? 'mixed' : `${b.slaWindowDays}-day`}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
