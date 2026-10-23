import { ArrowIcon } from './icons';

const RADIUS = 40;
const CIRC = 2 * Math.PI * RADIUS;
const SWEEP = CIRC * 0.75;

export default function Gauge({ label, value, min, max, display, caption, direction }) {
  const span = max - min || 1;
  const percent = Math.min(1, Math.max(0, (Number(value) - min) / span));
  const length = SWEEP * (Number.isFinite(percent) ? percent : 0);

  return (
    <div className="min-w-0 text-center">
      <div className="relative mx-auto h-[92px] w-[116px]">
        <svg viewBox="0 0 120 96" className="h-full w-full" aria-hidden="true">
          <circle
            cx="60"
            cy="64"
            r={RADIUS}
            fill="none"
            stroke="var(--line)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${SWEEP} ${CIRC}`}
            transform="rotate(135 60 64)"
          />
          <circle
            cx="60"
            cy="64"
            r={RADIUS}
            fill="none"
            stroke="var(--copper)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${length} ${CIRC}`}
            transform="rotate(135 60 64)"
            className="gauge-arc"
          />
        </svg>
        <div className="absolute inset-x-0 top-8 flex flex-col items-center">
          <span className="font-display text-[1.35rem] leading-none tabular-nums">{display}</span>
          {Number.isFinite(direction) ? (
            <span className="wind-arrow mt-1 text-copper" style={{ transform: `rotate(${direction}deg)` }}>
              <ArrowIcon />
            </span>
          ) : null}
        </div>
      </div>
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">{label}</p>
      {caption ? <p className="mt-0.5 truncate text-xs text-ink/80">{caption}</p> : null}
    </div>
  );
}
