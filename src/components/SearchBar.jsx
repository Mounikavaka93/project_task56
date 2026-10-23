import { useEffect, useRef, useState } from 'react';
import { searchCities, toPlace } from '../services/weatherApi';
import { placeSubtitle } from '../utils/format';
import { SearchIcon } from './icons';

export default function SearchBar({ onSelect }) {
  const [term, setTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const shellRef = useRef(null);
  const inputRef = useRef(null);
  const searchSeq = useRef(0);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onPointer = (event) => {
      if (!shellRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, []);

  const query = term.trim();
  const canSearch = query.length >= 2;
  const shownSuggestions = canSearch ? suggestions : [];
  const shownError = canSearch || searchError === 'Enter a city name.' ? searchError : '';

  useEffect(() => {
    const nextQuery = term.trim();
    if (nextQuery.length < 2) return undefined;

    const controller = new AbortController();
    const request = ++searchSeq.current;
    const timer = window.setTimeout(async () => {
      setSearching(true);
      setSearchError('');
      try {
        const results = await searchCities(nextQuery, controller.signal);
        if (request !== searchSeq.current) return;
        const places = results.map((result) => toPlace(result));
        setSuggestions(places);
        setActive(places.length ? 0 : -1);
        setOpen(true);
        setSearchError(places.length ? '' : `No city matched “${nextQuery}”.`);
      } catch (error) {
        if (error?.name === 'AbortError' || request !== searchSeq.current) return;
        setSuggestions([]);
        setSearchError('Search is unavailable right now.');
        setOpen(true);
      } finally {
        if (request === searchSeq.current) setSearching(false);
      }
    }, 320);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [term]);

  function choose(place) {
    setTerm('');
    setSuggestions([]);
    setSearchError('');
    setOpen(false);
    setActive(-1);
    onSelect(place);
    inputRef.current?.blur();
  }

  async function onSubmit(event) {
    event.preventDefault();
    const nextQuery = term.trim();
    if (!nextQuery) {
      setSearchError('Enter a city name.');
      setOpen(true);
      return;
    }
    if (active >= 0 && shownSuggestions[active]) {
      choose(shownSuggestions[active]);
      return;
    }
    if (shownSuggestions.length) {
      choose(shownSuggestions[0]);
      return;
    }

    setSearching(true);
    setSearchError('');
    try {
      const results = await searchCities(nextQuery);
      if (!results.length) {
        setSuggestions([]);
        setSearchError(`No city matched “${nextQuery}”.`);
        setOpen(true);
        return;
      }
      choose(toPlace(results[0]));
    } catch (error) {
      if (error?.name === 'AbortError') return;
      setSearchError('Search is unavailable right now.');
      setOpen(true);
    } finally {
      setSearching(false);
    }
  }

  function onKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActive((current) => Math.min(shownSuggestions.length - 1, current + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((current) => Math.max(0, current - 1));
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  const showList = open && (shownSuggestions.length > 0 || Boolean(shownError));

  return (
    <div ref={shellRef} className="search-shell mx-auto w-full max-w-2xl rounded-full">
      <form onSubmit={onSubmit} className="flex items-center gap-2 px-3 py-1.5 sm:px-4">
        <SearchIcon className="search-icon h-5 w-5 shrink-0 text-muted" />
        <input
          ref={inputRef}
          role="combobox"
          aria-expanded={showList}
          aria-controls="city-results"
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `city-option-${active}` : undefined}
          value={term}
          onChange={(event) => {
            setTerm(event.target.value);
            setSearchError('');
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search a city"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="focus-ring min-w-0 flex-1 py-2 text-base"
        />
        <span className="hidden text-[11px] uppercase tracking-[0.16em] text-muted lg:inline">/</span>
        <button type="submit" className="icon-btn !h-9 !w-9 shrink-0" aria-label="Search city">
          {canSearch && searching ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-copper" /> : <SearchIcon className="h-4 w-4" />}
        </button>
      </form>
      <span className="search-line pointer-events-none absolute bottom-1 left-8 right-8 h-px bg-copper" />
      {showList ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.55rem)] z-40">
          {shownSuggestions.length > 0 ? (
            <ul id="city-results" role="listbox" className="glass animate-rise max-h-72 overflow-auto rounded-3xl p-2">
              {shownSuggestions.map((place, index) => (
                <li key={place.id} role="presentation">
                  <button
                    type="button"
                    id={`city-option-${index}`}
                    role="option"
                    aria-selected={index === active}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => choose(place)}
                    className={`focus-ring flex w-full flex-col rounded-2xl px-3 py-2.5 text-left transition ${index === active ? 'bg-copper/12' : 'hover:bg-copper/8'}`}
                  >
                    <span className="font-medium">{place.name}</span>
                    <span className="text-sm text-muted">{placeSubtitle(place) || 'Matched place'}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {shownError ? (
            <p role="alert" className="glass animate-rise mt-2 rounded-2xl px-4 py-3 text-sm">
              {shownError}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
