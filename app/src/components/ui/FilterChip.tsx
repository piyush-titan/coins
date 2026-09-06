import { Icon } from './Icon';

interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: string;
}

export function FilterChip({ label, active, onClick, icon }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-11 items-center gap-1.5 whitespace-nowrap rounded-chip border px-3.5 text-sm font-medium transition-colors ${
        active
          ? 'border-primary-500 bg-primary-50 text-primary-700'
          : 'border-border bg-surface text-ink-muted hover:border-primary-300'
      }`}
    >
      {icon && <Icon name={icon} size={16} />}
      {label}
    </button>
  );
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex h-11 items-center gap-2 rounded-chip border border-border bg-surface px-3 text-sm text-ink-muted">
      <span className="hidden sm:inline">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-ink focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
