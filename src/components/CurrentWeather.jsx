import {
  clockFromIso,
  compass,
  convertTemp,
  formatClock,
  formatCoords,
  formatFullDate,
  formatVisibility,
  placeSubtitle,
  visibilityKm,
} from '../utils/format';
import { describeWeather } from '../utils/weather';
import AnimatedNumber from './AnimatedNumber';
import Gauge from './Gauge';
import Instrument from './Instrument';
import SunArc from './SunArc';
import WeatherIcon from './WeatherIcon';

export default function CurrentWeather({ place, weather, unit, now }) {
  const current = weather.current;
  const today = weather.daily[0];
  const { label } = describeWeather(current.code);
  const temperature = convertTemp(current.temperature, unit);
  const feels = convertTemp(current.feelsLike, unit);
  const subtitle = placeSubtitle(place);
  const direction = compass(current.windDirection);

  return (
    <section className="grid min-w-0 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-12">
      <article className="glass sheen card-hover animate-rise flex min-w-0 flex-col items-center rounded-[2rem] px-5 py-7 text-center sm:px-8 xl:col-span-5" style={{ animationDelay: '40ms' }}>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">Now observing</p>
          {place.source === 'geo' ? (
            <span className="rounded-full border border-copper/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-copper">
              Current location
            </span>
          ) : null}
        </div>
        <Instrument>
          <p className="flex items-start justify-center text-ink">
            <span className="font-display text-7xl leading-none tracking-tight tabular-nums sm:text-8xl">
              <AnimatedNumber value={temperature} />
            </span>
            <span className="mt-2 font-display text-3xl text-copper sm:text-4xl">°</span>
          </p>
        </Instrument>
        <h1 className="mt-1 font-display text-4xl tracking-tight sm:text-5xl">{place.name}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">{formatCoords(place.latitude, place.longitude)}</p>
        <div className="mt-4 flex items-center gap-3">
          <WeatherIcon code={current.code} isDay={current.isDay} className="h-12 w-12 text-copper" />
          <div className="text-left">
            <p className="text-lg">{label}</p>
            <p className="text-sm text-muted">
              Feels like <AnimatedNumber value={feels} />°
            </p>
          </div>
        </div>
        <p className="mt-5 font-display text-3xl tabular-nums">{formatClock(now, weather.timezone)}</p>
        <p className="text-sm text-muted">{formatFullDate(now, weather.timezone)}</p>
        <p className="mt-2 text-xs uppercase tracking-[0.14em] text-muted">Observed {clockFromIso(current.time)} local</p>
      </article>

      <article className="glass sheen card-hover animate-rise flex min-w-0 flex-col justify-center rounded-[2rem] px-4 py-6 sm:px-6 xl:col-span-7" style={{ animationDelay: '120ms' }}>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          <Gauge
            label="Humidity"
            value={current.humidity}
            min={0}
            max={100}
            display={Number.isFinite(current.humidity) ? `${Math.round(current.humidity)}%` : '—'}
            caption="Relative"
          />
          <Gauge
            label="Wind"
            value={current.windSpeed}
            min={0}
            max={80}
            display={Number.isFinite(current.windSpeed) ? `${Math.round(current.windSpeed)}` : '—'}
            caption={direction ? `${direction} · km/h` : 'km/h'}
            direction={current.windDirection}
          />
          <Gauge
            label="Visibility"
            value={visibilityKm(current.visibility)}
            min={0}
            max={30}
            display={formatVisibility(current.visibility)}
            caption="Distance"
          />
          <Gauge
            label="Pressure"
            value={current.pressure}
            min={960}
            max={1050}
            display={Number.isFinite(current.pressure) ? Math.round(current.pressure).toLocaleString('en-GB') : '—'}
            caption="hPa"
          />
        </div>
        {today ? (
          <SunArc sunrise={today.sunrise} sunset={today.sunset} utcOffset={weather.utcOffsetSeconds} now={now} />
        ) : null}
        {current.precipitation > 0 ? (
          <p className="mt-2 text-center text-sm text-muted">{current.precipitation} mm in the current hour</p>
        ) : null}
      </article>
    </section>
  );
}
