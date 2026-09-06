import { Icon } from './Icon';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void; icon?: string };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border bg-surface-muted px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
        <Icon name={icon} size={28} className="text-primary-500" />
      </span>
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      {description && <p className="max-w-md text-sm text-ink-muted">{description}</p>}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-2 inline-flex items-center gap-2 rounded-btn bg-gradient-to-b from-primary-500 to-primary-700 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5"
        >
          {action.icon && <Icon name={action.icon} size={18} />}
          {action.label}
        </button>
      )}
    </div>
  );
}
