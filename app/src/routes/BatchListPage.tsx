import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, type ColumnDef } from '../components/ui/DataTable';
import { StatusPill } from '../components/ui/StatusPill';
import { Icon } from '../components/ui/Icon';
import { useDemoStore } from '../mock-api/store';
import { BATCH_STATUS_META } from '../lib/status';
import { formatDate } from '../lib/sla';
import type { Batch } from '../types';
import { usePageEnter } from '../lib/usePageEnter';

export function BatchListPage() {
  const batches = useDemoStore((s) => s.batches);
  const navigate = useNavigate();
  const ref = usePageEnter<HTMLDivElement>();

  const columns: ColumnDef<Batch>[] = [
    { key: 'id', header: 'Batch ID', sortValue: (b) => b.id, render: (b) => <span className="font-semibold text-ink">{b.id}</span> },
    { key: 'uploadedAt', header: 'Uploaded', sortValue: (b) => b.uploadedAt, render: (b) => formatDate(b.uploadedAt) },
    { key: 'uploadedFileName', header: 'File', render: (b) => <span className="text-ink-muted">{b.uploadedFileName}</span> },
    { key: 'totalRecords', header: 'Records', sortValue: (b) => b.totalRecords, render: (b) => b.totalRecords },
    { key: 'errorCount', header: 'Errors', sortValue: (b) => b.errorCount, render: (b) => (b.errorCount > 0 ? <span className="font-semibold text-danger">{b.errorCount}</span> : '—') },
    { key: 'slaWindowDays', header: 'SLA window', render: (b) => (b.slaWindowDays === 'mixed' ? 'Mixed' : `${b.slaWindowDays} days`) },
    { key: 'districtSpread', header: 'Districts', render: (b) => <span className="text-ink-muted">{b.districtSpread.join(', ')}</span> },
    { key: 'status', header: 'Status', sortValue: (b) => b.status, render: (b) => <StatusPill meta={BATCH_STATUS_META[b.status]} /> },
  ];

  return (
    <div ref={ref}>
      <PageHeader
        title="Beneficiary batches"
        subtitle="Every batch uploaded by TN Government, from initial validation through order creation."
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
      <DataTable
        rows={batches}
        columns={columns}
        rowKey={(b) => b.id}
        searchable
        searchPlaceholder="Search batch ID or file name…"
        searchFn={(b, q) => b.id.toLowerCase().includes(q.toLowerCase()) || b.uploadedFileName.toLowerCase().includes(q.toLowerCase())}
        onRowClick={(b) => navigate(`/batches/${b.id}`)}
        emptyState={{ icon: 'folder_open', title: 'No batches yet', description: 'Upload a beneficiary list to get started.' }}
      />
    </div>
  );
}
