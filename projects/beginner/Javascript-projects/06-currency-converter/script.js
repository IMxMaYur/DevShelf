/* ── Currency Converter – script.js ── */
/*
 * Uses the fawazahmed0/currency-api (CDN-hosted, free, no key needed)
 * Primary:  https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/{base}.json
 * Fallback: https://latest.currency-api.pages.dev/v1/currencies/{base}.json
 */

const fromCurrencyEl = document.getElementById('from-currency');
const toCurrencyEl   = document.getElementById('to-currency');
const fromAmountEl   = document.getElementById('from-amount');
const toAmountEl     = document.getElementById('to-amount');
const convertBtn     = document.getElementById('convert-btn');
const swapBtn        = document.getElementById('swap-btn');
const rateDisplay    = document.getElementById('rate-display');
const rateText       = document.getElementById('rate-text');
const rateBar        = document.getElementById('rate-bar');
const loadingEl      = document.getElementById('loading');
const errorEl        = document.getElementById('error-msg');
const popularGrid    = document.getElementById('popular-grid');
const lastUpdatedEl  = document.getElementById('last-updated');
const flagFrom       = document.getElementById('flag-from');
const flagTo         = document.getElementById('flag-to');

// Major currencies with flag emojis
const CURRENCIES = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵', CAD: '🇨🇦',
  AUD: '🇦🇺', CHF: '🇨🇭', CNY: '🇨🇳', INR: '🇮🇳', MXN: '🇲🇽',
  BRL: '🇧🇷', KRW: '🇰🇷', SGD: '🇸🇬', NOK: '🇳🇴', SEK: '🇸🇪',
  DKK: '🇩🇰', NZD: '🇳🇿', HKD: '🇭🇰', TRY: '🇹🇷', ZAR: '🇿🇦',
  AED: '🇦🇪', SAR: '🇸🇦', THB: '🇹🇭', MYR: '🇲🇾', IDR: '🇮🇩',
  PHP: '🇵🇭', PLN: '🇵🇱', CZK: '🇨🇿', HUF: '🇭🇺', PKR: '🇵🇰',
};

const POPULAR_PAIRS = [
  { from: 'USD', to: 'EUR' }, { from: 'USD', to: 'GBP' },
  { from: 'USD', to: 'JPY' }, { from: 'USD', to: 'INR' },
  { from: 'EUR', to: 'GBP' }, { from: 'USD', to: 'CAD' },
];

// Cache to avoid repeated API calls for same base
const rateCache = {};

// ── Populate selects ──────────────────────────────────
function populateSelects() {
  Object.keys(CURRENCIES).forEach(code => {
    [fromCurrencyEl, toCurrencyEl].forEach(sel => {
      const opt = document.createElement('option');
      opt.value = code;
      opt.textContent = `${CURRENCIES[code]} ${code}`;
      sel.appendChild(opt);
    });
  });
  fromCurrencyEl.value = 'USD';
  toCurrencyEl.value   = 'INR';
}

function updateFlags() {
  flagFrom.textContent = CURRENCIES[fromCurrencyEl.value] || '💱';
  flagTo.textContent   = CURRENCIES[toCurrencyEl.value]   || '💱';
}

// ── Fetch rates (with fallback) ───────────────────────
async function fetchRates(base) {
  const key = base.toLowerCase();

  // Return from cache if available
  if (rateCache[key]) return rateCache[key];

  const primaryURL  = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${key}.json`;
  const fallbackURL = `https://latest.currency-api.pages.dev/v1/currencies/${key}.json`;

  let data;
  try {
    const res = await fetch(primaryURL, { signal: AbortSignal.timeout(7000) });
    if (!res.ok) throw new Error('primary failed');
    data = await res.json();
  } catch {
    // Try fallback URL
    try {
      const res = await fetch(fallbackURL, { signal: AbortSignal.timeout(7000) });
      if (!res.ok) throw new Error(`Fallback also failed: ${res.status}`);
      data = await res.json();
    } catch (err) {
      throw new Error('Could not fetch exchange rates. Check your internet connection.');
    }
  }

  // data structure: { date: "2024-...", [base_lower]: { eur: 0.92, ... } }
  const rates = data[key];
  if (!rates) throw new Error('Unexpected API response format.');

  rateCache[key] = { rates, date: data.date };
  return rateCache[key];
}

// ── Convert ───────────────────────────────────────────
async function convert() {
  const from   = fromCurrencyEl.value;
  const to     = toCurrencyEl.value;
  const amount = parseFloat(fromAmountEl.value);

  if (isNaN(amount) || amount <= 0) {
    showError('Please enter a valid amount greater than 0.'); return;
  }
  if (from === to) {
    toAmountEl.textContent = amount.toLocaleString(undefined, { maximumFractionDigits: 2 });
    rateText.textContent   = `1 ${from} = 1.000000 ${to}`;
    rateDisplay.classList.remove('hidden');
    rateBar.style.width = '100%';
    clearError();
    return;
  }

  clearError(); showLoading(true); rateDisplay.classList.add('hidden');

  try {
    const { rates, date } = await fetchRates(from);

    const toKey = to.toLowerCase();
    const rate  = rates[toKey];

    if (rate == null) {
      throw new Error(`Rate for ${from}→${to} not available.`);
    }

    const result = amount * rate;
    toAmountEl.textContent = result.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: result < 1 ? 6 : 2,
    });

    rateText.textContent = `1 ${from} = ${rate.toFixed(6)} ${to}`;
    rateDisplay.classList.remove('hidden');
    const barPct = Math.min((Math.log(rate + 1) / Math.log(2000)) * 100, 100);
    rateBar.style.width = barPct + '%';

    lastUpdatedEl.textContent = date ? `Rates as of ${date}` : '';
    loadPopularRates(rates, from);
  } catch (e) {
    showError(e.message || 'Could not fetch rates. Please try again.');
  } finally {
    showLoading(false);
  }
}

// ── Popular pairs ─────────────────────────────────────
async function loadPopularRates(cachedRates, cachedBase) {
  popularGrid.innerHTML = '';

  for (const pair of POPULAR_PAIRS) {
    const card = document.createElement('div');
    card.className = 'popular-card';

    try {
      let rate;
      if (pair.from === cachedBase && cachedRates) {
        rate = cachedRates[pair.to.toLowerCase()];
      } else {
        const { rates } = await fetchRates(pair.from);
        rate = rates[pair.to.toLowerCase()];
      }

      card.innerHTML = `
        <div class="popular-pair">${CURRENCIES[pair.from] || ''} ${pair.from} → ${CURRENCIES[pair.to] || ''} ${pair.to}</div>
        <div class="popular-rate">1 ${pair.from} = ${rate != null ? Number(rate).toFixed(4) : '—'} ${pair.to}</div>`;
    } catch {
      card.innerHTML = `
        <div class="popular-pair">${CURRENCIES[pair.from] || ''} ${pair.from} → ${CURRENCIES[pair.to] || ''} ${pair.to}</div>
        <div class="popular-rate">Rate unavailable</div>`;
    }

    card.addEventListener('click', () => {
      fromCurrencyEl.value = pair.from;
      toCurrencyEl.value   = pair.to;
      updateFlags();
      convert();
    });
    popularGrid.appendChild(card);
  }
}

// ── Helpers ───────────────────────────────────────────
function showLoading(v) { loadingEl.classList.toggle('hidden', !v); }
function showError(msg) { errorEl.textContent = '⚠️ ' + msg; errorEl.classList.remove('hidden'); }
function clearError()   { errorEl.classList.add('hidden'); }

// ── Events ────────────────────────────────────────────
convertBtn.addEventListener('click', convert);
fromAmountEl.addEventListener('keydown', e => { if (e.key === 'Enter') convert(); });
fromCurrencyEl.addEventListener('change', updateFlags);
toCurrencyEl.addEventListener('change', updateFlags);

swapBtn.addEventListener('click', () => {
  [fromCurrencyEl.value, toCurrencyEl.value] = [toCurrencyEl.value, fromCurrencyEl.value];
  updateFlags();
  convert();
});

// ── Init ─────────────────────────────────────────────
populateSelects();
updateFlags();
convert();
