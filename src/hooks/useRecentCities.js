import { useCallback, useEffect, useState } from 'react';
import { placeKey } from '../utils/format';

const KEY = 'caeliveth.recents';
const MAX = 6;

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (city) => city?.name && Number.isFinite(Number(city.latitude)) && Number.isFinite(Number(city.longitude)),
    );
  } catch {
    return [];
  }
}

function compact(place) {
  const latitude = Number(place.latitude);
  const longitude = Number(place.longitude);
  const next = {
    name: place.name,
    admin1: place.admin1 || '',
    country: place.country || '',
    latitude,
    longitude,
  };
  return { ...next, id: placeKey(next) };
}

export function useRecentCities() {
  const [cities, setCities] = useState(read);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(cities));
  }, [cities]);

  const remember = useCallback((place) => {
    const next = compact(place);
    setCities((current) => [next, ...current.filter((city) => city.id !== next.id)].slice(0, MAX));
  }, []);

  const forget = useCallback((id) => {
    setCities((current) => current.filter((city) => city.id !== id));
  }, []);

  return { cities, remember, forget };
}
