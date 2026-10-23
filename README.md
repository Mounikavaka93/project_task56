# Caeliveth

A sky observatory for the place you are standing, or any city you name. The background, light, and motion follow the live weather.

## Run

```bash
npm install
npm run dev
```

Open the local address Vite prints. Forecasts come from [Open-Meteo](https://open-meteo.com/). Place names for your current coordinates come from [BigDataCloud](https://www.bigdatacloud.com/). Neither service needs an API key.

## What you can do

- Read the current sky: temperature, feels-like, humidity, wind, visibility, pressure, sunrise, and sunset
- Search by city, with a clear message when a name cannot be found
- See the next 24 hours and the next 7 days
- Switch °C / °F, light and dark, and return to a recent city
- Use your current location, or open Kyoto, Reykjavík, Lisbon, or Queenstown if location is unavailable

## Scripts

- `npm run dev` — local observatory
- `npm run build` — production build
- `npm run preview` — preview the build
- `npm run lint` — lint the source
