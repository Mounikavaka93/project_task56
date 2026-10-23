import { calendarParts, cityDateKey, convertTemp, unitSymbol } from '../utils/format';
import { describeWeather } from '../utils/weather';
import { DropIcon } from './icons';
import SectionHeading from './SectionHeading';
import WeatherIcon from './WeatherIcon';

export default function DailyForecast({ days, unit, timezone, now }) {
  if (!days?.length) {
    return (
      <section className="glass rounded-[2rem] p-5 sm:p-6">
        <SectionHeading index="02 — Week" title="Seven days out" />
        <p className="text-sm text-muted">The weekly reading is unavailable for this place.</p>
      </section>
    );
  }

  const todayKey = cityDateKey(now, timezone);
  const lows = days.map((day) => day.min).filter(Number.isFinite);
  const highs = days.map((day) => day.max).filter(Number.isFinite);
  const weekMin = lows.length ? Math.min(...lows) : 0;
  const weekMax = highs.length ? Math.max(...highs) : 1;
  const span = weekMax - weekMin || 1;

  return (
    <section className="glass min-w-0 animate-rise rounded-[2rem] p-5 sm:p-6" style={{ animationDelay: '240ms' }}>
      <SectionHeading index="02 — Week" title="Seven days out" caption={`High and low · ${unitSymbol(unit)}`} />
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
        {days.map((day, index) => {
          const parts = calendarParts(day.date);
          const { label } = describeWeather(day.code);
          const high = convertTemp(day.max, unit);
          const low = convertTemp(day.min, unit);
          const left = ((day.min - weekMin) / span) * 100;
          const width = Math.max(8, ((day.max - day.min) / span) * 100);
          const isToday = day.date === todayKey;
          return (
            <li key={day.date}>
              <article
                className="card-hover sheen h-full rounded-3xl border border-line bg-glass/45 px-3 py-4"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-copper">{isToday ? 'Today' : parts.weekday}</p>
                <p className="font-display text-2xl leading-none">{parts.day}</p>
                <p className="text-xs text-muted">{parts.month}</p>
                <WeatherIcon code={day.code} isDay className="mt-3 h-10 w-10 text-ink" />
                <p className="mt-2 min-h-10 text-sm leading-tight">{label}</p>
                <p className="mt-2 text-sm tabular-nums">
                  <span className="font-medium">{high == null ? '—' : Math.round(high)}°</span>
                  <span className="text-muted"> / {low == null ? '—' : Math.round(low)}°</span>
                </p>
                <div className="relative mt-3 h-1.5 rounded-full bg-line">
                  <div
                    className="absolute h-full rounded-full bg-gradient-to-r from-celadon to-copper"
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                </div>
                <p className="mt-3 flex items-center gap-1 text-xs text-muted">
                  <DropIcon className="h-3 w-3 text-celadon" />
                  {Math.round(day.precip)}%
                  {Number.isFinite(day.uv) ? <span className="ml-auto">UV {Math.round(day.uv)}</span> : null}
                </p>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
