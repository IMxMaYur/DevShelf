# 🧮 Calculator

A premium glassmorphism calculator with operator chaining, a backspace key, expression display, and full keyboard support — built with pure HTML, CSS & JavaScript.

**Author:** [IMxMaYur](https://github.com/IMxMaYur)  
**Part of:** [DevShelf JavaScript Mini Projects](https://github.com/IMxMaYur/DevShelf/blob/main/projects/beginner/javascript-mini-projects.md)

---

## ✨ Features

- ➕➖✖️➗ All four arithmetic operations
- **⌫ Backspace button** — deletes the last typed digit (one at a time)
- 🔗 **Operator chaining** — chain multiple operations without pressing `=` each time
- 📋 **Expression display** — shows the full equation above the result
- **AC** — clears everything · **+/−** — toggles sign
- 💥 **Error handling** — divide-by-zero shows `Error` with a shake animation
- ⌨️ **Full keyboard support** — type numbers, operators, Enter, Backspace
- 🎨 **Glassmorphism dark UI** with purple/indigo glowing operator keys
- 📱 Responsive layout

---

## 🗂️ Files

```
03-calculator/
├── index.html   ← Calculator grid (AC, +/−, ⌫, ÷, …, =)
├── style.css    ← Glassmorphism, key colours, press animations
└── script.js    ← State machine, operator chaining, keyboard map
```

---

## 🚀 How to Run

No installation required:

```
Double-click index.html
```

---

## 🛠️ Built With

| Technology | Purpose |
|-----------|---------|
| HTML5 | 5×4 button grid |
| CSS3 | Glassmorphism, conic gradients, scale press effect |
| Vanilla JavaScript | State machine, chained calculation logic |

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `0`–`9` | Digit input |
| `+` `-` `*` `/` | Operator |
| `Enter` or `=` | Equals |
| `Backspace` | Delete last digit (⌫) |
| `Escape` or `C` | Clear (AC) |
| `%` | Percent |

---

## 💡 Concepts Practiced

- Finite state machine for calculator logic
- Operator chaining without `eval()`
- CSS Grid for button layout
- `data-*` attributes for action dispatch
- Keyboard event handling with `keydown`

---

## 📄 License

MIT — free to use, modify, and share.
