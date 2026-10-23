import { clockFromIso, sunProgress } from '../utils/format';

function arcPoints(cx, cy, radius, amount) {
  const steps = Math.max(1, Math.round(42 * amount));
  const points = [];
  for (let index = 0; index <= steps; index += 1) {
    const progress = (index / steps) * amount;
    const angle = Math.PI * (1 - progress);
    points.push([cx + radius * Math.cos(angle), cy - radius * Math.sin(angle)]);
  }
  return points;
}

function toPolyline(points) {
  return points.map((point) => `${point[0].toFixed(1)},${point[1].toFixed(1)}`).join(' ');
}

export default function SunArc({ sunrise, sunset, utcOffset, now }) {
  const { amount, up } = sunProgress(now, sunrise, sunset, utcOffset);
  const cx = 160;
  const cy = 124;
  const radius = 98;
  const track = arcPoints(cx, cy, radius, 1);
  const traveled = arcPoints(cx, cy, radius, Math.min(1, Math.max(0, amount)));
  const sun = traveled[traveled.length - 1];

  return (
    <div className="mt-4">
      <svg viewBox="0 0 320 146" className="h-32 w-full sm:h-36" role="img" aria-label={`Sun is ${up ? 'above' : 'below'} the horizon. Sunrise ${clockFromIso(sunrise)}, sunset ${clockFromIso(sunset)}.`}>
        <polyline points={toPolyline(track)} fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <polyline points={toPolyline(traveled)} fill="none" stroke="var(--copper)" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
        <line x1={cx - radius} y1={cy} x2={cx + radius} y2={cy} stroke="currentColor" strokeOpacity="0.22" />
        <circle cx={sun[0]} cy={sun[1]} r="11" fill="var(--copper)" opacity={up ? 0.18 : 0.08} />
        <circle cx={sun[0]} cy={sun[1]} r="6.5" fill="var(--copper)" opacity={up ? 1 : 0.45} />
      </svg>
      <div className="mt-1 grid grid-cols-3 gap-2 text-[11px] uppercase tracking-[0.14em] text-muted">
        <span>Sunrise {clockFromIso(sunrise)}</span>
        <span className="text-center">{up ? 'Sun on the arc' : 'Below the horizon'}</span>
        <span className="text-right">Sunset {clockFromIso(sunset)}</span>
      </div>
    </div>
  );
}
