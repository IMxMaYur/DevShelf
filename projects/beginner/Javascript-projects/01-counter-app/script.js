/* ── Counter App – script.js ── */

const counterEl   = document.getElementById('counter-value');
const labelEl     = document.getElementById('counter-label');
const historyList = document.getElementById('history-list');
const stepInput   = document.getElementById('step-input');
const progressArc = document.getElementById('progress-arc');
const ringPct     = document.getElementById('ring-pct');

let count   = 0;
const MAX   = 100;
const CIRCUMFERENCE = 2 * Math.PI * 52; // r=52

// ── SVG gradient inject ─────────────────────────────
const svgEl = document.querySelector('.progress-ring');
const defs  = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
defs.innerHTML = `
  <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="#7c5cfc"/>
    <stop offset="100%" stop-color="#fc5c7d"/>
  </linearGradient>`;
svgEl.prepend(defs);

// ── Helpers ─────────────────────────────────────────
function getStep() {
  const s = parseInt(stepInput.value) || 1;
  return Math.max(1, Math.min(100, s));
}

function updateDisplay() {
  counterEl.textContent = count;
  // Color hint
  if (count > 0) {
    counterEl.style.background = 'linear-gradient(135deg, #4ade80, #22d3ee)';
  } else if (count < 0) {
    counterEl.style.background = 'linear-gradient(135deg, #f87171, #fb923c)';
  } else {
    counterEl.style.background = 'linear-gradient(135deg, #7c5cfc, #fc5c7d)';
  }
  counterEl.style.webkitBackgroundClip = 'text';
  counterEl.style.webkitTextFillColor  = 'transparent';

  // Progress ring (maps ±MAX to 0–100%)
  const pct = Math.min(Math.abs(count) / MAX, 1);
  const offset = CIRCUMFERENCE * (1 - pct);
  progressArc.style.strokeDashoffset = offset;
  ringPct.textContent = Math.round(pct * 100) + '%';
  progressArc.style.stroke = count >= 0
    ? 'url(#ringGradient)'
    : '#f87171';
}

function bump() {
  counterEl.classList.remove('bump');
  void counterEl.offsetWidth;
  counterEl.classList.add('bump');
}

function addHistory(action, value) {
  const li = document.createElement('li');
  li.className = 'history-item';
  li.innerHTML = `<span class="history-action">${action}</span><span class="history-val">${value}</span>`;
  historyList.prepend(li);
  // Keep max 20 items
  while (historyList.children.length > 20) {
    historyList.removeChild(historyList.lastChild);
  }
}

// ── Controls ─────────────────────────────────────────
document.getElementById('btn-increment').addEventListener('click', () => {
  const step = getStep();
  count += step;
  bump();
  updateDisplay();
  addHistory(`+${step}`, count);
});

document.getElementById('btn-decrement').addEventListener('click', () => {
  const step = getStep();
  count -= step;
  bump();
  updateDisplay();
  addHistory(`−${step}`, count);
});

document.getElementById('btn-reset').addEventListener('click', () => {
  if (count === 0) return;
  addHistory('reset', 0);
  count = 0;
  bump();
  updateDisplay();
});

// Keyboard support
document.addEventListener('keydown', (e) => {
  if (e.target === stepInput) return;
  if (e.key === 'ArrowUp' || e.key === '+') {
    document.getElementById('btn-increment').click();
  } else if (e.key === 'ArrowDown' || e.key === '-') {
    document.getElementById('btn-decrement').click();
  } else if (e.key === 'r' || e.key === 'R') {
    document.getElementById('btn-reset').click();
  }
});

// Init
updateDisplay();
