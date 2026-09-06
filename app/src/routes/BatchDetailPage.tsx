import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusPill } from '../components/ui/StatusPill';
import { DataTable, type ColumnDef } from '../components/ui/DataTable';
import { EmptyState } from '../components/ui/EmptyState';
import { Icon } from '../components/ui/Icon';
import { useDemoStore } from '../mock-api/store';
import { BATCH_STATUS_META, ORDER_STATUS_META } from '../lib/status';
import { formatDateTime } from '../lib/sla';
import { useToast } from '../components/ui/Toast';
import type { Order, ValidationError } from '../types';
import { usePageEnter } from '../lib/usePageEnter';

export function BatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const batch = useDemoStore((s) => s.batches.find((b) => b.id === id));
  const allOrders = useDemoStore((s) => s.orders);
  const allValidationErrors = useDemoStore((s) => s.validationErrors);
  const orders = useMemo(() => allOrders.filter((o) => o.batchId === id), [allOrders, id]);
  const validationErrors = useMemo(() => allValidationErrors.filter((e) => e.batchId === id), [allValidationErrors, id]);
  const confirmBatch = useDemoStore((s) => s.confirmBatch);
  const role = useDemoStore((s) => s.role);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const ref = usePageEnter<HTMLDivElement>();

  const errorColumns: ColumnDef<ValidationError>[] = useMemo(
    () => [
      { key: 'rowNumber', header: 'Row', sortValue: (e) => e.rowNumber, render: (e) => <span className="font-semibold text-ink">#{e.rowNumber}</span> },
      { key: 'receiverName', header: 'Beneficiary', render: (e) => e.receiverName ?? '—' },
      { key: 'field', header: 'Field', render: (e) => e.field },
      { key: 'message', header: 'Issue', render: (e) => <span className="text-danger">{e.message}</span> },
    ],
    [],
  );

  const orderColumns: ColumnDef<Order>[] = useMemo(
    () => [
      { key: 'receiverName', header: 'Beneficiary', sortValue: (o) => o.receiverName, render: (o) => (
        <div>
          <p className="font-semibold text-ink">{o.receiverName}</p>
          <p className="text-xs text-ink-faint">{o.id}</p>
        </div>
      ) },
      { key: 'district', header: 'District', sortValue: (o) => o.address.district, render: (o) => o.address.district },
      { key: 'status', header: 'Delivery status', sortValue: (o) => o.status, render: (o) => <StatusPill meta={ORDER_STATUS_META[o.status]} size="sm" /> },
    ],
    [],
  );

  if (!batch) {
    return (
      <EmptyState icon="search_off" title="Batch not found" description="This batch does not exist in the demo data." action={{ label: 'Back to batches', onClick: () => navigate('/batches') }} />
    );
  }

  function handleConfirm() {
    if (!batch) return;
    confirmBatch(batch.id);
    showToast(`${batch.id} confirmed — ${batch.totalRecords} orders created`, 'success');
  }

  return (
    <div ref={ref}>
      <PageHeader
        title={batch.id}
        subtitle={`Uploaded ${formatDateTime(batch.uploadedAt)} · ${batch.uploadedFileName}`}
        actions={<StatusPill meta={BATCH_STATUS_META[batch.status]} />}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-card border border-border bg-surface p-4 shadow-soft">
          <p className="text-xs font-medium text-ink-muted">Total records</p>
          <p className="mt-1 font-display text-2xl font-bold text-ink">{batch.totalRecords}</p>
        </div>
        <div className="rounded-card border border-border bg-surface p-4 shadow-soft">
          <p className="text-xs font-medium text-ink-muted">Validation errors</p>
          <p className={`mt-1 font-display text-2xl font-bold ${batch.errorCount > 0 ? 'text-danger' : 'text-ink'}`}>{batch.errorCount}</p>
        </div>
        <div className="rounded-card border border-border bg-surface p-4 shadow-soft">
          <p className="text-xs font-medium text-ink-muted">SLA window</p>
          <p className="mt-1 font-display text-2xl font-bold text-ink">{batch.slaWindowDays === 'mixed' ? 'Mixed' : `${batch.slaWindowDays}d`}</p>
        </div>
        <div className="rounded-card border border-border bg-surface p-4 shadow-soft">
          <p className="text-xs font-medium text-ink-muted">Districts</p>
          <p className="mt-1 text-sm font-semibold text-ink">{batch.districtSpread.join(', ')}</p>
        </div>
      </div>

      {batch.status === 'has_errors' && (
        <div className="mb-6 rounded-card border border-danger/30 bg-danger-bg p-5">
          <p className="flex items-center gap-2 font-display text-base font-semibold text-[#A63F30]">
            <Icon name="error" size={20} />
            This batch cannot be confirmed until every error is corrected
          </p>
          <p className="mt-1 text-sm text-[#A63F30]/90">
            Correct the source file and re-upload — this demo does not support inline row editing, matching the real
            platform's re-upload-only correction flow.
          </p>
          <div className="mt-4 overflow-hidden rounded-btn border border-danger/20 bg-surface">
            <DataTable
              rows={validationErrors}
              columns={errorColumns}
              rowKey={(e) => `${e.batchId}-${e.rowNumber}-${e.field}`}
              emptyState={{ icon: 'check_circle', title: 'No errors' }}
            />
          </div>
          <button
            type="button"
            onClick={() => navigate('/batches/upload')}
            className="mt-4 flex h-11 items-center gap-2 rounded-btn bg-gradient-to-b from-primary-500 to-primary-700 px-4 text-sm font-semibold text-white shadow-soft"
          >
            <Icon name="upload_file" size={18} />
            Re-upload corrected file
          </button>
        </div>
      )}

      {batch.status === 'validation_pending' && (
        <div className="mb-6 rounded-card border border-primary-200 bg-primary-50 p-5">
          <p className="flex items-center gap-2 font-display text-base font-semibold text-primary-800">
            <Icon name="fact_check" size={20} />
            All records passed validation — ready for confirmation
          </p>
          <p className="mt-1 text-sm text-primary-700">
            Confirming this batch creates {batch.totalRecords} pickup orders with Sequel and starts each beneficiary's
            SLA clock.
          </p>
          {role === 'titan_admin' ? (
            <button
              type="button"
              onClick={handleConfirm}
              className="mt-4 flex h-11 items-center gap-2 rounded-btn bg-gradient-to-b from-primary-500 to-primary-700 px-5 text-sm font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5"
            >
              <Icon name="check_circle" size={18} />
              Confirm batch &amp; create orders
            </button>
          ) : (
            <p className="mt-4 flex items-center gap-2 rounded-btn bg-white/60 px-4 py-3 text-sm text-primary-800">
              <Icon name="visibility" size={16} />
              Waiting on Titan Admin to confirm this batch. TN Government has view-only access at this stage.
            </p>
          )}
        </div>
      )}

      {batch.status === 'confirmed' && (
        <div className="mb-6 rounded-btn border border-success-bg bg-success-bg px-4 py-3 text-sm font-medium text-[#1F7A57]">
          <Icon name="check_circle" size={16} className="mr-1.5 inline align-text-bottom" />
          Confirmed {formatDateTime(batch.confirmedAt)} — {orders.length} orders active.
        </div>
      )}

      <h2 className="mb-3 font-display text-lg font-semibold text-ink">Beneficiaries in this batch</h2>
      <DataTable
        rows={orders}
        columns={orderColumns}
        rowKey={(o) => o.id}
        onRowClick={(o) => navigate(`/beneficiaries/${o.id}`)}
        searchable
        searchPlaceholder="Search beneficiary…"
        searchFn={(o, q) => o.receiverName.toLowerCase().includes(q.toLowerCase())}
        emptyState={{ icon: 'group_off', title: 'No orders yet', description: 'Orders appear once this batch is confirmed.' }}
      />
    </div>
  );
}
