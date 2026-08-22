/* =========================================================
   GradeIQ — app.js
   ========================================================= */
'use strict';

// ── Constants ──────────────────────────────────────────────
const STORAGE_KEY = 'gradeiq_subjects';

/** Letter → percentage midpoint mapping */
const LETTER_TO_PCT = {
  'A+': 97, 'A': 93, 'A-': 90,
  'B+': 87, 'B': 83, 'B-': 80,
  'C+': 77, 'C': 73, 'C-': 70,
  'D' : 65,
  'F' : 45,
};

/** Percentage → letter grade */
function pctToLetter(pct) {
  if (pct >= 97) return 'A+';
  if (pct >= 93) return 'A';
  if (pct >= 90) return 'A-';
  if (pct >= 87) return 'B+';
  if (pct >= 83) return 'B';
  if (pct >= 80) return 'B-';
  if (pct >= 77) return 'C+';
  if (pct >= 73) return 'C';
  if (pct >= 70) return 'C-';
  if (pct >= 60) return 'D';
  return 'F';
}

/** Percentage → GPA 4.0 */
function pctToGPA4(pct) {
  if (pct >= 93) return 4.0;
  if (pct >= 90) return 3.7;
  if (pct >= 87) return 3.3;
  if (pct >= 83) return 3.0;
  if (pct >= 80) return 2.7;
  if (pct >= 77) return 2.3;
  if (pct >= 73) return 2.0;
  if (pct >= 70) return 1.7;
  if (pct >= 67) return 1.3;
  if (pct >= 60) return 1.0;
  return 0.0;
}

/** Percentage → GPA 10.0 */
function pctToGPA10(pct) {
  if (pct >= 90) return 10.0;
  if (pct >= 80) return 9.0;
  if (pct >= 70) return 8.0;
  if (pct >= 60) return 7.0;
  if (pct >= 50) return 6.0;
  if (pct >= 40) return 5.0;
  return 0.0;
}

/** Letter simplified bucket (for CSS/distribution) */
function gradeBucket(pct) {
  if (pct >= 90) return 'a';
  if (pct >= 80) return 'b';
  if (pct >= 70) return 'c';
  if (pct >= 60) return 'd';
  return 'f';
}

const GRADE_COLOR = { a: '#22d3a0', b: '#3b82f6', c: '#f59e0b', d: '#f97316', f: '#f55b7e' };

/** Performance tier based on average */
const PERFORMANCE = [
  { min: 95, emoji: '🏆', text: 'Outstanding!' },
  { min: 90, emoji: '⭐', text: 'Excellent!' },
  { min: 80, emoji: '🎯', text: 'Great Work!' },
  { min: 70, emoji: '📚', text: 'Good Job!' },
  { min: 60, emoji: '💪', text: 'Keep Going!' },
  { min:  0, emoji: '📖', text: 'Needs Effort' },
];

// ── State ──────────────────────────────────────────────────
let subjects      = [];
let inputMode     = 'marks';   // 'marks' | 'letter'
let selectedLetter = '';
let gradingSystem  = 'percentage';
let searchQuery    = '';
let sortMode       = 'default';

// ── DOM Refs ───────────────────────────────────────────────
const $ = id => document.getElementById(id);
const els = {
  modalOverlay:   $('modal-overlay'),
  form:           $('subject-form'),
  subjName:       $('subj-name'),
  subjObtained:   $('subj-obtained'),
  subjTotal:      $('subj-total'),
  subjLetter:     $('subj-letter'),
  subjCredits:    $('subj-credits'),
  subjSemester:   $('subj-semester'),
  marksSection:   $('marks-section'),
  letterSection:  $('letter-section'),
  gradePills:     $('grade-pills'),
  modeMarks:      $('mode-marks'),
  modeLetter:     $('mode-letter'),
  subjList:       $('subjects-list'),
  emptyState:     $('empty-state'),
  gpaDisplay:     $('gpa-display'),
  gpaLabelText:   $('gpa-label-text'),
  statAvg:        $('stat-avg'),
  statGrade:      $('stat-grade'),
  statSubjects:   $('stat-subjects'),
  statHighest:    $('stat-highest'),
  statLowest:     $('stat-lowest'),
  badgeEmoji:     $('badge-emoji'),
  badgeText:      $('badge-text'),
  distBars:       $('dist-bars'),
  toastContainer: $('toast-container'),
  gradingSystem:  $('grading-system'),
  searchInput:    $('search-input'),
  sortSelect:     $('sort-select'),
  creditsBox:     $('credits-box'),
  totalCreditsVal:$('total-credits-val'),
  weightedGpaVal: $('weighted-gpa-val'),
};

// ── Storage ────────────────────────────────────────────────
function loadSubjects()  { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } }
function saveSubjects()  { localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects)); }

// ── Utilities ──────────────────────────────────────────────
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

function fmt(n, decimals = 1) { return Number(n).toFixed(decimals); }

function getSubjectPct(s) {
  if (s.inputMode === 'letter') return LETTER_TO_PCT[s.letter] ?? 0;
  return s.total > 0 ? Math.min(100, (s.obtained / s.total) * 100) : 0;
}

function computeGPADisplay(avgPct) {
  if (gradingSystem === 'gpa4')  return fmt(pctToGPA4(avgPct), 2);
  if (gradingSystem === 'gpa10') return fmt(pctToGPA10(avgPct), 1);
  return fmt(avgPct, 1) + '%';
}

function gpaLabel() {
  if (gradingSystem === 'gpa4')  return 'GPA (4.0)';
  if (gradingSystem === 'gpa10') return 'GPA (10.0)';
  return 'Average';
}

// ── Recalculate & Render Summary ───────────────────────────
function recalc() {
  const n = subjects.length;
  els.statSubjects.textContent = n;

  if (n === 0) {
    // Reset everything
    els.gpaDisplay.textContent   = '—';
    els.gpaLabelText.textContent = gpaLabel();
    els.statAvg.textContent      = '—';
    els.statGrade.textContent    = '—';
    els.statHighest.textContent  = '—';
    els.statLowest.textContent   = '—';
    els.badgeEmoji.textContent   = '🏆';
    els.badgeText.textContent    = 'Add subjects to begin';
    els.creditsBox.style.display = 'none';
    drawGPARing(0, 0);
    renderDistBars([]);
    return;
  }

  const pcts = subjects.map(getSubjectPct);
  const avg  = pcts.reduce((a, b) => a + b, 0) / n;

  // Weighted GPA (only if any credits entered)
  const hasCredits = subjects.some(s => s.credits > 0);
  let weightedGPA = null;
  let totalCredits = 0;
  if (hasCredits) {
    let weightedSum = 0;
    subjects.forEach((s, i) => {
      const cr = s.credits || 1;
      totalCredits += cr;
      weightedSum += pctToGPA4(pcts[i]) * cr;
    });
    weightedGPA = weightedSum / totalCredits;
  }

  const letter  = pctToLetter(avg);
  const bucket  = gradeBucket(avg);
  const perf    = PERFORMANCE.find(p => avg >= p.min) || PERFORMANCE[PERFORMANCE.length - 1];

  const highest = Math.max(...pcts);
  const lowest  = Math.min(...pcts);

  // Update banner
  els.gpaDisplay.textContent   = computeGPADisplay(avg);
  els.gpaLabelText.textContent = gpaLabel();
  els.statAvg.textContent      = fmt(avg) + '%';
  els.statGrade.textContent    = letter;
  els.statHighest.textContent  = fmt(highest) + '%';
  els.statLowest.textContent   = fmt(lowest) + '%';
  els.badgeEmoji.textContent   = perf.emoji;
  els.badgeText.textContent    = perf.text;

  // Credits box
  if (hasCredits) {
    els.creditsBox.style.display = 'block';
    els.totalCreditsVal.textContent = fmt(totalCredits, 0);
    els.weightedGpaVal.textContent = fmt(weightedGPA, 2) + ' / 4.0';
  } else {
    els.creditsBox.style.display = 'none';
  }

  // Ring chart
  drawGPARing(avg, bucket);

  // Distribution bars
  renderDistBars(pcts);
}

// ── GPA Ring Canvas ─────────────────────────────────────────
let ringAnimFrame = null;
function drawGPARing(avgPct, bucket) {
  const canvas = $('gpa-ring-canvas');
  const ctx    = canvas.getContext('2d');
  const cx = 80, cy = 80, r = 62, lineW = 14;
  const color  = GRADE_COLOR[bucket] || '#555e82';

  let progress = 0;
  if (ringAnimFrame) cancelAnimationFrame(ringAnimFrame);

  function frame() {
    progress = Math.min(progress + 0.025, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const angle = (avgPct / 100) * Math.PI * 2 * ease;

    ctx.clearRect(0, 0, 160, 160);

    // Track
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth   = lineW;
    ctx.stroke();

    // Progress arc
    if (avgPct > 0) {
      const grad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
      grad.addColorStop(0, color);
      grad.addColorStop(1, color + 'aa');
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + angle);
      ctx.strokeStyle = grad;
      ctx.lineWidth   = lineW;
      ctx.lineCap     = 'round';
      ctx.stroke();

      // Glow
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + angle);
      ctx.strokeStyle = color + '33';
      ctx.lineWidth   = lineW + 6;
      ctx.lineCap     = 'round';
      ctx.stroke();
    }

    if (progress < 1) ringAnimFrame = requestAnimationFrame(frame);
  }
  frame();
}

// ── Distribution Bars ───────────────────────────────────────
function renderDistBars(pcts) {
  const buckets = { a: 0, b: 0, c: 0, d: 0, f: 0 };
  pcts.forEach(p => { const b = gradeBucket(p); buckets[b]++; });
  const total = pcts.length || 1;

  const labels = { a: 'A (90–100)', b: 'B (80–89)', c: 'C (70–79)', d: 'D (60–69)', f: 'F (<60)' };

  els.distBars.innerHTML = Object.entries(buckets).map(([key, cnt]) => {
    const pct = Math.round((cnt / total) * 100);
    return `
      <div class="dist-bar-row">
        <div class="dist-bar-label">
          <span>${labels[key]}</span>
          <strong>${cnt} subject${cnt !== 1 ? 's' : ''}</strong>
        </div>
        <div class="dist-bar-track">
          <div class="dist-bar-fill"
               style="width:${pct}%; background:${GRADE_COLOR[key]}"
               role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
          </div>
        </div>
      </div>`;
  }).join('');
}

// ── Render Subjects List ────────────────────────────────────
function renderSubjects() {
  // Filter
  let list = subjects.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort
  if (sortMode === 'name')    list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  if (sortMode === 'highest') list = [...list].sort((a, b) => getSubjectPct(b) - getSubjectPct(a));
  if (sortMode === 'lowest')  list = [...list].sort((a, b) => getSubjectPct(a) - getSubjectPct(b));

  // Clear old items
  els.subjList.querySelectorAll('.subj-item').forEach(el => el.remove());

  if (list.length === 0) {
    els.emptyState.style.display = 'flex';
  } else {
    els.emptyState.style.display = 'none';

    // Build ranked list (by pct) for rank badges
    const sorted = [...subjects].sort((a, b) => getSubjectPct(b) - getSubjectPct(a));
    const rankMap = {};
    sorted.forEach((s, i) => { rankMap[s.id] = i + 1; });

    list.forEach((s, visIdx) => {
      const pct    = getSubjectPct(s);
      const letter = s.inputMode === 'letter' ? s.letter : pctToLetter(pct);
      const bucket = gradeBucket(pct);
      const rank   = rankMap[s.id];

      const item = document.createElement('div');
      item.className = `subj-item grade-${bucket}`;
      item.dataset.id = s.id;
      item.style.animationDelay = `${visIdx * 0.05}s`;

      const rankClass = rank <= 3 ? `rank-${rank}` : '';
      const rankIcon  = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

      const marksText = s.inputMode === 'marks'
        ? `${fmt(s.obtained, 1)} / ${fmt(s.total, 0)}`
        : `Letter grade`;

      const creditsTag = s.credits > 0 ? `<span class="subj-tag">${s.credits} cr</span>` : '';
      const semTag     = s.semester   ? `<span class="subj-tag">${escHtml(s.semester)}</span>` : '';

      item.innerHTML = `
        <div class="subj-rank ${rankClass}">${rankIcon}</div>
        <div class="subj-info">
          <div class="subj-name">${escHtml(s.name)}</div>
          <div class="subj-meta">
            ${creditsTag}${semTag}
          </div>
          <div class="subj-progress-wrap">
            <div class="subj-progress-track">
              <div class="subj-progress-fill"
                style="width:${pct}%; background:${GRADE_COLOR[bucket]}"
                role="progressbar" aria-valuenow="${Math.round(pct)}" aria-valuemin="0" aria-valuemax="100">
              </div>
            </div>
            <span class="subj-progress-pct">${fmt(pct)}%</span>
          </div>
        </div>
        <div class="subj-right">
          <span class="subj-grade-badge grade-${bucket}-color">${letter}</span>
          <span class="subj-marks">${marksText}</span>
          <button class="subj-delete-btn" data-id="${s.id}" aria-label="Remove ${escHtml(s.name)}">✕ remove</button>
        </div>`;

      els.subjList.appendChild(item);
    });
  }
}

function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Modal ───────────────────────────────────────────────────
function openModal() {
  els.modalOverlay.classList.add('open');
  resetForm();
  setTimeout(() => els.subjName.focus(), 80);
}
function closeModal() {
  els.modalOverlay.classList.remove('open');
  resetForm();
}
function resetForm() {
  els.form.reset();
  clearErrors();
  selectedLetter = '';
  els.subjLetter.value = '';
  els.gradePills.querySelectorAll('.grade-pill').forEach(p => p.classList.remove('selected'));
  setInputMode('marks');
}
function clearErrors() {
  els.form.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error'));
}

function setInputMode(mode) {
  inputMode = mode;
  els.modeMarks.classList.toggle('active',  mode === 'marks');
  els.modeLetter.classList.toggle('active', mode === 'letter');
  els.marksSection.style.display  = mode === 'marks'  ? 'block' : 'none';
  els.letterSection.style.display = mode === 'letter' ? 'block' : 'none';
  clearErrors();
}

// ── Validation & Submit ────────────────────────────────────
function validate() {
  let ok = true;
  clearErrors();

  if (!els.subjName.value.trim()) {
    els.subjName.closest('.form-group').classList.add('has-error');
    ok = false;
  }
  if (inputMode === 'marks') {
    const obt = parseFloat(els.subjObtained.value);
    const tot = parseFloat(els.subjTotal.value);
    if (isNaN(obt) || obt < 0) {
      els.subjObtained.closest('.form-group').classList.add('has-error');
      ok = false;
    }
    if (isNaN(tot) || tot <= 0) {
      els.subjTotal.closest('.form-group').classList.add('has-error');
      ok = false;
    }
    if (ok && obt > tot) {
      els.subjObtained.closest('.form-group').classList.add('has-error');
      $('obtained-error').textContent = 'Marks cannot exceed total.';
      ok = false;
    }
  } else {
    if (!selectedLetter) {
      els.gradePills.closest('.form-group').classList.add('has-error');
      ok = false;
    }
  }
  return ok;
}

function handleSubmit(e) {
  e.preventDefault();
  if (!validate()) return;

  const subject = {
    id:        uid(),
    name:      els.subjName.value.trim(),
    inputMode,
    obtained:  inputMode === 'marks' ? parseFloat(els.subjObtained.value) : 0,
    total:     inputMode === 'marks' ? parseFloat(els.subjTotal.value)    : 100,
    letter:    inputMode === 'letter' ? selectedLetter : '',
    credits:   parseFloat(els.subjCredits.value) || 0,
    semester:  els.subjSemester.value.trim(),
    addedAt:   Date.now(),
  };

  subjects.push(subject);
  saveSubjects();
  recalc();
  renderSubjects();
  closeModal();
  showToast(`"${subject.name}" added!`, 'success', '✅');
}

// ── Delete ──────────────────────────────────────────────────
function deleteSubject(id) {
  const el = els.subjList.querySelector(`[data-id="${id}"]`);
  if (el) {
    el.style.transition = 'all 0.3s ease';
    el.style.opacity = '0';
    el.style.transform = 'translateX(40px)';
    setTimeout(() => {
      subjects = subjects.filter(s => s.id !== id);
      saveSubjects();
      recalc();
      renderSubjects();
    }, 300);
  }
  showToast('Subject removed.', 'info', '🗑️');
}

function clearAll() {
  if (!subjects.length) return;
  if (!confirm('Delete ALL subjects? This cannot be undone.')) return;
  subjects = [];
  saveSubjects();
  recalc();
  renderSubjects();
  showToast('All subjects cleared.', 'info', '🧹');
}

// ── Print Report ────────────────────────────────────────────
function printReport() {
  if (!subjects.length) { showToast('Add subjects first!', 'error', '⚠️'); return; }

  const pcts = subjects.map(getSubjectPct);
  const avg  = pcts.reduce((a, b) => a + b, 0) / subjects.length;

  $('report-date').textContent = new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  $('report-summary').innerHTML = `
    <div><strong>Total Subjects:</strong> ${subjects.length}</div>
    <div><strong>Average:</strong> ${fmt(avg)}%</div>
    <div><strong>Letter Grade:</strong> ${pctToLetter(avg)}</div>
    <div><strong>GPA (4.0):</strong> ${fmt(pctToGPA4(avg), 2)}</div>`;

  $('report-tbody').innerHTML = subjects.map((s, i) => {
    const pct = getSubjectPct(s);
    const letter = s.inputMode === 'letter' ? s.letter : pctToLetter(pct);
    return `<tr>
      <td>${i + 1}</td>
      <td>${escHtml(s.name)}</td>
      <td>${s.inputMode === 'marks' ? `${fmt(s.obtained,1)} / ${fmt(s.total,0)}` : '—'}</td>
      <td>${fmt(pct)}%</td>
      <td>${letter}</td>
      <td>${s.credits || '—'}</td>
    </tr>`;
  }).join('');

  window.print();
}

// ── Toast ───────────────────────────────────────────────────
function showToast(msg, type = 'info', icon = 'ℹ️') {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
  els.toastContainer.appendChild(t);
  setTimeout(() => {
    t.classList.add('hide');
    t.addEventListener('animationend', () => t.remove(), { once: true });
  }, 3000);
}

// ── Demo Data ───────────────────────────────────────────────
function seedDemo() {
  const demo = [
    { name: 'Mathematics',      inputMode:'marks',  obtained:88,  total:100, credits:4, semester:'Sem 1' },
    { name: 'Physics',          inputMode:'marks',  obtained:74,  total:100, credits:3, semester:'Sem 1' },
    { name: 'English',          inputMode:'marks',  obtained:92,  total:100, credits:3, semester:'Sem 1' },
    { name: 'Computer Science', inputMode:'marks',  obtained:96,  total:100, credits:4, semester:'Sem 1' },
    { name: 'Chemistry',        inputMode:'marks',  obtained:67,  total:100, credits:3, semester:'Sem 1' },
    { name: 'History',          inputMode:'letter', letter:'B+',  credits:2, semester:'Sem 1' },
  ];
  subjects = demo.map(d => ({ ...d, id: uid(), letter: d.letter || '', addedAt: Date.now() }));
  saveSubjects();
  recalc();
  renderSubjects();
  showToast('Demo data loaded! 🎓', 'success', '✨');
}

// ── Event Bindings ──────────────────────────────────────────
function bindEvents() {
  // Modal open/close
  $('open-modal-btn').addEventListener('click', openModal);
  $('add-first-btn').addEventListener('click', openModal);
  $('close-modal-btn').addEventListener('click', closeModal);
  $('cancel-btn').addEventListener('click', closeModal);
  els.modalOverlay.addEventListener('click', e => { if (e.target === els.modalOverlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && els.modalOverlay.classList.contains('open')) closeModal(); });

  // Input mode toggle
  $('mode-marks').addEventListener('click',  () => setInputMode('marks'));
  $('mode-letter').addEventListener('click', () => setInputMode('letter'));

  // Grade pills
  els.gradePills.addEventListener('click', e => {
    const pill = e.target.closest('.grade-pill');
    if (!pill) return;
    els.gradePills.querySelectorAll('.grade-pill').forEach(p => p.classList.remove('selected'));
    pill.classList.add('selected');
    selectedLetter = pill.dataset.grade;
    els.subjLetter.value = selectedLetter;
    // Clear error if set
    pill.closest('.form-group')?.classList.remove('has-error');
  });

  // Form submit
  els.form.addEventListener('submit', handleSubmit);

  // Delete subject (delegation)
  els.subjList.addEventListener('click', e => {
    const btn = e.target.closest('.subj-delete-btn');
    if (btn) deleteSubject(btn.dataset.id);
  });

  // Clear all
  $('clear-btn').addEventListener('click', clearAll);

  // Print
  $('print-btn').addEventListener('click', printReport);

  // Grading system
  els.gradingSystem.addEventListener('change', e => {
    gradingSystem = e.target.value;
    recalc();
  });

  // Search
  els.searchInput.addEventListener('input', e => {
    searchQuery = e.target.value;
    renderSubjects();
  });

  // Sort
  els.sortSelect.addEventListener('change', e => {
    sortMode = e.target.value;
    renderSubjects();
  });
}

// ── Init ────────────────────────────────────────────────────
function init() {
  subjects = loadSubjects();
  bindEvents();
  recalc();
  renderSubjects();
  if (subjects.length === 0) seedDemo();
}

document.addEventListener('DOMContentLoaded', init);
