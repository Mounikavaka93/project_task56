const WEATHER = {
  0: ['Clear', 'clear'],
  1: ['Mainly clear', 'partly'],
  2: ['Partly cloudy', 'partly'],
  3: ['Overcast', 'cloudy'],
  45: ['Fog', 'fog'],
  48: ['Rime fog', 'fog'],
  51: ['Light drizzle', 'drizzle'],
  53: ['Drizzle', 'drizzle'],
  55: ['Dense drizzle', 'drizzle'],
  56: ['Freezing drizzle', 'drizzle'],
  57: ['Freezing drizzle', 'drizzle'],
  61: ['Light rain', 'rain'],
  63: ['Rain', 'rain'],
  65: ['Heavy rain', 'rain'],
  66: ['Freezing rain', 'rain'],
  67: ['Freezing rain', 'rain'],
  71: ['Light snow', 'snow'],
  73: ['Snow', 'snow'],
  75: ['Heavy snow', 'snow'],
  77: ['Snow grains', 'snow'],
  80: ['Rain showers', 'rain'],
  81: ['Rain showers', 'rain'],
  82: ['Violent showers', 'rain'],
  85: ['Snow showers', 'snow'],
  86: ['Snow showers', 'snow'],
  95: ['Thunderstorm', 'thunder'],
  96: ['Thunderstorm', 'thunder'],
  99: ['Thunderstorm', 'thunder'],
};

export function describeWeather(code) {
  const match = WEATHER[Number(code)] || ['Unknown sky', 'cloudy'];
  return { label: match[0], scene: match[1] };
}

export function sceneFromCode(code) {
  return describeWeather(code).scene;
}

export function normalizeForecast(data) {
  const current = data.current ?? {};
  const hourly = data.hourly ?? {};
  const daily = data.daily ?? {};
  const times = hourly.time ?? [];
  const currentHour = String(current.time ?? '').slice(0, 13);
  let start = times.findIndex((time) => String(time).slice(0, 13) === currentHour);
  if (start < 0) start = 0;

  const hours = [];
  const end = Math.min(start + 24, times.length);
  for (let index = start; index < end; index += 1) {
    hours.push({
      time: times[index],
      temperature: hourly.temperature_2m?.[index],
      code: hourly.weather_code?.[index],
      precip: hourly.precipitation_probability?.[index] ?? 0,
      isDay: Boolean(hourly.is_day?.[index]),
      wind: hourly.wind_speed_10m?.[index],
    });
  }

  const days = (daily.time ?? []).map((date, index) => ({
    date,
    code: daily.weather_code?.[index],
    max: daily.temperature_2m_max?.[index],
    min: daily.temperature_2m_min?.[index],
    sunrise: daily.sunrise?.[index],
    sunset: daily.sunset?.[index],
    precip: daily.precipitation_probability_max?.[index] ?? 0,
    uv: daily.uv_index_max?.[index],
    wind: daily.wind_speed_10m_max?.[index],
  }));

  return {
    timezone: data.timezone || undefined,
    utcOffsetSeconds: data.utc_offset_seconds ?? 0,
    current: {
      temperature: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      windDirection: current.wind_direction_10m,
      visibility: current.visibility,
      pressure: current.pressure_msl,
      code: current.weather_code,
      isDay: Boolean(current.is_day),
      cloudCover: current.cloud_cover ?? 0,
      precipitation: current.precipitation ?? 0,
      time: current.time,
    },
    hourly: hours,
    daily: days,
  };
}
