# 🎓 GradeIQ — Smart Grade Calculator

A feature-rich, client-side student grade calculator built with **HTML, CSS, and Vanilla JavaScript**. Add subjects by marks or letter grade, compute your GPA or percentage average, view grade distribution, and print a report card — no sign-up, no backend.

---

## ✨ Features

| Feature | Details |
|---|---|
| **Multiple Grading Systems** | Switch between **Percentage**, **GPA 4.0**, and **GPA 10.0** at any time |
| **Dual Input Modes** | Enter grades as **Marks** (obtained / total) or select a **Letter Grade** via pill buttons |
| **Animated GPA Ring** | Canvas-drawn arc that fills to reflect your current average |
| **Summary Banner** | Live stats — average %, letter grade, subject count, highest, and lowest score |
| **Grade Distribution** | Horizontal bar chart showing how many subjects fall in A / B / C / D / F bands |
| **Credit-Weighted GPA** | If credits are provided, a weighted GPA (4.0 scale) is calculated automatically |
| **Search & Sort** | Search subjects by name; sort by default, A–Z, highest, or lowest score |
| **Rank Badges** | Top 3 subjects earn 🥇 🥈 🥉 medals |
| **Performance Badge** | Motivational emoji badge based on your average (Outstanding → Needs Effort) |
| **Print Report Card** | Generates and prints a formatted, print-only report card with summary table |
| **Persistent Storage** | All subjects saved in `localStorage` — data survives page refreshes |
| **Demo Data** | Loads 6 sample subjects on first launch |
| **Toast Notifications** | Animated feedback for every action |
| **Accessibility** | ARIA labels, live regions, keyboard navigation (Escape to close modal) |

---

## 🗂️ Project Structure

```
10-grade-calculator/
├── index.html   # App layout — header, GPA banner, distribution panel, subjects list, modal, print template
├── style.css    # Dark theme with glassmorphism, grid layout, animations, print styles
└── app.js       # All logic — grading conversions, canvas ring, CRUD, search/sort, print, localStorage
```

---

## 🚀 Getting Started

No build step or dependencies required.

1. **Open `index.html`** in any modern browser, or serve it with a local dev server:
   ```bash
   # Using VS Code Live Server, or:
   npx serve .
   ```
2. Demo subjects load automatically so you can explore right away.
3. Click **+ Add Subject** to enter your own grades.

---

## 🧑‍💻 How It Works

### State & Storage
- Subjects are stored in the `subjects` array in memory.
- On every change the array is saved to `localStorage` under the key `gradeiq_subjects`.
- On load, data is restored from `localStorage` (falls back to demo data if empty).

### Adding a Subject
1. Click **+ Add Subject**.
2. Enter the **subject name**.
3. Choose input mode:
   - **Marks** — enter marks obtained and total marks (e.g. 85 / 100).
   - **Letter Grade** — click a grade pill (A+, A, A−, B+, … F).
4. Optionally enter **credits/weight** and a **semester label**.
5. Submit — the subject card appears instantly, and all stats recalculate.

### Grading Conversions
All conversions are done in pure JavaScript with no external libraries:

| Function | Description |
|---|---|
| `pctToLetter(pct)` | Maps a percentage to a letter grade (A+ → F) |
| `pctToGPA4(pct)` | Maps a percentage to a 4.0 GPA point |
| `pctToGPA10(pct)` | Maps a percentage to a 10.0 GPA point |
| `LETTER_TO_PCT` | Look-up table for converting letter grades back to a percentage midpoint |

### GPA Ring Chart
- Drawn with the **Canvas 2D API** — no charting library.
- Animates with `requestAnimationFrame` using a cubic ease-out function.
- Ring colour reflects the grade bucket (green for A, blue for B, amber for C, etc.).

### Credit-Weighted GPA
- Appears automatically when at least one subject has credits entered.
- Calculated as: `Σ(GPA_4.0 × credits) / Σ(credits)`.

### Print Report Card
- A hidden `<div class="print-report">` is populated with current data before `window.print()` is called.
- Print styles hide the main app and show only the report card.

---

## 🎨 Tech Stack

- **HTML5** — semantic markup, ARIA roles, hidden print template
- **CSS3** — custom properties, glassmorphism, CSS Grid, keyframe animations, `@media print`
- **Vanilla JavaScript (ES6+)** — no frameworks, no libraries
- **Canvas 2D API** — animated GPA ring chart
- **Web Storage API** — `localStorage` persistence
- **Google Fonts** — Inter (300–900) + Space Grotesk (400–700)

---

## 📸 UI Overview

```
┌───────────────────────────────────────────────────────────────┐
│ 🎓 GradeIQ  [Percentage ▾]  [+ Add Subject]  [🖨️]  [🗑️]    │
├───────────────────────────────────────────────────────────────┤
│  ◉ GPA Ring   │  Avg%  │  Grade  │  Subjects  │  High │ Low  │
│               │────────────────────────────────────────────   │
│               │            Performance Badge                  │
├──────────────────────────────┬────────────────────────────────┤
│  Grade Distribution          │  Subjects                      │
│  A ████████████ 3 subjects   │  🔍 Search…   Sort: Default ▾  │
│  B ████ 1 subject            │  ─────────────────────────     │
│  C ██ 1 subject              │  🥇 Computer Science  96%  A   │
│  D ██ 1 subject              │  🥈 English           92%  A   │
│  F  0 subjects               │  🥉 Mathematics       88%  B+  │
│                              │  …                             │
│  Credit Summary              │                                │
│  Total Credits: 19           │                                │
│  Weighted GPA:  3.30 / 4.0   │                                │
└──────────────────────────────┴────────────────────────────────┘
```

---

## 🔧 Customisation

- **Grade thresholds** — edit `pctToLetter()`, `pctToGPA4()`, `pctToGPA10()` in `app.js`.
- **Letter → percentage mapping** — edit the `LETTER_TO_PCT` object in `app.js`.
- **Performance badges** — edit the `PERFORMANCE` array in `app.js`.
- **Grade colours** — edit the `GRADE_COLOR` map in `app.js`.
- **Demo subjects** — edit the `seedDemo()` function in `app.js`.

---

## 📦 No Dependencies

Everything runs in the browser. No npm, no bundler, no external JS libraries.
