interface ProgressRingProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  color?: string;
  trackColor?: string;
}

export function ProgressRing({
  value,
  size = 120,
  strokeWidth = 12,
  label,
  sublabel,
  color = 'var(--color-primary-500)',
  trackColor = 'var(--color-surface-subtle)',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        {label && <span className="font-display text-xl font-bold text-ink">{label}</span>}
        {sublabel && <span className="text-xs font-medium text-ink-muted">{sublabel}</span>}
      </div>
    </div>
  );
}

interface ProgressBarProps {
  segments: { value: number; color: string; label?: string }[];
  height?: number;
}

/** Horizontal stacked bar — used for the SLA breakdown (within / at-risk / breached). */
export function ProgressBar({ segments, height = 14 }: ProgressBarProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  return (
    <div className="flex w-full overflow-hidden rounded-pill bg-surface-subtle" style={{ height }}>
      {segments.map((s, i) => (
        <div
          key={i}
          className="h-full transition-all duration-700 ease-out first:rounded-l-pill last:rounded-r-pill"
          style={{ width: `${(s.value / total) * 100}%`, backgroundColor: s.color }}
          title={s.label}
        />
      ))}
    </div>
  );
}
