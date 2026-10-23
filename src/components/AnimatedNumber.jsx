import { useEffect, useRef, useState } from 'react';

function pretty(value) {
  const rounded = Math.round(value);
  if (!Number.isFinite(rounded)) return '—';
  const sign = rounded < 0 ? '−' : '';
  return `${sign}${Math.abs(rounded)}`;
}

export default function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(value);
  const valueRef = useRef(value);

  useEffect(() => {
    const end = Number.isFinite(value) ? value : null;
    const start = valueRef.current;
    const unchanged = (start == null && end == null) || (start != null && end != null && Math.abs(end - start) < 0.05);
    if (unchanged) {
      valueRef.current = end;
      return undefined;
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (end == null || start == null || reduced) {
      const frame = requestAnimationFrame(() => {
        valueRef.current = end;
        setDisplay(end);
      });
      return () => cancelAnimationFrame(frame);
    }

    const started = performance.now();
    let frame = 0;
    const step = (now) => {
      const progress = Math.min(1, (now - started) / 680);
      const eased = 1 - (1 - progress) ** 3;
      const next = start + (end - start) * eased;
      valueRef.current = next;
      setDisplay(next);
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  if (display == null || Number.isNaN(display)) return '—';
  return pretty(display);
}
