# 🎙️ Text-to-Speech App

A premium text-to-speech app that uses the browser's built-in Web Speech API — no external service or API key needed — with voice selection, speed/pitch/volume controls, and an animated audio visualizer.

**Author:** [IMxMaYur](https://github.com/IMxMaYur)  
**Part of:** [DevShelf JavaScript Mini Projects](https://github.com/IMxMaYur/DevShelf/blob/main/projects/beginner/javascript-mini-projects.md)

---

## ✨ Features

- 🎙️ **Text-to-speech** using the browser's **Web Speech API** — completely offline capable
- 🗣️ **Multi-voice selector** — lists all installed voices on your system (sorted by English first)
- ⚡ **Speed (Rate) slider** — 0.5× slow to 2.0× fast
- 🎵 **Pitch slider** — from deep (0) to high (2)
- 🔊 **Volume slider** — 0% to 100%
- ▶️ **Play** · ⏸️ **Pause/Resume** · ⏹️ **Stop** playback controls
- 📊 **Animated audio visualizer** — 9 bars bounce randomly while speech is playing
- 📝 **Character counter** (0 / 5000 limit)
- 🧩 **Preset buttons** — 3 pre-filled text samples to test voices quickly
- 💬 **Status message** — shows Ready / Speaking / Paused / Finished / Error
- 🌊 **Animated wave background** with 3 layered CSS waves

---

## 🗂️ Files

```
08-text-to-speech/
├── index.html   ← Textarea, voice controls, visualizer, playback buttons
├── style.css    ← Wave background, animated visualizer bars, slider styles
└── script.js    ← SpeechSynthesisUtterance, voice loading, visualizer
```

---

## 🚀 How to Run

No installation or internet required:

```
Double-click index.html
```

> ⚠️ The Web Speech API requires a modern browser (Chrome, Edge, or Firefox). Safari has partial support. The voice list may take a short moment to load — this is normal browser behaviour.

---

## 🛠️ Built With

| Technology | Purpose |
|-----------|---------|
| HTML5 | `<textarea>`, `<select>`, `<input type="range">` |
| CSS3 | Wave animations, visualizer bar animation, slider custom thumb |
| Vanilla JavaScript | `SpeechSynthesisUtterance`, `speechSynthesis` API, `setInterval` visualizer |

---

## 🎛️ Controls Reference

| Control | Range | Default |
|---------|-------|---------|
| Speed | 0.5× – 2.0× | 1.0× |
| Pitch | 0 – 2 | 1.0 |
| Volume | 0% – 100% | 100% |
| Max text | — | 5000 characters |

---

## 💡 Concepts Practiced

- `window.speechSynthesis` and `SpeechSynthesisUtterance`
- `speechSynthesis.onvoiceschanged` event (voices load asynchronously)
- Playback lifecycle events: `onstart`, `onend`, `onpause`, `onresume`, `onerror`
- `setInterval` for the visualizer animation (random bar heights)
- CSS `::webkit-slider-thumb` for custom range input styling
- Disabling/enabling buttons based on speech state

---

## 📄 License

MIT — free to use, modify, and share.
