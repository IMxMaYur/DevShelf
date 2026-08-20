/* ── Text-to-Speech – script.js ── */

const textInput    = document.getElementById('text-input');
const charCount    = document.getElementById('char-count');
const voiceSelect  = document.getElementById('voice-select');
const rateSlider   = document.getElementById('rate-slider');
const pitchSlider  = document.getElementById('pitch-slider');
const volumeSlider = document.getElementById('volume-slider');
const rateVal      = document.getElementById('rate-val');
const pitchVal     = document.getElementById('pitch-val');
const volumeVal    = document.getElementById('volume-val');
const btnPlay      = document.getElementById('btn-play');
const btnStop      = document.getElementById('btn-stop');
const btnPause     = document.getElementById('btn-pause');
const statusMsg    = document.getElementById('status-msg');
const visBars      = document.querySelectorAll('.vis-bar');
const presetBtns   = document.querySelectorAll('.preset-btn');

const synth = window.speechSynthesis;
let voices  = [];
let visInterval = null;

// ── Voice loading ─────────────────────────────────────
function loadVoices() {
  voices = synth.getVoices();
  voiceSelect.innerHTML = '';
  if (voices.length === 0) {
    const opt = document.createElement('option');
    opt.textContent = 'Default Voice';
    voiceSelect.appendChild(opt);
    return;
  }
  // Prefer English voices first
  const sorted = [...voices].sort((a, b) => {
    const aEn = a.lang.startsWith('en') ? 0 : 1;
    const bEn = b.lang.startsWith('en') ? 0 : 1;
    return aEn - bEn;
  });
  sorted.forEach((v, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `${v.name} (${v.lang})`;
    voiceSelect.appendChild(opt);
  });
}

if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = loadVoices;
loadVoices();
setTimeout(loadVoices, 500); // Fallback for some browsers

// ── Char counter ──────────────────────────────────────
textInput.addEventListener('input', () => {
  charCount.textContent = textInput.value.length;
});

// ── Slider labels ─────────────────────────────────────
rateSlider.addEventListener('input', () => { rateVal.textContent = parseFloat(rateSlider.value).toFixed(1) + '×'; });
pitchSlider.addEventListener('input', () => { pitchVal.textContent = parseFloat(pitchSlider.value).toFixed(1); });
volumeSlider.addEventListener('input', () => { volumeVal.textContent = Math.round(parseFloat(volumeSlider.value) * 100) + '%'; });

// ── Visualizer ────────────────────────────────────────
function startVisualizer() {
  visBars.forEach(b => b.classList.add('active'));
  visInterval = setInterval(() => {
    visBars.forEach(bar => {
      const h = Math.random() * 44 + 6;
      bar.style.height = h + 'px';
    });
  }, 100);
}

function stopVisualizer() {
  clearInterval(visInterval);
  visBars.forEach(bar => { bar.style.height = '8px'; bar.classList.remove('active'); });
}

// ── Button states ─────────────────────────────────────
function setPlaying(playing, paused = false) {
  btnPlay.disabled  = playing;
  btnStop.disabled  = !playing && !paused;
  btnPause.disabled = !playing;
}

function setStatus(msg, speaking = false) {
  statusMsg.textContent = msg;
  statusMsg.className   = 'status-msg' + (speaking ? ' speaking' : '');
}

// ── Speech ────────────────────────────────────────────
function speak() {
  const text = textInput.value.trim();
  if (!text) { setStatus('Please enter some text first.'); return; }

  synth.cancel();
  const utter     = new SpeechSynthesisUtterance(text);
  utter.rate       = parseFloat(rateSlider.value);
  utter.pitch      = parseFloat(pitchSlider.value);
  utter.volume     = parseFloat(volumeSlider.value);

  // Assign selected voice
  const selectedIdx = parseInt(voiceSelect.value);
  if (!isNaN(selectedIdx) && voices[selectedIdx]) utter.voice = voices[selectedIdx];

  utter.onstart = () => { setPlaying(true); setStatus('Speaking…', true); startVisualizer(); };
  utter.onend   = () => { setPlaying(false); setStatus('Finished ✓'); stopVisualizer(); };
  utter.onerror = (e) => { setPlaying(false); setStatus(`Error: ${e.error}`); stopVisualizer(); };
  utter.onpause = () => { setPlaying(false, true); setStatus('Paused'); stopVisualizer(); };
  utter.onresume= () => { setPlaying(true); setStatus('Speaking…', true); startVisualizer(); };

  synth.speak(utter);
}

btnPlay.addEventListener('click', speak);

btnStop.addEventListener('click', () => {
  synth.cancel();
  setPlaying(false); setStatus('Stopped'); stopVisualizer();
});

btnPause.addEventListener('click', () => {
  if (synth.speaking && !synth.paused) {
    synth.pause();
  } else if (synth.paused) {
    synth.resume();
    setPlaying(true); setStatus('Speaking…', true); startVisualizer();
  }
});

// ── Presets ───────────────────────────────────────────
presetBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    textInput.value = btn.dataset.text;
    charCount.textContent = btn.dataset.text.length;
  });
});

// ── Init ─────────────────────────────────────────────
if (!('speechSynthesis' in window)) {
  setStatus('❌ Speech synthesis not supported in this browser.');
  btnPlay.disabled = true;
} else {
  setStatus('Ready to speak');
}
setPlaying(false);
