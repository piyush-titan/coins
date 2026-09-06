import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';
import type { PillTone } from '../../lib/status';

interface ToastItem {
  id: number;
  message: string;
  tone: PillTone;
}

interface ToastContextValue {
  showToast: (message: string, tone?: PillTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_ICON: Record<PillTone, string> = {
  primary: 'info',
  secondary: 'info',
  success: 'check_circle',
  warning: 'warning',
  danger: 'error',
  neutral: 'notifications',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback((message: string, tone: PillTone = 'success') => {
    const id = idRef.current++;
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed bottom-24 right-6 z-[100] flex flex-col gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-btn border border-border bg-surface px-4 py-3 text-sm font-medium text-ink shadow-lift animate-[toast-in_0.25s_ease-out]`}
            >
              <Icon
                name={TONE_ICON[t.tone]}
                size={18}
                className={
                  t.tone === 'success'
                    ? 'text-success'
                    : t.tone === 'danger'
                      ? 'text-danger'
                      : t.tone === 'warning'
                        ? 'text-warning'
                        : 'text-primary-500'
                }
              />
              {t.message}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
