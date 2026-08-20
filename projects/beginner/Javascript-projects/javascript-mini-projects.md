# JavaScript Mini Projects

> A personal collection of 8 premium web projects built from scratch using pure HTML, CSS, and JavaScript — no frameworks, no libraries.

**Author:** [IMxMaYur](https://github.com/IMxMaYur)

**Repository:** [DevShelf / javascript-mini-projects](https://github.com/IMxMaYur/DevShelf/blob/main/projects/beginner/javascript-mini-projects.md)

**Difficulty:** 🟢 Beginner to Intermediate

**Domain:** Web Development / Frontend

**Languages:** HTML, CSS, JavaScript

**Framework:** None

**Database:** None (LocalStorage where needed)

**Cost:** 🆓 Free

**License:** MIT

**Status:** ✅ Completed

**Last Updated:** 2026-08-20

---

## 📌 What is this?

A collection of 8 fully hand-crafted JavaScript projects built independently using only HTML, CSS, and JavaScript. Each project lives in its own folder with a clean, modern, dark-mode UI featuring glassmorphism, gradient animations, and real API integrations where applicable.

The collection includes:

| # | Project | Folder |
|---|---------|--------|
| 01 | Counter App | `01-counter-app/` |
| 02 | To-Do List App | `02-todo-list/` |
| 03 | Calculator | `03-calculator/` |
| 04 | Digital Clock | `04-digital-clock/` |
| 05 | Weather Web App | `05-weather-app/` |
| 06 | Currency Converter | `06-currency-converter/` |
| 07 | Quote Generator | `07-quote-generator/` |
| 08 | Text-to-Speech App | `08-text-to-speech/` |

Open `index.html` in the root folder to access all projects from the hub.

---

## 🚀 Project Highlights

### 01 · Counter App
- Animated circular progress ring (SVG)
- Configurable step size
- Action history log
- Keyboard shortcuts (`↑` / `↓` / `R`)

### 02 · To-Do List App
- Priority levels (Low / Medium / High)
- Filter tabs: All · Active · Completed
- Progress bar showing completion percentage
- Persisted with `localStorage`

### 03 · Calculator
- Operator chaining (like a real calculator)
- **`⌫` backspace button** to delete one digit at a time
- Expression display above the result
- Full keyboard support

### 04 · Digital Clock
- **Live sky simulation** — the background changes in real time:
  - 🌅 Sunrise at 6 AM (orange/gold sky, sun rises from left horizon)
  - ☀️ Noon (bright blue sky, sun near top-center)
  - 🌇 Sunset at 5–6 PM (red/purple/orange, horizon glow)
  - 🌙 Night (dark sky, moon arcs across, 200 twinkling stars)
- 12 h / 24 h toggle
- Day progress + Year progress bars

### 05 · Weather Web App
- Real weather data via **Open-Meteo API** (free, no API key)
- City search + GPS geolocation
- °C / °F toggle
- Humidity, wind, visibility, pressure, sunrise & sunset

### 06 · Currency Converter
- Live rates via **fawazahmed0 currency-api** (CDN-hosted, no key needed)
- 30 currencies with flag emojis
- Rate caching to avoid redundant requests
- Popular pair shortcuts with one-click conversion

### 07 · Quote Generator
- 25+ curated quotes across 5 categories (Wisdom, Motivation, Philosophy, Creativity, Success)
- Category filter chips
- Save favourites to `localStorage`
- Copy to clipboard & share on X/Twitter

### 08 · Text-to-Speech App
- Uses the browser's **Web Speech API** — no external service needed
- Multi-voice selector (shows all installed system voices)
- Speed, pitch, and volume sliders
- Animated audio visualizer bars while speaking
- Preset text buttons

---

## 🧠 Concepts covered

- DOM manipulation & event handling
- CSS animations, glassmorphism, gradients
- Fetch API & async/await with free public APIs
- `localStorage` for data persistence
- Browser APIs: Speech Synthesis, Geolocation, Clipboard, Intl
- SVG animations
- Real-time UI updates with `setInterval`

---

## 📋 How to run

No build step needed. Just open any `index.html` directly in a modern browser (Chrome, Edge, Firefox).

```
Javascript-projects/
├── index.html          ← Project hub (start here)
├── 01-counter-app/
├── 02-todo-list/
├── 03-calculator/
├── 04-digital-clock/
├── 05-weather-app/
├── 06-currency-converter/
├── 07-quote-generator/
└── 08-text-to-speech/
```

---

## 🔗 Links

| | |
|---|---|
| 👤 GitHub Profile | [github.com/IMxMaYur](https://github.com/IMxMaYur) |
| 📁 This file on GitHub | [DevShelf / javascript-mini-projects.md](https://github.com/IMxMaYur/DevShelf/blob/main/projects/beginner/javascript-mini-projects.md) |

---

## ⭐ Notes

- All projects are original work — built from scratch by [@IMxMaYur](https://github.com/IMxMaYur), not copied or adapted from any third-party repository.
- APIs used (Open-Meteo, fawazahmed0 currency-api) are fully free and require no API keys.
- The digital clock sky simulation updates every second based on your real local time.
