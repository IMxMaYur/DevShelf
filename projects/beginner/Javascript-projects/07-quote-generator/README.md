# 💬 Quote Generator

A beautiful quote generator with 25+ curated quotes, category filtering, favorites saved to `localStorage`, copy to clipboard, and share on X/Twitter — built with pure HTML, CSS & JavaScript.

**Author:** [IMxMaYur](https://github.com/IMxMaYur)  
**Part of:** [DevShelf JavaScript Mini Projects](https://github.com/IMxMaYur/DevShelf/blob/main/projects/beginner/javascript-mini-projects.md)

---

## ✨ Features

- 📖 **25+ hand-curated quotes** across 5 categories
- 🗂️ **Category filter chips** — All · Wisdom · Motivation · Philosophy · Creativity · Success
- 🎲 **New Quote** button with a smooth fade + scale transition
- ⭐ **Save to Favorites** — saved quotes persist across page reloads via `localStorage`
- 🗑️ **Remove from favorites** individually
- 📋 **Copy to clipboard** — copies `"Quote text" — Author` format
- 🐦 **Share on X/Twitter** — pre-fills a tweet with the quote
- 🍞 **Toast notifications** for copy confirmation and save feedback
- 🏷️ **Category badge** displayed on the quote card
- 🌑 **Purple/pink glassmorphism UI** with Playfair Display serif typography

---

## 🗂️ Files

```
07-quote-generator/
├── index.html   ← Quote card, action buttons, category chips, favorites
├── style.css    ← Playfair Display typography, fade animations, toast
└── script.js    ← Quote selection, localStorage favorites, copy/tweet
```

---

## 🚀 How to Run

No installation or internet connection required:

```
Double-click index.html
```

---

## 📚 Quote Categories

| Category | Description |
|----------|-------------|
| Wisdom | Timeless life lessons |
| Motivation | Encouragement & drive |
| Philosophy | Deep thoughts & questions |
| Creativity | Art, imagination & innovation |
| Success | Persistence & achievement |

---

## 🛠️ Built With

| Technology | Purpose |
|-----------|---------|
| HTML5 | Quote card, chip filters, favorites list |
| CSS3 | Playfair Display font, glassmorphism, fade transitions, toast |
| Vanilla JavaScript | Quote selection logic, localStorage, Clipboard API, Twitter intent |

---

## 💡 Concepts Practiced

- `localStorage` — storing and retrieving array data with `JSON.stringify`
- `navigator.clipboard.writeText()` — async clipboard API
- `window.open()` with Twitter intent URL for social sharing
- CSS `@keyframes` fade transitions on card swap
- Set deduplication for building unique categories
- Array `filter` and `findIndex` for favorites management

---

## 📄 License

MIT — free to use, modify, and share.
