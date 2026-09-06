import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useDemoStore } from '../mock-api/store';

/**
 * Subtle GSAP entrance: direct children of the returned ref fade/slide in
 * with a slight stagger. Respects the in-app reduced-motion toggle and the
 * OS-level prefers-reduced-motion setting.
 */
export function usePageEnter<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const reducedMotion = useDemoStore((s) => s.reducedMotion);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const children = Array.from(el.children);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        children,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.06, clearProps: 'transform' },
      );
    }, el);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}
