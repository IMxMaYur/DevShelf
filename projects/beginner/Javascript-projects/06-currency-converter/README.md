# 💱 Currency Converter

A real-time currency converter with live exchange rates, 30 currencies, flag emojis, popular pair shortcuts, and a one-click swap — built with pure HTML, CSS & JavaScript.

**Author:** [IMxMaYur](https://github.com/IMxMaYur)  
**Part of:** [DevShelf JavaScript Mini Projects](https://github.com/IMxMaYur/DevShelf/blob/main/projects/beginner/javascript-mini-projects.md)

---

## ✨ Features

- 💱 **30 world currencies** — USD, EUR, GBP, INR, JPY, CAD, AUD and many more
- 🏳️ **Flag emojis** automatically shown next to each selected currency
- 🔄 **Swap button** — instantly swaps From ↔ To and re-converts
- 📊 **Rate display** with an animated progress bar (visual rate indicator)
- ⚡ **Rate caching** — same base currency reused without extra API calls
- 🔥 **Popular pairs** grid (USD→EUR, USD→INR, etc.) with one-click convert
- 🕒 **"Rates as of"** date from the API
- 🌐 Primary + fallback API for maximum reliability
- ⚠️ Descriptive error messages
- 🌑 Dark gold/green glassmorphism UI

---

## 🗂️ Files

```
06-currency-converter/
├── index.html   ← Converter grid, popular pairs, rate display
├── style.css    ← Gold-green gradient theme, swap animation, responsive
└── script.js    ← API fetch with fallback, caching, unit display
```

---

## 🚀 How to Run

No installation required. Requires an internet connection for live rates:

```
Double-click index.html
```

---

## 🌐 API Used

| API | URL | Cost |
|-----|-----|------|
| fawazahmed0/currency-api (primary) | `cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/...` | Free, no key |
| fawazahmed0/currency-api (fallback) | `latest.currency-api.pages.dev/v1/...` | Free, no key |

If the primary CDN fails, the app automatically retries on the fallback URL.

---

## 🛠️ Built With

| Technology | Purpose |
|-----------|---------|
| HTML5 | Converter layout, selects |
| CSS3 | Gold/green gradients, swap rotation, animated rate bar |
| Vanilla JavaScript | API fetch with fallback, caching, number formatting |

---

## 💡 Concepts Practiced

- `fetch` with `async/await` and automatic fallback to secondary URL
- `AbortSignal.timeout()` for network timeouts
- In-memory rate caching with a plain JS object
- `Intl.NumberLocale` for formatted number output
- Dynamic `<select>` population from a data object
- CSS `transform: rotate(180deg)` on swap button hover

---

## 📄 License

MIT — free to use, modify, and share.
