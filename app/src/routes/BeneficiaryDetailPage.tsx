import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusPill } from '../components/ui/StatusPill';
import { SlaCountdown } from '../components/ui/SlaCountdown';
import { Stepper, type StepperStep } from '../components/ui/Stepper';
import { Icon } from '../components/ui/Icon';
import { EmptyState } from '../components/ui/EmptyState';
import { useDemoStore } from '../mock-api/store';
import {
  ORDER_STATUS_META,
  GRIEVANCE_STATUS_META,
  VERIFICATION_STEP_LABEL,
  RESCHEDULE_REASON_LABEL,
} from '../lib/status';
import { formatDate, formatDateTime, formatPhone } from '../lib/sla';
import { ORDER_STATUS_SEQUENCE } from '../types';
import { usePageEnter } from '../lib/usePageEnter';

const PIPELINE_LABELS: Record<string, string> = {
  pickup_requested: 'Pickup requested',
  pickup_accepted: 'Pickup accepted',
  picked_up: 'Picked up',
  reached_origin_hub: 'Reached origin hub',
  assistant_assigned: 'Delivery assistant assigned',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  pod_uploaded: 'Proof of delivery uploaded',
};

export function BeneficiaryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const order = useDemoStore((s) => s.orders.find((o) => o.id === id));
  const navigate = useNavigate();
  const [printing, setPrinting] = useState(false);
  const ref = usePageEnter<HTMLDivElement>();

  const pipelineSteps: StepperStep[] = useMemo(() => {
    if (!order) return [];
    const isHold = order.status.startsWith('on_hold');
    const isTerminalOther = order.status === 'rescheduled' || order.status === 'cancelled';
    // For a status outside the main pipeline (on_hold/rescheduled/cancelled), the last
    // pipeline stage actually reached lives in statusHistory, not in order.status itself.
    const lastPipelineStatus = [...order.statusHistory].reverse().find((h) => ORDER_STATUS_SEQUENCE.includes(h.status))?.status;
    const currentIdx = isHold || isTerminalOther
      ? (lastPipelineStatus ? ORDER_STATUS_SEQUENCE.indexOf(lastPipelineStatus) : -1)
      : ORDER_STATUS_SEQUENCE.indexOf(order.status);

    return ORDER_STATUS_SEQUENCE.map((status, i) => {
      const historyEntry = order.statusHistory.find((h) => h.status === status);
      let stepStatus: StepperStep['status'] = 'upcoming';
      if (isTerminalOther) {
        stepStatus = historyEntry ? 'done' : 'skipped';
      } else if (isHold) {
        stepStatus = i <= currentIdx ? 'done' : i === currentIdx + 1 ? 'failed' : 'upcoming';
      } else {
        stepStatus = historyEntry ? 'done' : i === currentIdx ? 'current' : 'upcoming';
      }
      return { key: status, label: PIPELINE_LABELS[status], status: stepStatus, timestamp: historyEntry?.timestamp };
    });
  }, [order]);

  const verificationSteps: StepperStep[] = useMemo(() => {
    if (!order) return [];
    return order.verification.map((v) => ({
      key: v.step,
      label: VERIFICATION_STEP_LABEL[v.step],
      status: v.status === 'passed' ? 'done' : v.status === 'failed' ? 'failed' : 'upcoming',
      timestamp: v.timestamp,
      detail: v.failureReason,
    }));
  }, [order]);

  if (!order) {
    return (
      <EmptyState
        icon="person_off"
        title="Beneficiary not found"
        description="This order does not exist in the demo data."
        action={{ label: 'Back to beneficiaries', onClick: () => navigate('/beneficiaries') }}
      />
    );
  }

  return (
    <div ref={ref}>
      <PageHeader
        title={order.receiverName}
        subtitle={`${order.id} · Batch ${order.batchId}${order.awb ? ` · AWB ${order.awb}` : ''}`}
        actions={
          <>
            <StatusPill meta={ORDER_STATUS_META[order.status]} />
            <button
              type="button"
              onClick={() => {
                setPrinting(true);
                setTimeout(() => {
                  window.print();
                  setPrinting(false);
                }, 50);
              }}
              className="flex h-11 items-center gap-2 rounded-btn border border-border bg-surface px-4 text-sm font-semibold text-ink shadow-soft transition-colors hover:bg-surface-subtle print:hidden"
            >
              <Icon name="print" size={18} />
              {printing ? 'Preparing…' : 'Print delivery certificate'}
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-card border border-border bg-surface p-6 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">Delivery pipeline</h2>
              <SlaCountdown order={order} />
            </div>
            {order.status === 'rescheduled' ? (
              <div className="rounded-btn bg-warning-bg px-4 py-3 text-sm text-[#8A5A17]">
                <Icon name="event_repeat" size={16} className="mr-1.5 inline align-text-bottom" />
                Delivery rescheduled — see reschedule history below. The pipeline resumes once the new date arrives.
              </div>
            ) : order.status === 'cancelled' ? (
              <div className="rounded-btn bg-surface-muted px-4 py-3 text-sm text-ink-muted">
                <Icon name="block" size={16} className="mr-1.5 inline align-text-bottom" />
                This order was cancelled and will not proceed further.
              </div>
            ) : null}
            <div className="mt-4 overflow-x-auto pb-2">
              <div className="min-w-[720px]">
                <Stepper steps={pipelineSteps} orientation="horizontal" />
              </div>
            </div>
            {order.status.startsWith('on_hold') && (
              <div className="mt-4 rounded-btn bg-danger-bg px-4 py-3 text-sm text-[#A63F30]">
                <Icon name="error" size={16} className="mr-1.5 inline align-text-bottom" />
                {order.status === 'on_hold_verification_failed'
                  ? 'On hold — identity verification failed at handover. Awaiting resolution from Sequel field operations.'
                  : 'On hold — a data mismatch was found for this beneficiary. Awaiting correction and re-attempt.'}
              </div>
            )}
          </section>

          <section className="rounded-card border border-border bg-surface p-6 shadow-soft">
            <h2 className="mb-4 font-display text-lg font-semibold text-ink">Identity verification at handover</h2>
            <Stepper steps={verificationSteps} />
          </section>

          {order.reschedules.length > 0 && (
            <section className="rounded-card border border-border bg-surface p-6 shadow-soft">
              <h2 className="mb-4 font-display text-lg font-semibold text-ink">Reschedule history</h2>
              <ul className="space-y-3">
                {order.reschedules.map((r, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-btn bg-surface-muted p-4">
                    <Icon name="event_repeat" size={20} className="mt-0.5 text-warning" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-ink">
                        {formatDate(r.previousDate)} → {formatDate(r.newDate)}
                      </p>
                      <p className="mt-0.5 text-sm text-ink-muted">{RESCHEDULE_REASON_LABEL[r.reasonCode] ?? r.reasonCode}</p>
                      <p className="mt-1 text-xs text-ink-faint">
                        Triggered by {r.triggeredAt === 'availability_call' ? 'pre-delivery availability call' : 'failed delivery attempt'} · logged {formatDateTime(r.loggedAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(order.status === 'delivered' || order.status === 'pod_uploaded') && (
            <section className="rounded-card border border-border bg-surface p-6 shadow-soft">
              <h2 className="mb-4 font-display text-lg font-semibold text-ink">Proof of delivery</h2>
              {order.pod ? (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {[
                      { label: 'Beneficiary with coin', icon: 'photo_camera' },
                      { label: 'Signature', icon: 'draw' },
                      { label: 'ID proof (masked)', icon: 'badge' },
                    ].map((ph) => (
                      <div key={ph.label} className="flex aspect-square flex-col items-center justify-center gap-2 rounded-btn border border-dashed border-border bg-surface-muted text-center">
                        <Icon name={ph.icon} size={28} className="text-ink-faint" />
                        <span className="px-2 text-xs text-ink-faint">{ph.label}</span>
                      </div>
                    ))}
                  </div>
                  <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-ink-muted">Coin serial number</dt>
                      <dd className="font-mono font-semibold text-ink">{order.pod.coinSerialNumber}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-muted">Captured at</dt>
                      <dd className="text-ink">{formatDateTime(order.pod.capturedAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-muted">GPS coordinates</dt>
                      <dd className="font-mono text-ink">{order.pod.gpsLat?.toFixed(4)}, {order.pod.gpsLng?.toFixed(4)}</dd>
                    </div>
                  </dl>
                </>
              ) : (
                <p className="text-sm text-ink-muted">Delivered — proof of delivery not yet uploaded by the field assistant.</p>
              )}
            </section>
          )}

          <section className="rounded-card border border-border bg-surface p-6 shadow-soft">
            <h2 className="mb-4 font-display text-lg font-semibold text-ink">Grievance</h2>
            {order.grievance ? (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-display text-base font-semibold text-ink">{order.grievance.id}</span>
                  <StatusPill meta={GRIEVANCE_STATUS_META[order.grievance.status]} />
                </div>
                <p className="text-sm font-medium text-ink-muted">{order.grievance.category}</p>
                <p className="mt-1 text-sm text-ink">{order.grievance.description}</p>
                {order.grievance.resolutionOutcome && (
                  <div className="mt-3 rounded-btn bg-success-bg px-4 py-3 text-sm text-[#1F7A57]">
                    <span className="font-semibold">Resolution: </span>
                    {order.grievance.resolutionOutcome}
                  </div>
                )}
                {order.grievance.status !== 'resolved' && (
                  <div className="mt-3 rounded-btn bg-surface-muted px-4 py-3 text-sm text-ink-muted">
                    Resolution is pending. Grievance handling in this demo is view-only for both roles, matching the
                    current scope decision.
                  </div>
                )}
                <p className="mt-3 text-xs text-ink-faint">
                  Filed {formatDateTime(order.grievance.createdAt)} · Last updated {formatDateTime(order.grievance.updatedAt)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-ink-muted">No grievance has been filed for this beneficiary.</p>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-card border border-border bg-surface p-6 shadow-soft">
            <h2 className="mb-4 font-display text-lg font-semibold text-ink">Beneficiary details</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-ink-muted">Primary mobile</dt>
                <dd className="font-medium text-ink">{formatPhone(order.primaryMobile)}</dd>
              </div>
              {order.alternateMobile && (
                <div>
                  <dt className="text-ink-muted">Alternate mobile</dt>
                  <dd className="font-medium text-ink">{formatPhone(order.alternateMobile)}</dd>
                </div>
              )}
              <div>
                <dt className="text-ink-muted">Aadhaar (last 4)</dt>
                <dd className="font-mono font-medium text-ink">XXXX-XXXX-{order.aadhaarLast4}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Unique / voucher code</dt>
                <dd className="font-mono font-medium text-ink">{order.uniqueCode}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">SLA window</dt>
                <dd className="font-medium text-ink">{order.slaWindowDays} days from {formatDate(order.slaStartDate)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-card border border-border bg-surface p-6 shadow-soft">
            <h2 className="mb-4 font-display text-lg font-semibold text-ink">Delivery address</h2>
            <address className="text-sm not-italic leading-relaxed text-ink">
              {order.address.doorNo}{order.address.building ? `, ${order.address.building}` : ''}<br />
              {order.address.street}, {order.address.area}<br />
              {order.address.landmark && <>Near {order.address.landmark}<br /></>}
              {order.address.villageTaluk}, {order.address.cityTown}<br />
              {order.address.district} — {order.address.pincode}
            </address>
          </section>

          <section className="rounded-card border border-border bg-surface p-6 shadow-soft">
            <h2 className="mb-3 font-display text-lg font-semibold text-ink">Status history</h2>
            <ul className="space-y-2">
              {[...order.statusHistory].reverse().map((h, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-ink">
                    <Icon name={ORDER_STATUS_META[h.status].icon} size={14} className="text-primary-500" />
                    {ORDER_STATUS_META[h.status].label}
                  </span>
                  <span className="text-xs text-ink-faint">{formatDateTime(h.timestamp)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
