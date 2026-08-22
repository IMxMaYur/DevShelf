/* =========================================================
   FinTrack — app.js
   ========================================================= */

'use strict';

// ── Constants ────────────────────────────────────────────
const STORAGE_KEY = 'fintrack_transactions';

const CATEGORIES = {
  income: [
    { id: 'salary',     label: 'Salary',      icon: '💼' },
    { id: 'freelance',  label: 'Freelance',   icon: '💻' },
    { id: 'investment', label: 'Investment',  icon: '📊' },
    { id: 'gift',       label: 'Gift',        icon: '🎁' },
    { id: 'other',      label: 'Other',       icon: '💰' },
  ],
  expense: [
    { id: 'food',          label: 'Food & Dining',  icon: '🍔' },
    { id: 'transport',     label: 'Transport',      icon: '🚗' },
    { id: 'housing',       label: 'Housing',        icon: '🏠' },
    { id: 'health',        label: 'Health',         icon: '❤️'  },
    { id: 'entertainment', label: 'Entertainment',  icon: '🎮' },
    { id: 'shopping',      label: 'Shopping',       icon: '🛍️' },
    { id: 'education',     label: 'Education',      icon: '📚' },
    { id: 'utilities',     label: 'Utilities',      icon: '⚡' },
    { id: 'other',         label: 'Other',          icon: '💸' },
  ],
};

const CATEGORY_COLORS = {
  food:          '#f97316',
  transport:     '#3b82f6',
  housing:       '#a78bfa',
  health:        '#ec4899',
  entertainment: '#10b981',
  shopping:      '#f59e0b',
  education:     '#06b6d4',
  utilities:     '#6366f1',
  salary:        '#22d3a0',
  freelance:     '#84cc16',
  investment:    '#eab308',
  gift:          '#f472b6',
  other:         '#94a3b8',
};

// ── State ─────────────────────────────────────────────────
let transactions = [];
let currentType  = 'income';   // 'income' | 'expense'
let filterType   = 'all';
let filterCat    = 'all';

// ── DOM References ────────────────────────────────────────
const $ = id => document.getElementById(id);

const els = {
  balance:          $('balance'),
  totalIncome:      $('total-income'),
  totalExpenses:    $('total-expenses'),
  incomeCount:      $('income-count'),
  expenseCount:     $('expense-count'),
  balanceIndicator: $('balance-indicator'),
  savingsBar:       $('savings-bar'),
  savingsRatePct:   $('savings-rate-pct'),
  chartCenterAmt:   $('chart-center-amount'),
  chartLegend:      $('chart-legend'),
  txList:           $('transactions-list'),
  emptyState:       $('empty-state'),
  filterType:       $('filter-type'),
  filterCategory:   $('filter-category'),
  modalOverlay:     $('modal-overlay'),
  form:             $('transaction-form'),
  txDesc:           $('tx-description'),
  txAmount:         $('tx-amount'),
  txDate:           $('tx-date'),
  txCategory:       $('tx-category'),
  txNote:           $('tx-note'),
  toastContainer:   $('toast-container'),
  currentDate:      $('current-date'),
  typeIncome:       $('type-income'),
  typeExpense:      $('type-expense'),
};

// ── Storage ────────────────────────────────────────────────
function loadTransactions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { return []; }
}
function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

// ── Utilities ─────────────────────────────────────────────
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 2
  }).format(amount);
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getCategoryInfo(type, categoryId) {
  const list = CATEGORIES[type] || [];
  return list.find(c => c.id === categoryId) || { label: categoryId, icon: '💸' };
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

// ── Date Display ──────────────────────────────────────────
function setDateDisplay() {
  const now = new Date();
  els.currentDate.textContent = now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

// ── Summary Calculations ──────────────────────────────────
function recalcSummary() {
  const incomeList  = transactions.filter(t => t.type === 'income');
  const expenseList = transactions.filter(t => t.type === 'expense');

  const totalIncome  = incomeList.reduce((s, t) => s + t.amount, 0);
  const totalExpense = expenseList.reduce((s, t) => s + t.amount, 0);
  const balance      = totalIncome - totalExpense;

  // Animate number update
  animateNumber(els.balance,       balance,      true);
  animateNumber(els.totalIncome,   totalIncome,  false);
  animateNumber(els.totalExpenses, totalExpense, false);

  els.incomeCount.textContent  = `${incomeList.length} transaction${incomeList.length !== 1 ? 's' : ''}`;
  els.expenseCount.textContent = `${expenseList.length} transaction${expenseList.length !== 1 ? 's' : ''}`;

  // Balance indicator
  if (balance > 0) {
    els.balanceIndicator.textContent = 'Positive ✦';
    els.balanceIndicator.style.background = 'rgba(34,211,160,0.12)';
    els.balanceIndicator.style.color = '#22d3a0';
  } else if (balance < 0) {
    els.balanceIndicator.textContent = 'Negative ✦';
    els.balanceIndicator.style.background = 'rgba(245,91,126,0.12)';
    els.balanceIndicator.style.color = '#f55b7e';
  } else {
    els.balanceIndicator.textContent = 'Neutral ✦';
    els.balanceIndicator.style.background = 'rgba(167,139,250,0.12)';
    els.balanceIndicator.style.color = '#a78bfa';
  }

  // Savings rate
  const rate = totalIncome > 0 ? Math.max(0, Math.min(100, ((totalIncome - totalExpense) / totalIncome) * 100)) : 0;
  els.savingsRatePct.textContent = `${Math.round(rate)}%`;
  els.savingsBar.style.width     = `${rate}%`;

  // Chart
  updateChart(expenseList, totalExpense);
}

function animateNumber(el, target, showSign) {
  const start    = parseFloat(el.dataset.current || 0);
  const duration = 600;
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const ease     = 1 - Math.pow(1 - progress, 3);
    const current  = start + (target - start) * ease;
    el.textContent = (showSign && target < 0 ? '-' : '') + formatCurrency(Math.abs(current));
    if (progress < 1) requestAnimationFrame(step);
    else {
      el.dataset.current = target;
      el.textContent = (showSign && target < 0 ? '-' : '') + formatCurrency(Math.abs(target));
    }
  }
  requestAnimationFrame(step);
}

// ── Donut Chart (Canvas) ──────────────────────────────────
let chartAnimFrame = null;
function updateChart(expenseList, totalExpense) {
  const canvas = document.getElementById('expense-chart');
  const ctx    = canvas.getContext('2d');
  const size   = 260;
  const cx     = size / 2;
  const cy     = size / 2;
  const outerR = 110;
  const innerR = 70;

  // Group by category
  const catMap = {};
  expenseList.forEach(t => {
    catMap[t.category] = (catMap[t.category] || 0) + t.amount;
  });
  const entries = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

  // Center label
  els.chartCenterAmt.textContent = totalExpense > 0 ? formatCurrency(totalExpense) : '$0';

  // Legend
  if (entries.length === 0) {
    els.chartLegend.innerHTML = '<p class="no-data-text">No expense data yet</p>';
  } else {
    els.chartLegend.innerHTML = entries.slice(0, 6).map(([cat, val]) => {
      const catInfo = getCategoryInfo('expense', cat);
      const color   = CATEGORY_COLORS[cat] || '#94a3b8';
      const pct     = totalExpense > 0 ? ((val / totalExpense) * 100).toFixed(1) : 0;
      return `
        <div class="legend-item">
          <div class="legend-dot-label">
            <span class="legend-dot" style="background:${color}"></span>
            <span class="legend-name">${catInfo.label}</span>
          </div>
          <span class="legend-value">${formatCurrency(val)} <small style="color:var(--text-muted)">(${pct}%)</small></span>
        </div>`;
    }).join('');
  }

  // Animate draw
  let animProgress = 0;
  const totalSlices = entries.reduce((s, [, v]) => s + v, 0);
  if (chartAnimFrame) cancelAnimationFrame(chartAnimFrame);

  function drawFrame() {
    animProgress = Math.min(animProgress + 0.04, 1);
    ctx.clearRect(0, 0, size, size);

    if (entries.length === 0 || totalExpense === 0) {
      // Empty ring
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fill('evenodd');
    } else {
      let startAngle = -Math.PI / 2;
      entries.forEach(([cat, val]) => {
        const slice      = (val / totalSlices) * Math.PI * 2 * animProgress;
        const color      = CATEGORY_COLORS[cat] || '#94a3b8';
        const endAngle   = startAngle + slice;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, outerR, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();

        startAngle = endAngle;
      });

      // Cut out inner circle (donut hole)
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Glow ring
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    if (animProgress < 1) {
      chartAnimFrame = requestAnimationFrame(drawFrame);
    }
  }
  drawFrame();
}

// ── Render Transactions ───────────────────────────────────
function renderTransactions() {
  const filtered = transactions.filter(t => {
    const typeMatch = filterType === 'all' || t.type === filterType;
    const catMatch  = filterCat === 'all'  || t.category === filterCat;
    return typeMatch && catMatch;
  });

  // Sort newest first
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date) || b.createdAt - a.createdAt);

  // Remove old tx items (keep empty state if it's there)
  const existing = els.txList.querySelectorAll('.tx-item');
  existing.forEach(el => el.remove());

  if (filtered.length === 0) {
    els.emptyState.style.display = 'flex';
  } else {
    els.emptyState.style.display = 'none';
    filtered.forEach((t, i) => {
      const catInfo = getCategoryInfo(t.type, t.category);
      const item = document.createElement('div');
      item.className = `tx-item ${t.type}-item`;
      item.dataset.id = t.id;
      item.style.animationDelay = `${i * 0.04}s`;

      item.innerHTML = `
        <div class="tx-icon ${t.type}-icon">${catInfo.icon}</div>
        <div class="tx-info">
          <div class="tx-desc" title="${escapeHtml(t.description)}">${escapeHtml(t.description)}</div>
          <div class="tx-meta">
            <span class="tx-category">${catInfo.label}</span>
            <span class="tx-date">${formatDate(t.date)}</span>
            ${t.note ? `<span class="tx-date" title="${escapeHtml(t.note)}">• ${escapeHtml(t.note.slice(0, 25))}${t.note.length > 25 ? '…' : ''}</span>` : ''}
          </div>
        </div>
        <div class="tx-right">
          <span class="tx-amount ${t.type}">${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}</span>
          <button class="tx-delete-btn" data-id="${t.id}" aria-label="Delete transaction" title="Delete">✕</button>
        </div>`;

      els.txList.appendChild(item);
    });
  }

  // Update filter category options
  updateCategoryFilter();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function updateCategoryFilter() {
  const existing = new Set(transactions.map(t => t.category));
  const allCategories = [...CATEGORIES.income, ...CATEGORIES.expense];
  const relevantCats = allCategories.filter(c => existing.has(c.id));

  const currentVal = els.filterCategory.value;
  els.filterCategory.innerHTML = '<option value="all">All Categories</option>';
  relevantCats.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.icon} ${c.label}`;
    els.filterCategory.appendChild(opt);
  });
  // Restore selection if still valid
  if ([...els.filterCategory.options].some(o => o.value === currentVal)) {
    els.filterCategory.value = currentVal;
  }
}

// ── Modal ─────────────────────────────────────────────────
function openModal() {
  // Set today's date as default
  els.txDate.value = todayISO();
  // Populate category options
  populateCategorySelect(currentType);
  els.modalOverlay.classList.add('open');
  setTimeout(() => els.txDesc.focus(), 100);
}

function closeModal() {
  els.modalOverlay.classList.remove('open');
  resetForm();
}

function resetForm() {
  els.form.reset();
  clearErrors();
  els.txDate.value = todayISO();
  populateCategorySelect(currentType);
}

function clearErrors() {
  els.form.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error'));
}

function populateCategorySelect(type) {
  const cats = CATEGORIES[type] || [];
  els.txCategory.innerHTML = cats.map(c =>
    `<option value="${c.id}">${c.icon} ${c.label}</option>`
  ).join('');
}

function setActiveType(type) {
  currentType = type;
  els.typeIncome.classList.toggle('active',  type === 'income');
  els.typeExpense.classList.toggle('active', type === 'expense');
  populateCategorySelect(type);
  clearErrors();
}

// ── Form Validation & Submission ──────────────────────────
function validateForm() {
  let valid = true;
  clearErrors();

  const desc   = els.txDesc.value.trim();
  const amount = parseFloat(els.txAmount.value);
  const date   = els.txDate.value;

  if (!desc) {
    els.txDesc.closest('.form-group').classList.add('has-error');
    valid = false;
  }
  if (!amount || amount <= 0 || isNaN(amount)) {
    els.txAmount.closest('.form-group').classList.add('has-error');
    valid = false;
  }
  if (!date) {
    els.txDate.closest('.form-group').classList.add('has-error');
    valid = false;
  }
  return valid;
}

function handleFormSubmit(e) {
  e.preventDefault();
  if (!validateForm()) return;

  const tx = {
    id:          generateId(),
    type:        currentType,
    description: els.txDesc.value.trim(),
    amount:      parseFloat(parseFloat(els.txAmount.value).toFixed(2)),
    date:        els.txDate.value,
    category:    els.txCategory.value,
    note:        els.txNote.value.trim(),
    createdAt:   Date.now(),
  };

  transactions.unshift(tx);
  saveTransactions();
  recalcSummary();
  renderTransactions();
  closeModal();
  showToast(`Transaction added successfully!`, 'success', '✅');
}

// ── Delete Transaction ────────────────────────────────────
function deleteTransaction(id) {
  const idx = transactions.findIndex(t => t.id === id);
  if (idx === -1) return;

  // Animate out
  const el = els.txList.querySelector(`[data-id="${id}"]`);
  if (el) {
    el.style.transition = 'all 0.3s ease';
    el.style.opacity = '0';
    el.style.transform = 'translateX(40px)';
    setTimeout(() => {
      transactions.splice(idx, 1);
      saveTransactions();
      recalcSummary();
      renderTransactions();
    }, 300);
  } else {
    transactions.splice(idx, 1);
    saveTransactions();
    recalcSummary();
    renderTransactions();
  }
  showToast('Transaction deleted.', 'info', '🗑️');
}

function clearAllTransactions() {
  if (transactions.length === 0) return;
  if (!confirm('Are you sure you want to delete ALL transactions? This cannot be undone.')) return;
  transactions = [];
  saveTransactions();
  recalcSummary();
  renderTransactions();
  showToast('All transactions cleared.', 'info', '🧹');
}

// ── Toast Notifications ───────────────────────────────────
function showToast(message, type = 'info', icon = 'ℹ️') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
  els.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hide');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, 3000);
}

// ── Event Listeners ───────────────────────────────────────
function bindEvents() {
  // Open modal
  $('open-modal-btn').addEventListener('click', openModal);
  $('add-first-btn').addEventListener('click', openModal);

  // Close modal
  $('close-modal-btn').addEventListener('click', closeModal);
  $('cancel-btn').addEventListener('click', closeModal);
  els.modalOverlay.addEventListener('click', e => {
    if (e.target === els.modalOverlay) closeModal();
  });

  // ESC key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && els.modalOverlay.classList.contains('open')) closeModal();
  });

  // Type toggle
  els.typeIncome.addEventListener('click',  () => setActiveType('income'));
  els.typeExpense.addEventListener('click', () => setActiveType('expense'));

  // Form submit
  els.form.addEventListener('submit', handleFormSubmit);

  // Filters
  els.filterType.addEventListener('change', e => {
    filterType = e.target.value;
    renderTransactions();
  });
  els.filterCategory.addEventListener('change', e => {
    filterCat = e.target.value;
    renderTransactions();
  });

  // Clear all
  $('clear-all-btn').addEventListener('click', clearAllTransactions);

  // Delete transaction (event delegation)
  els.txList.addEventListener('click', e => {
    const btn = e.target.closest('.tx-delete-btn');
    if (btn) deleteTransaction(btn.dataset.id);
  });
}

// ── Init ──────────────────────────────────────────────────
function init() {
  setDateDisplay();
  transactions = loadTransactions();
  setActiveType('income');
  recalcSummary();
  renderTransactions();
  bindEvents();

  // Seed demo data if empty
  if (transactions.length === 0) {
    seedDemoData();
  }
}

function seedDemoData() {
  const now  = new Date();
  const month = now.toISOString().slice(0, 7);

  const demo = [
    { type: 'income',  description: 'Monthly Salary',      amount: 4500, category: 'salary',        note: 'August paycheck',   date: `${month}-01` },
    { type: 'income',  description: 'Freelance Project',   amount: 850,  category: 'freelance',     note: 'Logo design',       date: `${month}-05` },
    { type: 'expense', description: 'Rent',                amount: 1200, category: 'housing',       note: '',                  date: `${month}-02` },
    { type: 'expense', description: 'Grocery Shopping',    amount: 185,  category: 'food',          note: 'Weekly groceries',  date: `${month}-06` },
    { type: 'expense', description: 'Netflix & Spotify',   amount: 28,   category: 'entertainment', note: 'Monthly subs',      date: `${month}-03` },
    { type: 'expense', description: 'Electricity Bill',    amount: 95,   category: 'utilities',     note: '',                  date: `${month}-04` },
    { type: 'expense', description: 'Uber / Cab rides',    amount: 64,   category: 'transport',     note: 'Commute this week', date: `${month}-07` },
    { type: 'expense', description: 'Coffee & Lunch',      amount: 72,   category: 'food',          note: '',                  date: `${month}-08` },
    { type: 'expense', description: 'Online Course',       amount: 49,   category: 'education',     note: 'React course',      date: `${month}-09` },
    { type: 'expense', description: 'Gym Membership',      amount: 40,   category: 'health',        note: '',                  date: `${month}-10` },
  ];

  transactions = demo.map((t, i) => ({
    ...t,
    id: generateId(),
    createdAt: Date.now() - (demo.length - i) * 1000,
  }));

  saveTransactions();
  recalcSummary();
  renderTransactions();
  showToast('Demo data loaded! Start tracking your finances 🎉', 'success', '✨');
}

// ── Start App ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
