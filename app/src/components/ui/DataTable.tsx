import { useMemo, useState } from 'react';
import { Icon } from './Icon';
import { EmptyState } from './EmptyState';

export interface ColumnDef<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  align?: 'left' | 'right' | 'center';
  width?: string;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  pageSizeOptions?: number[];
  emptyState?: { icon: string; title: string; description?: string };
  searchable?: boolean;
  searchPlaceholder?: string;
  searchFn?: (row: T, query: string) => boolean;
  defaultQuery?: string;
  filters?: React.ReactNode;
  toolbarExtra?: React.ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  pageSizeOptions = [25, 50, 100],
  emptyState,
  searchable = false,
  searchPlaceholder = 'Search…',
  searchFn,
  defaultQuery = '',
  filters,
  toolbarExtra,
}: DataTableProps<T>) {
  const [query, setQuery] = useState(defaultQuery);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);

  const filteredRows = useMemo(() => {
    if (!query || !searchFn) return rows;
    return rows.filter((r) => searchFn(r, query));
  }, [rows, query, searchFn]);

  const sortedRows = useMemo(() => {
    if (!sortKey) return filteredRows;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return filteredRows;
    const copy = [...filteredRows];
    copy.sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filteredRows, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const pageRows = sortedRows.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  }

  return (
    <div className="rounded-card border border-border bg-surface shadow-soft">
      {(searchable || filters || toolbarExtra) && (
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          {searchable && (
            <div className="relative min-w-[220px] flex-1 sm:flex-none sm:w-72">
              <Icon name="search" size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder={searchPlaceholder}
                className="h-11 w-full rounded-btn border border-border bg-surface-muted pl-10 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-primary-500 focus:bg-surface focus:outline-none"
              />
            </div>
          )}
          {filters}
          <div className="ml-auto flex items-center gap-2">{toolbarExtra}</div>
        </div>
      )}

      {sortedRows.length === 0 ? (
        <div className="p-2">
          <EmptyState
            icon={emptyState?.icon ?? 'search_off'}
            title={emptyState?.title ?? 'No matching records'}
            description={emptyState?.description ?? 'Try adjusting your search or filters.'}
          />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="bg-secondary-500">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      style={{ width: col.width }}
                      className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white first:rounded-tl-card last:rounded-tr-card ${
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                      }`}
                    >
                      {col.sortValue ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(col.key)}
                          className="inline-flex items-center gap-1 hover:text-primary-100"
                        >
                          {col.header}
                          <Icon
                            name={sortKey === col.key ? (sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                            size={14}
                          />
                        </button>
                      ) : (
                        col.header
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => (
                  <tr
                    key={rowKey(row)}
                    onClick={() => onRowClick?.(row)}
                    className={`border-b border-border last:border-b-0 ${
                      onRowClick ? 'cursor-pointer transition-colors hover:bg-primary-50/40' : ''
                    }`}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3.5 align-middle text-ink ${
                          col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                        }`}
                      >
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4 text-sm text-ink-muted">
            <span>
              Showing {(clampedPage - 1) * pageSize + 1}–{Math.min(clampedPage * pageSize, sortedRows.length)} of{' '}
              {sortedRows.length}
            </span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2">
                Rows per page
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="h-9 rounded-chip border border-border bg-surface px-2 text-ink focus:border-primary-500 focus:outline-none"
                >
                  {pageSizeOptions.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={clampedPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-chip border border-border text-ink disabled:opacity-30"
                  aria-label="Previous page"
                >
                  <Icon name="chevron_left" size={18} />
                </button>
                <span className="px-2 text-ink">
                  {clampedPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={clampedPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-chip border border-border text-ink disabled:opacity-30"
                  aria-label="Next page"
                >
                  <Icon name="chevron_right" size={18} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
