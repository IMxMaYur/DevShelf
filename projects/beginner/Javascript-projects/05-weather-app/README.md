# 🌤️ Weather Web App

A real-time weather app that fetches live data using the free Open-Meteo API — no API key needed — with city search, GPS geolocation, and °C/°F toggle.

**Author:** [IMxMaYur](https://github.com/IMxMaYur)  
**Part of:** [DevShelf JavaScript Mini Projects](https://github.com/IMxMaYur/DevShelf/blob/main/projects/beginner/javascript-mini-projects.md)

---

## ✨ Features

- 🔍 **City search** — type any city name and press Enter or click Search
- 📍 **GPS geolocation** — click the location button to use your current position
- 🌡️ **Temperature display** with °C / °F toggle
- 🌤️ **Weather icon & description** mapped from WMO weather codes (e.g. ☀️ Clear sky, ⛈️ Thunderstorm)
- 💧 **Humidity** · 💨 **Wind speed** · 👁️ **Visibility** · 🌡️ **Pressure** stat cards
- 🌅 **Sunrise** and 🌇 **Sunset** times
- ⏳ **Loading spinner** while fetching
- ❌ **Descriptive error messages** for city-not-found, network timeout, denied location
- 🎨 **Animated particle background** that reacts to time of day

---

## 🗂️ Files

```
05-weather-app/
├── index.html   ← Search bar, weather card, stat grid
├── style.css    ← Dark glassmorphism, animated particles, responsive grid
└── script.js    ← Geocoding, weather fetch, unit toggle, geolocation
```

---

## 🚀 How to Run

No installation required. Requires an internet connection for live data:

```
Double-click index.html
```

The app loads weather for **Mumbai** by default.

> ⚠️ Geolocation requires the page to be served over HTTPS or `localhost` in some browsers. Opening via `file://` may block location access — use a local server if needed.

---

## 🌐 APIs Used

| API | Purpose | Cost |
|-----|---------|------|
| [Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api) | City name → latitude/longitude | Free, no key |
| [Open-Meteo Forecast](https://open-meteo.com/en/docs) | Live weather data | Free, no key |
| [Nominatim (OpenStreetMap)](https://nominatim.org/) | GPS coordinates → city name | Free, no key |

---

## 🛠️ Built With

| Technology | Purpose |
|-----------|---------|
| HTML5 | Semantic layout, geolocation API |
| CSS3 | Glassmorphism card, particle animation, responsive grid |
| Vanilla JavaScript | `fetch`, `async/await`, `AbortSignal.timeout`, unit conversion |

---

## 💡 Concepts Practiced

- `fetch` API with `async/await` and error handling
- `AbortSignal.timeout()` for network timeouts
- `navigator.geolocation.getCurrentPosition()`
- WMO weather code mapping (emoji + description)
- Dynamic unit conversion (°C ↔ °F) without re-fetching
- Chained API calls (geocoding → weather)

---

## 📄 License

MIT — free to use, modify, and share.
