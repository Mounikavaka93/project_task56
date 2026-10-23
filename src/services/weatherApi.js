import { placeKey } from '../utils/format';

const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const REVERSE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

export function toPlace(result, source = 'search') {
  const latitude = Number(result.latitude);
  const longitude = Number(result.longitude);
  const place = {
    name: result.name || 'Selected place',
    admin1: result.admin1 || '',
    country: result.country || result.country_code || '',
    latitude,
    longitude,
    source: result.source || source,
  };
  return { ...place, id: result.id ? String(result.id) : placeKey(place) };
}

async function request(url, signal, fallback) {
  try {
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(fallback);
    return await response.json();
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    if (error instanceof Error && error.message === fallback) throw error;
    throw new Error(fallback);
  }
}

export async function searchCities(name, signal) {
  const url = new URL(GEO_URL);
  url.searchParams.set('name', name);
  url.searchParams.set('count', '5');
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');
  const data = await request(url, signal, 'Search is unavailable right now.');
  return data.results ?? [];
}

export async function reverseGeocode(latitude, longitude, signal) {
  const fallback = {
    name: 'Current location',
    latitude,
    longitude,
    country: '',
    admin1: '',
  };
  const url = new URL(REVERSE_URL);
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set('localityLanguage', 'en');

  try {
    const response = await fetch(url, { signal });
    if (!response.ok) return fallback;
    const data = await response.json();
    return {
      name: data.city || data.locality || data.principalSubdivision || fallback.name,
      latitude,
      longitude,
      admin1: data.principalSubdivision || '',
      country: data.countryName || '',
    };
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    return fallback;
  }
}

export async function fetchForecast(latitude, longitude, signal) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error('That place has no coordinates.');
  }

  const url = new URL(FORECAST_URL);
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set(
    'current',
    [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'weather_code',
      'cloud_cover',
      'pressure_msl',
      'wind_speed_10m',
      'wind_direction_10m',
      'visibility',
    ].join(','),
  );
  url.searchParams.set(
    'hourly',
    ['temperature_2m', 'weather_code', 'precipitation_probability', 'is_day', 'wind_speed_10m'].join(','),
  );
  url.searchParams.set(
    'daily',
    [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'sunrise',
      'sunset',
      'precipitation_probability_max',
      'uv_index_max',
      'wind_speed_10m_max',
    ].join(','),
  );
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '7');
  url.searchParams.set('temperature_unit', 'celsius');
  url.searchParams.set('wind_speed_unit', 'kmh');

  return request(url, signal, 'The forecast service did not respond.');
}
