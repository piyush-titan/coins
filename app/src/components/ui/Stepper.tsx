import { Icon } from './Icon';
import { formatDateTime } from '../../lib/sla';

interface StepperStep {
  key: string;
  label: string;
  status: 'done' | 'current' | 'upcoming' | 'failed' | 'skipped';
  timestamp?: string;
  detail?: string;
}

interface StepperProps {
  steps: StepperStep[];
  orientation?: 'vertical' | 'horizontal';
}

const STATUS_STYLE: Record<StepperStep['status'], { dot: string; icon: string; line: string; text: string }> = {
  done: { dot: 'bg-primary-500 text-white', icon: 'check', line: 'bg-primary-500', text: 'text-ink' },
  current: { dot: 'bg-secondary-500 text-white ring-4 ring-secondary-100', icon: 'radio_button_checked', line: 'bg-border', text: 'text-ink font-semibold' },
  upcoming: { dot: 'bg-surface-subtle text-ink-faint border border-border', icon: 'radio_button_unchecked', line: 'bg-border', text: 'text-ink-faint' },
  failed: { dot: 'bg-danger text-white', icon: 'close', line: 'bg-danger/40', text: 'text-danger' },
  skipped: { dot: 'bg-surface-subtle text-ink-faint border border-dashed border-border', icon: 'remove', line: 'bg-border', text: 'text-ink-faint' },
};

export function Stepper({ steps, orientation = 'vertical' }: StepperProps) {
  if (orientation === 'horizontal') {
    return (
      <div className="flex w-full items-start">
        {steps.map((step, i) => {
          const style = STATUS_STYLE[step.status];
          return (
            <div key={step.key} className="flex flex-1 flex-col items-center text-center">
              <div className="flex w-full items-center">
                <div className={`h-0.5 flex-1 ${i === 0 ? 'opacity-0' : STATUS_STYLE[steps[i - 1].status].line}`} />
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style.dot}`}>
                  <Icon name={style.icon} size={16} />
                </span>
                <div className={`h-0.5 flex-1 ${i === steps.length - 1 ? 'opacity-0' : style.line}`} />
              </div>
              <span className={`mt-2 max-w-[7rem] text-xs ${style.text}`}>{step.label}</span>
              {step.timestamp && <span className="mt-0.5 text-[11px] text-ink-faint">{formatDateTime(step.timestamp)}</span>}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <ol>
      {steps.map((step, i) => {
        const style = STATUS_STYLE[step.status];
        const isLast = i === steps.length - 1;
        return (
          <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast && <span className={`absolute left-[15px] top-8 h-full w-0.5 ${style.line}`} />}
            <span className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style.dot}`}>
              <Icon name={style.icon} size={16} />
            </span>
            <div className="flex-1 pt-0.5">
              <p className={`text-sm ${style.text}`}>{step.label}</p>
              {step.timestamp && <p className="mt-0.5 text-xs text-ink-faint">{formatDateTime(step.timestamp)}</p>}
              {step.detail && <p className="mt-1 text-xs text-ink-muted">{step.detail}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export type { StepperStep };
