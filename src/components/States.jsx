import { OBSERVATORIES } from '../data/observatories';

export function LoadingState() {
  return (
    <section className="mt-5 space-y-4" aria-busy="true" aria-live="polite">
      <div className="glass rounded-[2rem] px-6 py-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-copper">Reading the sky</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">Taking a reading…</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div className="skeleton h-40 w-40 rounded-full" />
            <div className="skeleton h-8 w-48" />
            <div className="skeleton h-4 w-32" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="skeleton h-24" />
            <div className="skeleton h-24" />
            <div className="skeleton h-24" />
            <div className="skeleton h-24" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <section className="glass animate-rise mx-auto mt-8 max-w-xl rounded-[2rem] px-6 py-10 text-center" role="alert">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-copper">Signal lost</p>
      <h1 className="mt-2 font-display text-4xl tracking-tight">The sky did not answer</h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted">{message || 'The forecast could not be loaded.'}</p>
      <button type="button" onClick={onRetry} className="focus-ring mt-6 rounded-full bg-copper px-5 py-2.5 text-sm font-medium text-oncopper">
        Try again
      </button>
    </section>
  );
}

export function ErrorBanner({ message, onRetry, onDismiss }) {
  return (
    <div role="alert" className="glass mt-4 flex flex-col gap-3 rounded-2xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm">{message}</p>
      <div className="flex gap-2">
        <button type="button" onClick={onRetry} className="focus-ring rounded-full bg-copper px-3 py-1.5 text-sm text-oncopper">
          Retry
        </button>
        <button type="button" onClick={onDismiss} className="focus-ring rounded-full border border-line px-3 py-1.5 text-sm">
          Dismiss
        </button>
      </div>
    </div>
  );
}

export function EmptyState({ notice, onSelect }) {
  return (
    <section className="animate-rise mt-6">
      <div className="glass rounded-[2rem] px-6 py-8 sm:px-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-copper">Awaiting a place</p>
        <h1 className="mt-2 max-w-xl font-display text-4xl tracking-tight sm:text-5xl">The observatory is open</h1>
        <p className="mt-3 max-w-xl text-sm text-muted sm:text-base">
          Allow location, search for a city, or open one of these readings.
        </p>
        {notice ? <p className="mt-4 rounded-2xl border border-line bg-glass px-4 py-3 text-sm">{notice}</p> : null}
      </div>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {OBSERVATORIES.map((place, index) => (
          <li key={place.id}>
            <button
              type="button"
              onClick={() => onSelect(place)}
              className="glass sheen card-hover focus-ring h-full w-full rounded-3xl px-5 py-5 text-left"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <span className="text-[11px] uppercase tracking-[0.18em] text-copper">{place.country}</span>
              <span className="mt-2 block font-display text-3xl tracking-tight">{place.name}</span>
              <span className="mt-2 block text-sm text-muted">Open a reading</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
