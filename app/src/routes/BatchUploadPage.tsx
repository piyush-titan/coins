import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { FileDropzone } from '../components/ui/FileDropzone';
import { Icon } from '../components/ui/Icon';
import { useDemoStore } from '../mock-api/store';
import { useToast } from '../components/ui/Toast';
import { usePageEnter } from '../lib/usePageEnter';

type Stage = 'idle' | 'processing' | 'done';

export function BatchUploadPage() {
  const [stage, setStage] = useState<Stage>('idle');
  const [fileName, setFileName] = useState('');
  const simulateUpload = useDemoStore((s) => s.simulateUpload);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const ref = usePageEnter<HTMLDivElement>();

  function handleFile(file: File) {
    setFileName(file.name);
    setStage('processing');
    // Outcome is deterministic-but-varied for the demo: files whose name contains
    // "error" (or every 3rd upload) simulate a batch with validation errors.
    const willError = /error/i.test(file.name) || Math.random() < 0.4;
    setTimeout(() => {
      const batch = simulateUpload(file.name, willError ? 'errors' : 'clean');
      setStage('done');
      showToast(willError ? `${batch.id} uploaded — validation errors found` : `${batch.id} uploaded and validating`, willError ? 'warning' : 'success');
      setTimeout(() => navigate(`/batches/${batch.id}`), 900);
    }, 1600);
  }

  return (
    <div ref={ref} className="mx-auto max-w-2xl">
      <PageHeader title="Upload beneficiary batch" subtitle="Upload the TN Government beneficiary list to begin validation." />

      <div className="rounded-card border border-border bg-surface p-6 shadow-soft">
        {stage === 'idle' && (
          <>
            <FileDropzone onFile={handleFile} />
            <div className="mt-6 rounded-btn bg-surface-muted p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Icon name="info" size={16} className="text-primary-500" />
                Required columns
              </p>
              <ul className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 text-sm text-ink-muted sm:grid-cols-2">
                <li>Receiver Name</li>
                <li>Primary Mobile Number</li>
                <li>Aadhaar (last 4 digits)</li>
                <li>Unique/Voucher Code</li>
                <li>Full Address (with pincode)</li>
                <li>District / Taluk / Village</li>
              </ul>
              <p className="mt-3 text-xs text-ink-faint">
                This demo does not read the actual file contents — any .xlsx, .xls, or .csv file will simulate a
                realistic validation outcome.
              </p>
            </div>
          </>
        )}

        {stage === 'processing' && (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <span className="h-14 w-14 animate-spin rounded-full border-4 border-primary-100 border-t-primary-500" />
            <div>
              <p className="font-display text-lg font-semibold text-ink">Validating {fileName}…</p>
              <p className="mt-1 text-sm text-ink-muted">Checking mandatory fields, formats, and duplicate codes.</p>
            </div>
          </div>
        )}

        {stage === 'done' && (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
              <Icon name="task_alt" size={30} className="text-primary-500" />
            </span>
            <div>
              <p className="font-display text-lg font-semibold text-ink">Upload complete</p>
              <p className="mt-1 text-sm text-ink-muted">Redirecting to the batch detail page…</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
