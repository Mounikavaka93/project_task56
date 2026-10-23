import { useEffect } from 'react';
import Atmosphere from './components/Atmosphere';
import CurrentWeather from './components/CurrentWeather';
import DailyForecast from './components/DailyForecast';
import Header from './components/Header';
import HourlyForecast from './components/HourlyForecast';
import { EmptyState, ErrorBanner, ErrorState, LoadingState } from './components/States';
import { useNow } from './hooks/useNow';
import { useTheme } from './hooks/useTheme';
import { useWeather } from './hooks/useWeather';
import { convertTemp } from './utils/format';
import { sceneFromCode } from './utils/weather';

export default function App() {
  const { theme, toggle } = useTheme();
  const now = useNow();
  const {
    status,
    error,
    notice,
    place,
    weather,
    unit,
    setUnit,
    recents,
    forget,
    selectCity,
    locate,
    retry,
    dismissError,
  } = useWeather();

  useEffect(() => {
    if (place && weather) {
      const temperature = convertTemp(weather.current.temperature, unit);
      const rounded = temperature == null ? '—' : Math.round(temperature);
      document.title = `${rounded}° · ${place.name} · Caeliveth`;
      return;
    }
    document.title = 'Caeliveth · Sky Observatory';
  }, [place, weather, unit]);

  const scene = weather ? sceneFromCode(weather.current.code) : 'clear';
  const busy = status === 'loading' || status === 'locating' || status === 'refreshing';

  return (
    <div className="relative z-0 min-h-screen text-ink">
      <Atmosphere
        scene={scene}
        theme={theme}
        sunrise={weather?.daily?.[0]?.sunrise}
        sunset={weather?.daily?.[0]?.sunset}
        utcOffset={weather?.utcOffsetSeconds ?? 0}
        cloud={weather?.current?.cloudCover ?? 0}
      />
      <div className="grain" />
      {busy ? <div className="loadbar" aria-hidden="true" /> : null}
      <div className="relative z-10 mx-auto w-full min-w-0 max-w-[1440px] overflow-x-clip px-3 pb-16 pt-4 sm:px-6 md:px-8 lg:px-10 min-[1440px]:px-12">
        <Header
          theme={theme}
          onToggleTheme={toggle}
          unit={unit}
          onUnit={setUnit}
          onSelectCity={selectCity}
          onLocate={locate}
          locating={status === 'locating'}
          recents={recents}
          activeId={place?.id}
          onForget={forget}
        />
        <main id="reading" className="min-w-0" aria-busy={busy}>
          {error && weather ? <ErrorBanner message={error} onRetry={retry} onDismiss={dismissError} /> : null}
          {notice && weather ? (
            <p className="glass mt-4 rounded-2xl px-4 py-3 text-sm" role="status">
              {notice}
            </p>
          ) : null}
          {!weather && (status === 'locating' || status === 'loading') ? <LoadingState /> : null}
          {!weather && status === 'error' ? <ErrorState message={error} onRetry={retry} /> : null}
          {!weather && status === 'empty' ? <EmptyState notice={notice} onSelect={selectCity} /> : null}
          {weather && place ? (
            <div key={place.id} className="mt-5 space-y-4">
              <CurrentWeather place={place} weather={weather} unit={unit} now={now} />
              <HourlyForecast hours={weather.hourly} unit={unit} timezone={weather.timezone} />
              <DailyForecast days={weather.daily} unit={unit} timezone={weather.timezone} now={now} />
            </div>
          ) : null}
        </main>
        <footer className="mt-10 flex flex-col gap-2 border-t border-line/80 pt-5 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>Caeliveth · a private reading of the open sky</p>
          <p>
            Forecasts by{' '}
            <a className="focus-ring underline decoration-copper/50 underline-offset-4" href="https://open-meteo.com/" target="_blank" rel="noreferrer">
              Open-Meteo
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
