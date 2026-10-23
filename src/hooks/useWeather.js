import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchForecast, reverseGeocode, toPlace } from '../services/weatherApi';
import { placeKey } from '../utils/format';
import { normalizeForecast } from '../utils/weather';
import { useRecentCities } from './useRecentCities';

const UNIT_KEY = 'caeliveth.unit';

export function useWeather() {
  const { cities, remember, forget } = useRecentCities();
  const [unit, setUnitState] = useState(() => (localStorage.getItem(UNIT_KEY) === 'f' ? 'f' : 'c'));
  const [status, setStatus] = useState('locating');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [place, setPlace] = useState(null);
  const [weather, setWeather] = useState(null);

  const seq = useRef(0);
  const abortRef = useRef(null);
  const hasWeather = useRef(false);
  const userLock = useRef(false);
  const placeRef = useRef(null);
  const locateGen = useRef(0);
  useEffect(() => {
    localStorage.setItem(UNIT_KEY, unit);
  }, [unit]);

  useEffect(() => {
    if (!notice || !hasWeather.current) return undefined;
    const id = window.setTimeout(() => setNotice(''), 7000);
    return () => window.clearTimeout(id);
  }, [notice, weather]);

  const load = useCallback(async (nextPlace) => {
    const token = ++seq.current;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const normalizedPlace = { ...nextPlace, id: placeKey(nextPlace) };
    setError('');
    setStatus(hasWeather.current ? 'refreshing' : 'loading');

    try {
      const raw = await fetchForecast(normalizedPlace.latitude, normalizedPlace.longitude, controller.signal);
      if (token !== seq.current) return;
      hasWeather.current = true;
      placeRef.current = normalizedPlace;
      setPlace(normalizedPlace);
      setWeather(normalizeForecast(raw));
      setStatus('ready');
      setNotice('');
      remember(normalizedPlace);
    } catch (err) {
      if (err?.name === 'AbortError' || token !== seq.current) return;
      setError(err?.message || 'The forecast could not be loaded.');
      setStatus(hasWeather.current ? 'ready' : 'error');
    }
  }, [remember]);

  const selectCity = useCallback(
    (nextPlace) => {
      userLock.current = true;
      locateGen.current += 1;
      const placeToLoad = nextPlace.source ? nextPlace : { ...nextPlace, source: 'search' };
      return load(placeToLoad);
    },
    [load],
  );

  const locate = useCallback(
    (options = {}) => {
      const manual = options.manual === true;
      const generation = ++locateGen.current;
      if (manual) userLock.current = false;

      if (!navigator.geolocation) {
        setNotice('This browser cannot read your location. Search for a city instead.');
        setStatus(hasWeather.current ? 'ready' : 'empty');
        return;
      }

      setStatus(hasWeather.current ? 'refreshing' : 'locating');

      const timer = window.setTimeout(() => {
        if (generation !== locateGen.current || hasWeather.current || userLock.current) return;
        setStatus((current) => (current === 'locating' ? 'empty' : current));
        setNotice('Location is taking too long. Search for a city, or try the location button again.');
      }, 12000);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          window.clearTimeout(timer);
          if (generation !== locateGen.current || (!manual && userLock.current)) return;
          try {
            const geo = await reverseGeocode(position.coords.latitude, position.coords.longitude);
            if (generation !== locateGen.current || (!manual && userLock.current)) return;
            await load(toPlace(geo, 'geo'));
          } catch (err) {
            if (err?.name === 'AbortError' || generation !== locateGen.current) return;
            setError(err?.message || 'Location lookup failed.');
            setStatus(hasWeather.current ? 'ready' : 'error');
          }
        },
        (geoError) => {
          window.clearTimeout(timer);
          if (generation !== locateGen.current || (!manual && userLock.current)) return;
          const denied = geoError?.code === 1;
          setNotice(
            denied
              ? 'Location permission is blocked. Search for a city to continue.'
              : 'Your position could not be read. Search for a city instead.',
          );
          setError('');
          setStatus(hasWeather.current ? 'ready' : 'empty');
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
      );
    },
    [load],
  );

  useEffect(() => {
    const id = window.setTimeout(() => locate({ manual: false }), 0);
    return () => {
      window.clearTimeout(id);
      locateGen.current += 1;
      abortRef.current?.abort();
    };
  }, [locate]);

  const retry = useCallback(() => {
    if (placeRef.current) return load(placeRef.current);
    return locate({ manual: true });
  }, [load, locate]);

  const dismissError = useCallback(() => setError(''), []);

  const setUnit = useCallback((next) => {
    setUnitState(next === 'f' ? 'f' : 'c');
  }, []);

  return {
    status,
    error,
    notice,
    place,
    weather,
    unit,
    setUnit,
    recents: cities,
    forget,
    selectCity,
    locate,
    retry,
    dismissError,
  };
}
