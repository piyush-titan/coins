import { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Icon } from '../components/ui/Icon';
import { RawPill } from '../components/ui/StatusPill';
import { useDemoStore } from '../mock-api/store';
import { useToast } from '../components/ui/Toast';
import type { ContactDirectoryEntry } from '../types';
import { usePageEnter } from '../lib/usePageEnter';

const ORG_TONE: Record<ContactDirectoryEntry['organization'], 'primary' | 'secondary' | 'neutral'> = {
  Titan: 'primary',
  Sequel: 'secondary',
  'TN Govt': 'neutral',
};

export function DirectoryPage() {
  const contacts = useDemoStore((s) => s.contacts);
  const { showToast } = useToast();
  const [filter, setFilter] = useState<'all' | ContactDirectoryEntry['organization']>('all');
  const ref = usePageEnter<HTMLDivElement>();

  const filtered = filter === 'all' ? contacts : contacts.filter((c) => c.organization === filter);

  function copy(text: string, label: string) {
    navigator.clipboard?.writeText(text).then(
      () => showToast(`${label} copied to clipboard`, 'success'),
      () => showToast('Could not copy — copy it manually', 'danger'),
    );
  }

  return (
    <div ref={ref}>
      <PageHeader title="Contact directory" subtitle="Key contacts across TN Government, Titan, and Sequel logistics." />

      <div className="mb-5 flex flex-wrap gap-2">
        {(['all', 'TN Govt', 'Titan', 'Sequel'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`h-10 rounded-chip border px-4 text-sm font-medium transition-colors ${
              filter === f ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-border bg-surface text-ink-muted hover:border-primary-300'
            }`}
          >
            {f === 'all' ? 'All organizations' : f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c, i) => (
          <div key={i} className="rounded-card border border-border bg-surface p-5 shadow-soft">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <p className="font-display text-base font-semibold text-ink">{c.name}</p>
                <p className="text-sm text-ink-muted">{c.role}</p>
              </div>
              <RawPill label={c.organization} tone={ORG_TONE[c.organization]} />
            </div>
            <button
              type="button"
              onClick={() => copy(c.phone, 'Phone number')}
              className="flex w-full items-center gap-2 rounded-btn bg-surface-muted px-3 py-2.5 text-left text-sm text-ink transition-colors hover:bg-primary-50"
            >
              <Icon name="call" size={16} className="text-primary-500" />
              {c.phone}
              <Icon name="content_copy" size={14} className="ml-auto text-ink-faint" />
            </button>
            {c.email && (
              <button
                type="button"
                onClick={() => copy(c.email!, 'Email address')}
                className="mt-2 flex w-full items-center gap-2 rounded-btn bg-surface-muted px-3 py-2.5 text-left text-sm text-ink transition-colors hover:bg-primary-50"
              >
                <Icon name="mail" size={16} className="text-primary-500" />
                {c.email}
                <Icon name="content_copy" size={14} className="ml-auto text-ink-faint" />
              </button>
            )}
            <p className="mt-3 text-xs text-ink-faint">(placeholder contact — real directory pending confirmation)</p>
          </div>
        ))}
      </div>
    </div>
  );
}
