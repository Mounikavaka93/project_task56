const DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function convertTemp(celsius, unit) {
  const value = Number(celsius);
  if (!Number.isFinite(value)) return null;
  return unit === 'f' ? (value * 9) / 5 + 32 : value;
}

export function unitSymbol(unit) {
  return unit === 'f' ? '°F' : '°C';
}

export function compass(degrees) {
  if (!Number.isFinite(degrees)) return '';
  const normalized = ((degrees % 360) + 360) % 360;
  return DIRECTIONS[Math.round(normalized / 45) % 8];
}

export function formatVisibility(meters) {
  if (!Number.isFinite(meters)) return '—';
  const km = meters / 1000;
  if (km >= 10) return `${Math.round(km)} km`;
  return `${km.toFixed(1)} km`;
}

export function visibilityKm(meters) {
  if (!Number.isFinite(meters)) return 0;
  return meters / 1000;
}

export function placeKey(place) {
  return [place?.name, place?.admin1, place?.country].filter(Boolean).join('|').toLowerCase();
}

export function placeSubtitle(place) {
  if (!place) return '';
  return [place.admin1, place.country]
    .filter(Boolean)
    .filter((part, index, all) => part !== place.name && all.indexOf(part) === index)
    .join(', ');
}

export function formatCoords(latitude, longitude) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return '';
  const north = latitude >= 0 ? 'N' : 'S';
  const east = longitude >= 0 ? 'E' : 'W';
  return `${Math.abs(latitude).toFixed(2)}° ${north}  ·  ${Math.abs(longitude).toFixed(2)}° ${east}`;
}

export function clockFromIso(iso) {
  if (!iso || !String(iso).includes('T')) return '—';
  return String(iso).slice(11, 16);
}

function withZone(nowMs, timeZone, options) {
  const date = new Date(nowMs);
  try {
    return new Intl.DateTimeFormat('en-GB', { ...options, timeZone }).format(date);
  } catch {
    return new Intl.DateTimeFormat('en-GB', options).format(date);
  }
}

export function formatClock(nowMs, timeZone) {
  return withZone(nowMs, timeZone, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
}

export function formatFullDate(nowMs, timeZone) {
  return withZone(nowMs, timeZone, { weekday: 'long', day: 'numeric', month: 'long' });
}

export function cityDateKey(nowMs, timeZone) {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(nowMs));
  } catch {
    return new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(nowMs));
  }
}

export function calendarParts(dateStr) {
  const [year, month, day] = String(dateStr).split('-').map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  return {
    weekday: new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'UTC' }).format(utc),
    day,
    month: new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: 'UTC' }).format(utc),
  };
}

export function wallTimeToMs(iso, utcOffsetSeconds = 0) {
  if (!iso) return null;
  const [datePart, timePart = '00:00'] = String(iso).split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  if (![year, month, day, hour].every(Number.isFinite)) return null;
  return Date.UTC(year, month - 1, day, hour, minute || 0) - utcOffsetSeconds * 1000;
}

export function skyPhase(nowMs, sunrise, sunset, utcOffsetSeconds = 0) {
  const rise = wallTimeToMs(sunrise, utcOffsetSeconds);
  const set = wallTimeToMs(sunset, utcOffsetSeconds);
  if (rise == null || set == null || set <= rise) return { phase: 'day', amount: 0.45 };
  if (nowMs >= rise && nowMs <= set) {
    return { phase: 'day', amount: (nowMs - rise) / (set - rise) };
  }
  const night = 86400000 - (set - rise);
  const elapsed = nowMs < rise ? nowMs + 86400000 - set : nowMs - set;
  if (night <= 0) return { phase: 'night', amount: 0.5 };
  return { phase: 'night', amount: clamp(elapsed / night, 0, 1) };
}

export function sunProgress(nowMs, sunrise, sunset, utcOffsetSeconds = 0) {
  const phase = skyPhase(nowMs, sunrise, sunset, utcOffsetSeconds);
  if (phase.phase === 'day') return { amount: phase.amount, up: true };
  return { amount: phase.amount < 0.5 ? 1 : 0, up: false };
}
