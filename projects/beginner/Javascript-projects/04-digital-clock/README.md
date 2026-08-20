# 🕐 Digital Clock

A real-time digital clock with a **fully animated sky simulation** that changes dynamically based on the actual time of day — built with pure HTML, CSS & JavaScript.

**Author:** [IMxMaYur](https://github.com/IMxMaYur)  
**Part of:** [DevShelf JavaScript Mini Projects](https://github.com/IMxMaYur/DevShelf/blob/main/projects/beginner/javascript-mini-projects.md)

---

## ✨ Features

### 🌤️ Live Sky Simulation (the main attraction!)

The entire background is a real-time sky that changes every second based on your local time:

| Time | What you see |
|------|-------------|
| **12 AM – 5 AM** | Deep navy/black night sky, 200 twinkling stars, moon arcing across |
| **5:30 AM** | Violet pre-dawn sky, horizon starts glowing |
| **6 AM** | 🌅 Sunrise — orange/gold sky, sun rises from the left horizon |
| **6:30 – 7 AM** | Golden morning light, pink-peach clouds |
| **8 AM – 4 PM** | ☀️ Clear blue sky, sun travels its arc toward centre at noon |
| **5 PM** | 🌇 Golden hour — amber/warm sky |
| **5:30 – 6 PM** | Sunset — red/orange/purple sky, big horizon glow |
| **7 PM** | Dusk — magenta/purple fade, moon rises, stars appear |
| **8 PM +** | 🌙 Full night sky, moon arcs across like the sun did |

### ⏰ Clock Features
- **12h / 24h** toggle button
- **Blinking colons** between digits
- **Day progress bar** — how much of today is done
- **Year progress bar** — how much of the year has passed
- **Contextual greeting** — Good Morning / Afternoon / Evening / Night
- **Timezone label** showing your local timezone
- **Full date** display

---

## 🗂️ Files

```
04-digital-clock/
├── index.html   ← Clock UI + sky scene structure
├── style.css    ← Sky elements, clock card glassmorphism, animations
└── script.js    ← Sky simulation engine + clock logic
```

---

## 🚀 How to Run

No installation required:

```
Double-click index.html
```

The sky will immediately match your real local time when the page loads.

---

## 🛠️ Built With

| Technology | Purpose |
|-----------|---------|
| HTML5 | Sky scene layers (stars, sun, moon, clouds, ground) |
| CSS3 | Conic gradients (sun rays), cloud shapes, star twinkle, transitions |
| Vanilla JavaScript | 18-keyframe sky colour interpolation, sun/moon arc math, `setInterval` |

---

## ⚙️ How the Sky Works

- **Sky gradient** — 18 RGB colour keyframes (midnight → pre-dawn → sunrise → noon → sunset → night) are linearly interpolated every second and applied to `document.body.background`. A 4-second CSS `transition` smooths every change.
- **Sun arc** — A semicircle from left (6 AM) to right (6 PM), calculated with `cos/sin`. Position updates every second with `transition: left/top 3s linear`.
- **Moon arc** — Same semicircle but for the night hours (6 PM → 6 AM).
- **Stars** — 200 star `<div>`s with random sizes, positions, and `animation-delay` for a natural twinkle effect. Opacity controlled by time.
- **Horizon glow** — A CSS gradient overlay that appears at sunrise and sunset with warm orange/red colours.
- **Clouds** — 3 cloud shapes (CSS `border-radius` trick) drift at different speeds with colours that change from white → pink/orange at sunset → dark at night.

---

## 💡 Concepts Practiced

- Real-time updates with `setInterval`
- Linear interpolation of RGB colour values
- Trigonometry (`Math.sin`, `Math.cos`) for arc positioning
- CSS `repeating-conic-gradient` for sun rays
- CSS custom property transitions
- `Intl.DateTimeFormat` for timezone detection

---

## 📄 License

MIT — free to use, modify, and share.
