/* ── Weather App – script.js ── */
/* Uses Open-Meteo API (free, no API key required) */

const cityInput   = document.getElementById('city-input');
const searchBtn   = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const loading     = document.getElementById('loading');
const errorMsg    = document.getElementById('error-msg');
const weatherCard = document.getElementById('weather-card');

let currentTempC    = null;
let currentFeelsC   = null;
let currentUnitC    = true;

// ── Weather code → emoji + description ───────────────
const WMO_MAP = {
  0:  ['☀️','Clear sky'],          1:  ['🌤️','Mainly clear'],
  2:  ['⛅','Partly cloudy'],      3:  ['☁️','Overcast'],
  45: ['🌫️','Foggy'],             48: ['🌫️','Icy fog'],
  51: ['🌦️','Light drizzle'],     53: ['🌦️','Moderate drizzle'],
  55: ['🌧️','Dense drizzle'],     61: ['🌧️','Slight rain'],
  63: ['🌧️','Moderate rain'],     65: ['🌧️','Heavy rain'],
  71: ['🌨️','Slight snow'],       73: ['🌨️','Moderate snow'],
  75: ['❄️','Heavy snow'],         77: ['🌨️','Snow grains'],
  80: ['🌦️','Slight showers'],    81: ['🌧️','Moderate showers'],
  82: ['⛈️','Violent showers'],   85: ['🌨️','Snow showers'],
  86: ['🌨️','Heavy snow showers'],95: ['⛈️','Thunderstorm'],
  96: ['⛈️','Thunderstorm w/ hail'], 99: ['⛈️','Severe thunderstorm'],
};

function showLoading(v) { loading.classList.toggle('hidden', !v); }
function showError(msg) { errorMsg.textContent = '⚠️ ' + msg; errorMsg.classList.remove('hidden'); }
function clearError()   { errorMsg.classList.add('hidden'); }
function showCard()     { weatherCard.classList.remove('hidden'); }
function hideCard()     { weatherCard.classList.add('hidden'); }

// ── Geocoding via Open-Meteo ──────────────────────────
async function geocode(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const res  = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error('Geocoding service unavailable. Please try again.');
  const data = await res.json();
  if (!data.results || data.results.length === 0) {
    throw new Error(`City "${city}" not found. Try a different spelling.`);
  }
  return data.results[0];
}

// ── Fetch weather via Open-Meteo ──────────────────────
async function fetchWeather(lat, lon) {
  // Note: sunrise/sunset are daily fields, NOT current fields
  const currentFields = [
    'temperature_2m',
    'apparent_temperature',
    'relative_humidity_2m',
    'wind_speed_10m',
    'visibility',
    'surface_pressure',
    'weather_code',
    'is_day',
  ].join(',');

  const dailyFields = 'sunrise,sunset';

  const params = new URLSearchParams({
    latitude:  lat,
    longitude: lon,
    current:   currentFields,
    daily:     dailyFields,
    timezone:  'auto',
    forecast_days: 1,
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params}`;
  const res  = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Weather API error (${res.status}). ${errText}`);
  }
  return res.json();
}

// ── Render ────────────────────────────────────────────
function renderWeather(geo, weather) {
  const c = weather.current;
  const d = weather.daily;

  const [icon, desc] = WMO_MAP[c.weather_code] ?? ['🌡️', 'Unknown'];
  currentTempC  = c.temperature_2m;
  currentFeelsC = c.apparent_temperature;
  currentUnitC  = true;

  document.getElementById('city-name').textContent   = geo.name;
  document.getElementById('country').textContent     = [geo.admin1, geo.country].filter(Boolean).join(', ');
  document.getElementById('local-time').textContent  = `Local: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  document.getElementById('weather-icon').textContent = icon;
  document.getElementById('weather-desc').textContent = desc;
  document.getElementById('temperature').textContent  = `${Math.round(c.temperature_2m)}°C`;
  document.getElementById('feels-like').textContent   = `Feels like ${Math.round(c.apparent_temperature)}°C`;
  document.getElementById('humidity-val').textContent = `${c.relative_humidity_2m}%`;
  document.getElementById('wind-val').textContent     = `${Math.round(c.wind_speed_10m)} km/h`;

  const visKm = c.visibility != null ? (c.visibility / 1000).toFixed(1) + ' km' : '—';
  document.getElementById('vis-val').textContent      = visKm;
  document.getElementById('pressure-val').textContent = `${Math.round(c.surface_pressure)} hPa`;

  // Sunrise / Sunset come from daily[0]
  function fmtTime(isoStr) {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  document.getElementById('sunrise').textContent = fmtTime(d?.sunrise?.[0]);
  document.getElementById('sunset').textContent  = fmtTime(d?.sunset?.[0]);

  showCard();
}

// ── Unit toggle ───────────────────────────────────────
window.toggleUnit = function(unit) {
  if (currentTempC === null) return;
  currentUnitC = unit === 'C';
  const temp   = currentUnitC ? currentTempC   : (currentTempC   * 9/5) + 32;
  const feels  = currentUnitC ? currentFeelsC  : (currentFeelsC  * 9/5) + 32;
  document.getElementById('temperature').textContent = `${Math.round(temp)}°${unit}`;
  document.getElementById('feels-like').textContent  = `Feels like ${Math.round(feels)}°${unit}`;
  document.getElementById('btn-c').classList.toggle('active', unit === 'C');
  document.getElementById('btn-f').classList.toggle('active', unit === 'F');
};

// ── Main search ───────────────────────────────────────
async function search(cityName) {
  clearError(); hideCard(); showLoading(true);
  try {
    const geo     = await geocode(cityName);
    const weather = await fetchWeather(geo.latitude, geo.longitude);
    renderWeather(geo, weather);
  } catch (err) {
    if (err.name === 'TimeoutError') {
      showError('Request timed out. Check your internet connection and try again.');
    } else {
      showError(err.message || 'Something went wrong. Please try again.');
    }
  } finally {
    showLoading(false);
  }
}

// ── Geolocation ───────────────────────────────────────
locationBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    showError('Geolocation is not supported by your browser.');
    return;
  }
  clearError(); hideCard(); showLoading(true);
  navigator.geolocation.getCurrentPosition(
    async pos => {
      try {
        const { latitude: lat, longitude: lon } = pos.coords;
        // Reverse geocode via Nominatim
        const r   = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
          { headers: { 'Accept-Language': 'en' }, signal: AbortSignal.timeout(6000) }
        );
        const d   = await r.json();
        const name = d.address?.city || d.address?.town || d.address?.village || 'Your Location';
        const geo  = {
          name,
          admin1:  d.address?.state,
          country: d.address?.country,
          latitude:  lat,
          longitude: lon,
        };
        const weather = await fetchWeather(lat, lon);
        renderWeather(geo, weather);
      } catch (err) {
        showError('Could not retrieve weather for your location.');
      } finally {
        showLoading(false);
      }
    },
    err => {
      const msgs = {
        1: 'Location access denied. Please allow location in your browser.',
        2: 'Location unavailable.',
        3: 'Location request timed out.',
      };
      showError(msgs[err.code] || 'Could not get your location.');
      showLoading(false);
    },
    { timeout: 10000 }
  );
});

// ── UI Events ─────────────────────────────────────────
searchBtn.addEventListener('click', () => {
  const v = cityInput.value.trim();
  if (v) search(v);
});
cityInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && cityInput.value.trim()) search(cityInput.value.trim());
});

// ── Default load ──────────────────────────────────────
search('Mumbai');
