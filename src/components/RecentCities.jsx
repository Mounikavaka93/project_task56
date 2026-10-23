import { placeSubtitle } from '../utils/format';
import { CloseIcon } from './icons';

export default function RecentCities({ cities, activeId, onSelect, onForget }) {
  if (!cities.length) return null;

  return (
    <div className="mt-3">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted">Recent readings</p>
      <ul className="rail flex gap-2 overflow-x-auto pb-1">
        {cities.map((city) => {
          const active = city.id === activeId;
          return (
            <li key={city.id} className="shrink-0">
              <div className={`flex items-center rounded-full border ${active ? 'border-copper bg-copper/12' : 'border-line bg-glass'}`}>
                <button
                  type="button"
                  onClick={() => onSelect(city)}
                  title={placeSubtitle(city)}
                  className="focus-ring rounded-full py-1.5 pl-3 pr-1 text-sm"
                >
                  {city.name}
                </button>
                <button
                  type="button"
                  onClick={() => onForget(city.id)}
                  aria-label={`Remove ${city.name}`}
                  className="focus-ring mr-1 grid h-6 w-6 place-items-center rounded-full text-muted hover:text-ink"
                >
                  <CloseIcon />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
