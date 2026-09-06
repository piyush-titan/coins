import { Icon } from './Icon';
import { TONE_CLASSES, type PillTone, type StatusMeta } from '../../lib/status';

interface StatusPillProps {
  meta: StatusMeta;
  size?: 'sm' | 'md';
}

/** The single reusable status pill — always icon + label, never color alone. */
export function StatusPill({ meta, size = 'md' }: StatusPillProps) {
  const tone = TONE_CLASSES[meta.tone];
  const padding = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${padding} ${tone.bg} ${tone.text}`}
    >
      <Icon name={meta.icon} size={size === 'sm' ? 14 : 16} className={tone.icon} />
      {meta.label}
    </span>
  );
}

export function RawPill({ label, tone = 'neutral', icon }: { label: string; tone?: PillTone; icon?: string }) {
  const t = TONE_CLASSES[tone];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${t.bg} ${t.text}`}>
      {icon && <Icon name={icon} size={14} className={t.icon} />}
      {label}
    </span>
  );
}
