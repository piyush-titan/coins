import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Icon } from './Icon';
import { useDemoStore } from '../../mock-api/store';

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  delta?: { direction: 'up' | 'down'; label: string };
  icon?: string;
  variant?: 'default' | 'hero-primary' | 'hero-secondary';
  onClick?: () => void;
}

export function StatCard({ label, value, suffix = '', delta, icon, variant = 'default', onClick }: StatCardProps) {
  const numRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useDemoStore((s) => s.reducedMotion);

  useEffect(() => {
    const el = numRef.current;
    if (!el) return;
    if (reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = `${value}${suffix}`;
      return;
    }
    const counter = { val: 0 };
    const tween = gsap.to(counter, {
      val: value,
      duration: 1,
      ease: 'power2.out',
      onUpdate: () => {
        if (el) el.textContent = `${Math.round(counter.val)}${suffix}`;
      },
    });
    return () => {
      tween.kill();
    };
  }, [value, suffix, reducedMotion]);

  const isHero = variant !== 'default';
  const heroClasses =
    variant === 'hero-primary'
      ? 'bg-gradient-to-br from-primary-500 to-primary-700 text-white'
      : variant === 'hero-secondary'
        ? 'bg-gradient-to-br from-secondary-500 to-secondary-900 text-white'
        : '';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`group flex flex-col justify-between rounded-card border p-5 text-left shadow-soft transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lift' : 'cursor-default'
      } ${isHero ? `${heroClasses} border-transparent` : 'border-border bg-surface'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`text-sm font-medium ${isHero ? 'text-white/85' : 'text-ink-muted'}`}>{label}</span>
        {icon && (
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              isHero ? 'bg-white/15' : 'bg-primary-50'
            }`}
          >
            <Icon name={icon} size={18} className={isHero ? 'text-white' : 'text-primary-600'} />
          </span>
        )}
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <span
          ref={numRef}
          className="font-display text-[2rem] font-bold leading-none tracking-tight"
        >
          0{suffix}
        </span>
        {delta && (
          <span
            className={`mb-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
              isHero
                ? 'bg-white/15 text-white'
                : delta.direction === 'up'
                  ? 'bg-success-bg text-[#1F7A57]'
                  : 'bg-danger-bg text-[#A63F30]'
            }`}
          >
            <Icon name={delta.direction === 'up' ? 'trending_up' : 'trending_down'} size={13} />
            {delta.label}
          </span>
        )}
      </div>
    </button>
  );
}
