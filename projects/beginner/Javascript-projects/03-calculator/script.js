/* ── Calculator – script.js ── */

const resultEl     = document.getElementById('result');
const expressionEl = document.getElementById('expression');
const keys         = document.querySelectorAll('.key');

let state = {
  current:   '0',
  previous:  null,
  operator:  null,
  waitNext:  false,
  expr:      '',
};

// ── Display ────────────────────────────────────────────
function updateDisplay(val, expr) {
  const s = String(val);
  resultEl.textContent = s;
  resultEl.className   = 'result' + (s.length > 10 ? ' small' : '');
  if (expr !== undefined) expressionEl.textContent = expr;
}

function shakeDisplay() {
  resultEl.classList.add('shake');
  resultEl.addEventListener('animationend', () => resultEl.classList.remove('shake'), { once: true });
}

// ── Logic ──────────────────────────────────────────────
function calculate(a, b, op) {
  const fa = parseFloat(a), fb = parseFloat(b);
  switch (op) {
    case '+': return fa + fb;
    case '−': return fa - fb;
    case '×': return fa * fb;
    case '÷': return fb === 0 ? null : fa / fb;
    default:  return fb;
  }
}

function formatResult(val) {
  if (val === null) return 'Error';
  const s = parseFloat(val.toPrecision(10));
  return String(s);
}

function handleAction(action, op, digit) {
  switch (action) {
    case 'digit': {
      if (state.waitNext) {
        state.current = digit === '0' ? '0' : digit;
        state.waitNext = false;
      } else {
        state.current = state.current === '0' ? digit : state.current + digit;
      }
      updateDisplay(state.current, state.expr);
      break;
    }
    case 'decimal': {
      if (state.waitNext) { state.current = '0.'; state.waitNext = false; }
      else if (!state.current.includes('.')) state.current += '.';
      updateDisplay(state.current, state.expr);
      break;
    }
    case 'operator': {
      // Chain ops
      if (state.operator && !state.waitNext) {
        const res = calculate(state.previous, state.current, state.operator);
        if (res === null) { shakeDisplay(); state = { current: '0', previous: null, operator: null, waitNext: false, expr: '' }; updateDisplay('Error', ''); return; }
        state.previous = formatResult(res);
        state.current  = state.previous;
        updateDisplay(state.current);
      } else {
        state.previous = state.current;
      }
      state.operator = op;
      state.expr     = `${state.previous} ${op}`;
      state.waitNext = true;
      // Highlight op button
      document.querySelectorAll('.key-op').forEach(k => k.classList.remove('active'));
      document.querySelector(`[data-op="${op}"]`)?.classList.add('active');
      updateDisplay(state.current, state.expr);
      break;
    }
    case 'equals': {
      if (!state.operator) return;
      const res = calculate(state.previous, state.current, state.operator);
      const expr = `${state.previous} ${state.operator} ${state.current} =`;
      if (res === null) { shakeDisplay(); updateDisplay('Error', expr); }
      else updateDisplay(formatResult(res), expr);
      state.current  = res === null ? '0' : formatResult(res);
      state.previous = null;
      state.operator = null;
      state.waitNext = true;
      state.expr     = expr;
      document.querySelectorAll('.key-op').forEach(k => k.classList.remove('active'));
      break;
    }
    case 'clear': {
      state = { current: '0', previous: null, operator: null, waitNext: false, expr: '' };
      document.querySelectorAll('.key-op').forEach(k => k.classList.remove('active'));
      updateDisplay('0', '');
      break;
    }
    case 'backspace': {
      if (state.waitNext) return; // can't backspace after an operator
      if (state.current.length > 1) {
        state.current = state.current.slice(0, -1);
      } else {
        state.current = '0';
      }
      updateDisplay(state.current, state.expr);
      break;
    }
    case 'sign': {
      state.current = String(parseFloat(state.current) * -1);
      updateDisplay(state.current);
      break;
    }
    case 'percent': {
      state.current = String(parseFloat(state.current) / 100);
      updateDisplay(state.current);
      break;
    }
  }
}

// ── Event Listeners ────────────────────────────────────
keys.forEach(key => {
  key.addEventListener('click', () => {
    handleAction(key.dataset.action, key.dataset.op, key.dataset.val);
  });
});

// Keyboard support
const keyMap = {
  '0':'0','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9',
  '.':'decimal',
  '+': { action:'operator', op:'+' },
  '-': { action:'operator', op:'−' },
  '*': { action:'operator', op:'×' },
  '/': { action:'operator', op:'÷' },
  'Enter': 'equals', '=': 'equals',
  'Backspace': '__backspace',
  'Escape': 'clear', 'c': 'clear', 'C': 'clear',
  '%': 'percent',
};

document.addEventListener('keydown', e => {
  const mapped = keyMap[e.key];
  if (!mapped) return;
  e.preventDefault();
  if (typeof mapped === 'object') {
    handleAction(mapped.action, mapped.op);
  } else if (mapped === '__backspace') {
    handleAction('backspace');
    return;
  } else if (/^\d$/.test(mapped)) {
    handleAction('digit', undefined, mapped);
  } else {
    handleAction(mapped);
  }
});

// Init
updateDisplay('0', '');
