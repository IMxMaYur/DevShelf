/* ── Quote Generator – script.js ── */

const QUOTES = [
  // Wisdom
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "Wisdom" },
  { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein", category: "Wisdom" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", category: "Wisdom" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon", category: "Wisdom" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: "Wisdom" },
  { text: "The purpose of our lives is to be happy.", author: "Dalai Lama", category: "Wisdom" },
  // Motivation
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", category: "Motivation" },
  { text: "Act as if what you do makes a difference. It does.", author: "William James", category: "Motivation" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "Motivation" },
  { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis", category: "Motivation" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain", category: "Motivation" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", category: "Motivation" },
  // Philosophy
  { text: "To be, or not to be, that is the question.", author: "William Shakespeare", category: "Philosophy" },
  { text: "I think, therefore I am.", author: "René Descartes", category: "Philosophy" },
  { text: "The unexamined life is not worth living.", author: "Socrates", category: "Philosophy" },
  { text: "Happiness is not something ready made. It comes from your own actions.", author: "Dalai Lama", category: "Philosophy" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle", category: "Philosophy" },
  // Creativity
  { text: "Imagination is more important than knowledge.", author: "Albert Einstein", category: "Creativity" },
  { text: "Every artist was first an amateur.", author: "Ralph Waldo Emerson", category: "Creativity" },
  { text: "Creativity is intelligence having fun.", author: "Albert Einstein", category: "Creativity" },
  { text: "You can't use up creativity. The more you use, the more you have.", author: "Maya Angelou", category: "Creativity" },
  // Success
  { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau", category: "Success" },
  { text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller", category: "Success" },
  { text: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson", category: "Success" },
  { text: "The road to success and the road to failure are almost exactly the same.", author: "Colin R. Davis", category: "Success" },
];

const CATEGORIES = ['All', ...new Set(QUOTES.map(q => q.category))];

let currentCategory = 'All';
let currentQuote    = null;
let favorites       = JSON.parse(localStorage.getItem('quotes_favorites') || '[]');

// ── Elements ──────────────────────────────────────────
const quoteTextEl    = document.getElementById('quote-text');
const quoteAuthorEl  = document.getElementById('quote-author');
const categoryBadge  = document.getElementById('category-badge');
const quoteCard      = document.getElementById('quote-card');
const favBtn         = document.getElementById('btn-favorite');
const copyBtn        = document.getElementById('btn-copy');
const tweetBtn       = document.getElementById('btn-tweet');
const newBtn         = document.getElementById('btn-new');
const chipWrap       = document.getElementById('category-chips');
const favSection     = document.getElementById('favorites-section');
const favList        = document.getElementById('favorites-list');
const toast          = document.getElementById('toast');

// ── Category chips ────────────────────────────────────
CATEGORIES.forEach(cat => {
  const chip = document.createElement('button');
  chip.className = 'chip' + (cat === 'All' ? ' active' : '');
  chip.textContent = cat;
  chip.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    currentCategory = cat;
    showNewQuote();
  });
  chipWrap.appendChild(chip);
});

// ── Quote logic ───────────────────────────────────────
function getPool() {
  return currentCategory === 'All' ? QUOTES : QUOTES.filter(q => q.category === currentCategory);
}

function pickRandom(pool, exclude) {
  const filtered = pool.filter(q => q !== exclude);
  return filtered[Math.floor(Math.random() * filtered.length)] || pool[0];
}

function showQuote(quote) {
  currentQuote = quote;
  quoteTextEl.textContent   = quote.text;
  quoteAuthorEl.textContent = `— ${quote.author}`;
  categoryBadge.textContent = quote.category;
  // Update fav button state
  const isFav = favorites.some(f => f.text === quote.text);
  favBtn.classList.toggle('active', isFav);
}

function showNewQuote() {
  quoteCard.classList.add('fade-out');
  setTimeout(() => {
    quoteCard.classList.remove('fade-out');
    quoteCard.classList.add('fade-in');
    showQuote(pickRandom(getPool(), currentQuote));
    quoteCard.addEventListener('animationend', () => quoteCard.classList.remove('fade-in'), { once: true });
  }, 350);
}

// ── Favorites ─────────────────────────────────────────
function saveFavorites() { localStorage.setItem('quotes_favorites', JSON.stringify(favorites)); }

function renderFavorites() {
  favList.innerHTML = '';
  if (favorites.length === 0) { favSection.style.display = 'none'; return; }
  favSection.style.display = '';
  favorites.forEach((fav, i) => {
    const div = document.createElement('div');
    div.className = 'fav-item';
    div.innerHTML = `
      <div>
        <div class="fav-text">"${fav.text}"</div>
        <div class="fav-author">— ${fav.author}</div>
      </div>
      <button class="fav-del" aria-label="Remove favorite" data-i="${i}">✕</button>`;
    div.querySelector('.fav-del').addEventListener('click', () => {
      favorites.splice(i, 1); saveFavorites(); renderFavorites();
      if (currentQuote?.text === fav.text) favBtn.classList.remove('active');
    });
    favList.appendChild(div);
  });
}

// ── Toast ─────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 2000);
}

// ── Button events ─────────────────────────────────────
newBtn.addEventListener('click', showNewQuote);

favBtn.addEventListener('click', () => {
  if (!currentQuote) return;
  const idx = favorites.findIndex(f => f.text === currentQuote.text);
  if (idx >= 0) {
    favorites.splice(idx, 1);
    favBtn.classList.remove('active');
    showToast('Removed from favorites');
  } else {
    favorites.unshift({ text: currentQuote.text, author: currentQuote.author });
    favBtn.classList.add('active');
    showToast('Saved to favorites! ⭐');
  }
  saveFavorites(); renderFavorites();
});

copyBtn.addEventListener('click', () => {
  if (!currentQuote) return;
  navigator.clipboard.writeText(`"${currentQuote.text}" — ${currentQuote.author}`)
    .then(() => showToast('Copied to clipboard! 📋'))
    .catch(() => showToast('Copy failed'));
});

tweetBtn.addEventListener('click', () => {
  if (!currentQuote) return;
  const encoded = encodeURIComponent(`"${currentQuote.text}" — ${currentQuote.author}`);
  window.open(`https://twitter.com/intent/tweet?text=${encoded}`, '_blank');
});

// ── Init ─────────────────────────────────────────────
showQuote(pickRandom(QUOTES));
renderFavorites();
