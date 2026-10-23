import { LocateIcon, LogoMark, MoonIcon, SunIcon } from './icons';
import RecentCities from './RecentCities';
import SearchBar from './SearchBar';

export default function Header({
  theme,
  onToggleTheme,
  unit,
  onUnit,
  onSelectCity,
  onLocate,
  locating,
  recents,
  activeId,
  onForget,
}) {
  return (
    <header className="relative z-30 animate-rise">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-3 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-x-5">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="focus-ring flex min-w-0 items-center gap-2 text-left sm:gap-3"
        >
          <LogoMark className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" />
          <span className="min-w-0">
            <span className="block truncate font-display text-[1.35rem] leading-none tracking-tight sm:text-[1.7rem]">Caeliveth</span>
            <span className="wordmark-sub mt-1 block text-[10px] uppercase tracking-[0.22em] text-muted">Sky observatory</span>
          </span>
        </button>

        <div className="col-span-2 lg:col-span-1 lg:col-start-2">
          <SearchBar onSelect={onSelectCity} />
        </div>

        <div className="col-start-2 row-start-1 flex items-center gap-1.5 lg:col-start-3">
          <div className="unit-pill" data-unit={unit} role="group" aria-label="Temperature unit">
            <span className="knob" aria-hidden="true" />
            <button type="button" className={`focus-ring ${unit === 'c' ? 'text-oncopper' : 'text-muted'}`} aria-pressed={unit === 'c'} onClick={() => onUnit('c')}>
              °C
            </button>
            <button type="button" className={`focus-ring ${unit === 'f' ? 'text-oncopper' : 'text-muted'}`} aria-pressed={unit === 'f'} onClick={() => onUnit('f')}>
              °F
            </button>
          </div>
          <button
            type="button"
            className="icon-btn focus-ring"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <span className="relative h-5 w-5">
              <SunIcon className={`absolute inset-0 transition duration-500 ${theme === 'dark' ? 'scale-50 opacity-0' : 'scale-100 opacity-100'}`} />
              <MoonIcon className={`absolute inset-0 transition duration-500 ${theme === 'dark' ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} />
            </span>
          </button>
          <button
            type="button"
            className={`icon-btn focus-ring ${locating ? 'locating-ring' : ''}`}
            onClick={() => onLocate({ manual: true })}
            disabled={locating}
            aria-label="Use current location"
          >
            <LocateIcon />
          </button>
        </div>
      </div>
      <RecentCities cities={recents} activeId={activeId} onSelect={onSelectCity} onForget={onForget} />
    </header>
  );
}
