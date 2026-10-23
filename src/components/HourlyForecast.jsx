import { useEffect, useId, useRef, useState } from 'react';
import { clockFromIso, convertTemp, unitSymbol } from '../utils/format';
import { describeWeather } from '../utils/weather';
import SectionHeading from './SectionHeading';
import WeatherIcon from './WeatherIcon';

function smoothPath(points) {
  if (points.length < 2) return '';
  let path = `M ${points[0][0]} ${points[0][1]}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[index === 0 ? index : index - 1];
    const current = points[index];
    const next = points[index + 1];
    const after = points[index + 2] || next;
    const c1x = current[0] + (next[0] - previous[0]) / 6;
    const c1y = current[1] + (next[1] - previous[1]) / 6;
    const c2x = next[0] - (after[0] - current[0]) / 6;
    const c2y = next[1] - (after[1] - current[1]) / 6;
    path += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${next[0]} ${next[1]}`;
  }
  return path;
}

export default function HourlyForecast({ hours, unit, timezone }) {
  const frameRef = useRef(null);
  const [width, setWidth] = useState(640);
  const [active, setActive] = useState(0);
  const gradientId = useId().replace(/:/g, '');
  const height = 132;

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return undefined;
    const measure = () => setWidth(Math.max(node.clientWidth, 280));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (!hours?.length) {
    return (
      <section className="glass rounded-[2rem] p-5 sm:p-6">
        <SectionHeading index="01 — Hours" title="The coming day" />
        <p className="text-sm text-muted">Hourly readings are unavailable for this place.</p>
      </section>
    );
  }

  const temps = hours.map((hour) => convertTemp(hour.temperature, unit) ?? 0);
  const min = Math.min(...temps) - 1;
  const max = Math.max(...temps) + 1;
  const span = max - min || 1;
  const points = temps.map((temp, index) => {
    const x = hours.length === 1 ? width / 2 : (index / (hours.length - 1)) * (width - 16) + 8;
    const y = 18 + (1 - (temp - min) / span) * (height - 36);
    return [x, y];
  });
  const line = smoothPath(points);
  const area = `${line} L ${points[points.length - 1][0]} ${height} L ${points[0][0]} ${height} Z`;
  const activePoint = points[active] || points[0];
  const activeTemp = temps[active] ?? temps[0];

  function setFromPointer(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    const index = Math.round(ratio * (hours.length - 1));
    setActive(Math.min(hours.length - 1, Math.max(0, index)));
  }

  return (
    <section className="glass min-w-0 animate-rise rounded-[2rem] p-5 sm:p-6" style={{ animationDelay: '180ms' }}>
      <SectionHeading index="01 — Hours" title="The coming day" caption={`Next 24 hours · ${unitSymbol(unit)} · ${timezone || 'local time'}`} />
      <div
        ref={frameRef}
        className="relative"
        onPointerMove={setFromPointer}
        onPointerLeave={() => setActive(0)}
      >
        <svg viewBox={`0 0 ${width} ${height}`} className="h-[132px] w-full" aria-hidden="true">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--copper)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--copper)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${gradientId})`} />
          <path d={line} fill="none" stroke="var(--copper)" strokeWidth="2.4" strokeLinejoin="round" />
          {activePoint ? (
            <line x1={activePoint[0]} y1="8" x2={activePoint[0]} y2={height - 8} stroke="var(--ink)" strokeOpacity="0.2" />
          ) : null}
          {points.map((point, index) => (
            <circle key={hours[index].time} cx={point[0]} cy={point[1]} r={index === active ? 4.5 : 2.4} fill={index === active ? 'var(--copper)' : 'var(--celadon)'} />
          ))}
        </svg>
        {activePoint ? (
          <div
            className="pointer-events-none absolute rounded-full bg-[#1c1712] px-2 py-0.5 text-xs text-[#fffaf4] tabular-nums dark:bg-[#f6f1e7] dark:text-[#1c1712]"
            style={{
              left: activePoint[0],
              top: activePoint[1] < 28 ? activePoint[1] + 10 : activePoint[1] - 28,
              transform: 'translateX(-50%)',
            }}
          >
            {Math.round(activeTemp)}°
          </div>
        ) : null}
      </div>
      <ul className="rail mt-3 flex gap-2 overflow-x-auto pb-2">
        {hours.map((hour, index) => {
          const { label } = describeWeather(hour.code);
          const selected = index === active;
          return (
            <li key={hour.time} className="shrink-0">
              <button
                type="button"
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                className={`focus-ring card-hover w-[4.7rem] rounded-2xl border px-2 py-3 text-center ${selected ? 'border-copper bg-copper/10' : 'border-line bg-glass/40'}`}
              >
                <span className="block text-[11px] uppercase tracking-[0.12em] text-muted">{index === 0 ? 'Now' : clockFromIso(hour.time)}</span>
                <WeatherIcon code={hour.code} isDay={hour.isDay} className="mx-auto mt-2 h-8 w-8" />
                <span className="sr-only">{label}</span>
                <span className="mt-1 block text-sm font-medium tabular-nums">{Math.round(temps[index])}°</span>
                <span className="block text-[11px] text-muted">{Math.round(hour.precip)}%</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
