/* ── To-Do List – script.js ── */

const taskInput       = document.getElementById('task-input');
const prioritySelect  = document.getElementById('priority-select');
const addBtn          = document.getElementById('add-btn');
const taskList        = document.getElementById('task-list');
const emptyState      = document.getElementById('empty-state');
const tasksDone       = document.getElementById('tasks-done');
const tasksTotal      = document.getElementById('tasks-total');
const progressBar     = document.getElementById('progress-bar');
const remainingCount  = document.getElementById('remaining-count');
const clearCompleted  = document.getElementById('clear-completed');
const dateDisplay     = document.getElementById('date-display');
const filterBtns      = document.querySelectorAll('.filter-btn');

let tasks = JSON.parse(localStorage.getItem('todo_tasks') || '[]');
let currentFilter = 'all';

// ── Date ──────────────────────────────────────────────
const dateOpts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
dateDisplay.textContent = new Date().toLocaleDateString(undefined, dateOpts);

// ── Save & Render ─────────────────────────────────────
function save() { localStorage.setItem('todo_tasks', JSON.stringify(tasks)); }

function getFilteredTasks() {
  if (currentFilter === 'active')    return tasks.filter(t => !t.completed);
  if (currentFilter === 'completed') return tasks.filter(t => t.completed);
  return tasks;
}

function renderTasks() {
  taskList.innerHTML = '';
  const filtered = getFilteredTasks();
  filtered.forEach(task => taskList.appendChild(createTaskEl(task)));

  // Stats
  const total = tasks.length;
  const done  = tasks.filter(t => t.completed).length;
  tasksDone.textContent  = done;
  tasksTotal.textContent = total;
  progressBar.style.width = total ? `${(done / total) * 100}%` : '0%';
  const rem = total - done;
  remainingCount.textContent = `${rem} task${rem !== 1 ? 's' : ''} remaining`;

  // Empty state
  if (filtered.length === 0) emptyState.classList.add('visible');
  else emptyState.classList.remove('visible');
}

function createTaskEl(task) {
  const li = document.createElement('li');
  li.className = `task-item${task.completed ? ' completed' : ''}`;
  li.dataset.id = task.id;

  // Checkbox
  const check = document.createElement('div');
  check.className = `task-checkbox${task.completed ? ' checked' : ''}`;
  check.setAttribute('role', 'checkbox');
  check.setAttribute('aria-checked', task.completed);
  check.addEventListener('click', () => toggleTask(task.id));

  // Priority dot
  const dot = document.createElement('span');
  dot.className = `priority-dot ${task.priority}`;

  // Text wrap
  const textWrap = document.createElement('div');
  textWrap.className = 'task-text-wrap';
  const text = document.createElement('div');
  text.className = 'task-text';
  text.textContent = task.text;
  const meta = document.createElement('div');
  meta.className = 'task-meta';
  meta.textContent = `${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} priority · ${task.date}`;
  textWrap.append(text, meta);

  // Delete btn
  const delBtn = document.createElement('button');
  delBtn.className = 'delete-btn';
  delBtn.setAttribute('aria-label', 'Delete task');
  delBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`;
  delBtn.addEventListener('click', () => deleteTask(task.id));

  li.append(check, dot, textWrap, delBtn);
  return li;
}

// ── Actions ────────────────────────────────────────────
function addTask() {
  const text = taskInput.value.trim();
  if (!text) {
    taskInput.style.borderColor = '#f87171';
    setTimeout(() => taskInput.style.borderColor = '', 800);
    return;
  }
  const task = {
    id:        Date.now(),
    text,
    priority:  prioritySelect.value,
    completed: false,
    date:      new Date().toLocaleDateString(),
  };
  tasks.unshift(task);
  save(); renderTasks();
  taskInput.value = '';
  taskInput.focus();
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) { task.completed = !task.completed; save(); renderTasks(); }
}

function deleteTask(id) {
  const el = taskList.querySelector(`[data-id="${id}"]`);
  if (el) {
    el.classList.add('removing');
    el.addEventListener('animationend', () => {
      tasks = tasks.filter(t => t.id !== id);
      save(); renderTasks();
    });
  }
}

// ── Event Listeners ────────────────────────────────────
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

clearCompleted.addEventListener('click', () => {
  tasks = tasks.filter(t => !t.completed);
  save(); renderTasks();
});

// ── Init ───────────────────────────────────────────────
renderTasks();
