# 💰 FinTrack — Expense Tracker

A beautiful, fully client-side personal finance dashboard built with **HTML, CSS, and Vanilla JavaScript**. Track your income and expenses, visualise spending by category with an animated donut chart, and monitor your savings rate — all without a backend.

---

## ✨ Features

| Feature | Details |
|---|---|
| **Summary Cards** | Live-updating balance, total income, and total expense cards with animated number counters |
| **Donut Chart** | Animated canvas-drawn donut chart showing expense breakdown by category |
| **Savings Rate Bar** | Visual progress bar showing what percentage of income is saved |
| **Transaction Management** | Add, filter, and delete income/expense entries |
| **Categories** | 5 income categories (Salary, Freelance, Investment, Gift, Other) and 9 expense categories (Food, Transport, Housing, Health, Entertainment, Shopping, Education, Utilities, Other) |
| **Filtering** | Filter transactions by type (income/expense) and category |
| **Persistent Storage** | All data saved to `localStorage` — survives page refreshes |
| **Demo Data** | Auto-seeds realistic demo transactions on first launch |
| **Toast Notifications** | Animated success/info alerts for every user action |
| **Responsive Design** | Works on desktop and mobile |
| **Accessibility** | ARIA labels, live regions, and keyboard navigation (Escape to close modal) |

---

## 🗂️ Project Structure

```
09-expense-tracker/
├── index.html   # App layout — header, summary cards, chart panel, transaction list, modal
├── style.css    # Dark glassmorphism theme, animations, responsive grid
└── app.js       # All logic — state, CRUD, canvas chart, localStorage, events
```

---

## 🚀 Getting Started

No build step or dependencies required.

1. **Open `index.html`** directly in any modern browser, or serve it with a local dev server:
   ```bash
   # Using VS Code Live Server, or:
   npx serve .
   ```
2. The app loads with **demo data** on first launch so you can explore immediately.
3. Click **+ Add Transaction** to log your own income or expense.

---

## 🧑‍💻 How It Works

### State & Storage
- All transactions are held in the `transactions` array in memory.
- On every change the array is serialised and written to `localStorage` under the key `fintrack_transactions`.
- On page load, data is read back from `localStorage` (with a fallback to demo data).

### Adding a Transaction
1. Click **+ Add Transaction** (header button or empty-state button).
2. Choose **Income** or **Expense** via the toggle.
3. Fill in description, amount, date, category, and an optional note.
4. Submit — the transaction is prepended to the list and all summary cards update instantly.

### Donut Chart
- Built with the **Canvas 2D API** — no charting library needed.
- Expenses are grouped by category, and each slice is drawn with an easing animation (`requestAnimationFrame`).
- The legend shows up to 6 categories with their amounts and percentages.

### Filtering
- Use the **All / Income / Expense** dropdown and the **Category** dropdown above the transaction list to narrow results.
- Filters apply instantly without touching the stored data.

### Deleting
- Click **✕** on any transaction row. The row animates out before the data is removed.
- **🗑 Clear All** deletes every transaction after a confirmation prompt.

---

## 🎨 Tech Stack

- **HTML5** — semantic markup, ARIA roles
- **CSS3** — custom properties, glassmorphism, CSS Grid & Flexbox, keyframe animations
- **Vanilla JavaScript (ES6+)** — no frameworks, no libraries
- **Canvas 2D API** — donut chart rendering
- **Web Storage API** — `localStorage` persistence
- **Google Fonts** — Inter (300–800)

---

## 📸 UI Overview

```
┌─────────────────────────────────────────────────────┐
│  💰 FinTrack          [Today's Date]  + Add Tx      │
├──────────────┬───────────────┬──────────────────────┤
│ Balance      │ Total Income  │ Total Expenses        │
├──────────────┴───────────────┴──────────────────────┤
│  [Donut Chart + Legend]  │  [Transaction List]       │
│  Savings Rate Bar        │  Filter: All | Category   │
└──────────────────────────┴──────────────────────────┘
```

---

## 🔧 Customisation

- **Add/remove categories** — edit the `CATEGORIES` object in `app.js`.
- **Change category colours** — edit the `CATEGORY_COLORS` map in `app.js`.
- **Change currency** — update the `Intl.NumberFormat` locale and `currency` option in `formatCurrency()`.
- **Adjust demo data** — edit the `seedDemoData()` function in `app.js`.

---

## 📦 No Dependencies

Everything runs in the browser. No npm, no bundler, no external JS libraries.
