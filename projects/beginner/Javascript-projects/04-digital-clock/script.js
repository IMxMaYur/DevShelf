/* ══════════════════════════════════════════════════════
   Digital Clock — script.js
   Live sky simulation:
     • Sky gradient changes smoothly with real time
     • Sun travels a semicircle arc  (6 am → 6 pm)
     • Moon travels the night arc    (6 pm → 6 am)
     • Stars fade in/out at dusk/dawn
     • Horizon glow at sunrise & sunset
     • Clouds change colour with sky phase
   ══════════════════════════════════════════════════════ */

'use strict';

let use24h = false;

// ──────────────────────────────────────────────────────
// SKY COLOUR KEY-FRAMES
// Each entry: { h: decimal-hour, top:[r,g,b], bot:[r,g,b] }
// Interpolated smoothly between adjacent frames every second.
// ──────────────────────────────────────────────────────
const SKY_FRAMES = [
  { h:  0.0, top: [ 2,  5, 18], bot: [ 3,  8, 22] }, // midnight
  { h:  4.0, top: [ 2,  6, 20], bot: [ 4, 10, 28] }, // deep night
  { h:  5.0, top: [ 9, 10, 58], bot: [18,  7, 50] }, // pre-dawn indigo
  { h:  5.5, top: [44, 18,105], bot: [105, 24, 70] }, // dawn violet
  { h:  6.0, top: [198, 54, 18], bot: [236,128, 30] }, // sunrise orange
  { h:  6.5, top: [225, 92, 26], bot: [242,186, 42] }, // early-morning gold
  { h:  7.5, top: [ 30,120,196], bot: [172,214,248] }, // morning sky blue
  { h:  9.0, top: [ 18, 98,202], bot: [ 88,168,244] }, // clear morning
  { h: 12.0, top: [  8, 68,168], bot: [ 56,142,238] }, // bright noon
  { h: 15.0, top: [ 12, 84,192], bot: [ 76,156,238] }, // afternoon
  { h: 16.5, top: [ 20,108,198], bot: [145,208,246] }, // late afternoon
  { h: 17.0, top: [216, 92, 16], bot: [242,164, 28] }, // golden hour
  { h: 17.5, top: [190, 34, 26], bot: [226, 66, 18] }, // pre-sunset red
  { h: 18.0, top: [112, 16,145], bot: [194, 48, 32] }, // sunset purple-orange
  { h: 18.5, top: [ 65, 10,130], bot: [132, 12,132] }, // dusk magenta
  { h: 19.0, top: [ 28, 30,130], bot: [ 65, 10,130] }, // early night
  { h: 20.0, top: [  4,  7, 28], bot: [  8, 14, 50] }, // night
  { h: 21.0, top: [  2,  5, 18], bot: [  3,  8, 22] }, // full night
  { h: 24.0, top: [  2,  5, 18], bot: [  3,  8, 22] }, // midnight (loop)
];

// ──────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────
const lerp   = (a, b, t) => a + (b - a) * t;
const clamp  = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerpRGB = (c1, c2, t) => [lerp(c1[0],c2[0],t), lerp(c1[1],c2[1],t), lerp(c1[2],c2[2],t)];
const toRGB   = c => `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`;

/** Interpolate between consecutive SKY_FRAMES for a given decimal hour */
function getSkyColors(h) {
  for (let i = 0; i < SKY_FRAMES.length - 1; i++) {
    const a = SKY_FRAMES[i], b = SKY_FRAMES[i + 1];
    if (h >= a.h && h <= b.h) {
      const t = (h - a.h) / (b.h - a.h);
      return { top: lerpRGB(a.top, b.top, t), bot: lerpRGB(a.bot, b.bot, t) };
    }
  }
  return { top: SKY_FRAMES[0].top, bot: SKY_FRAMES[0].bot };
}

// ──────────────────────────────────────────────────────
// SUN STATE
// Arc: centre-x = 50 %, from x≈5 % (6 am) to x≈95 % (6 pm)
//      centre-y = 82 % (horizon) rising to 17 % (zenith at noon)
// ──────────────────────────────────────────────────────
function getSunState(h) {
  // Opacity transitions
  let opacity;
  if      (h < 5.5)  opacity = 0;
  else if (h < 7.0)  opacity = (h - 5.5) / 1.5;
  else if (h < 17.5) opacity = 1;
  else if (h < 19.0) opacity = 1 - (h - 17.5) / 1.5;
  else               opacity = 0;

  // Position along the arc
  const progress = clamp((h - 6) / 12, 0, 1); // 0=6am, 1=6pm
  const angle    = Math.PI * (1 - progress);   // π→0
  const x = 50 + 45 * Math.cos(angle);         // 5 % → 95 %
  const y = 82 - 65 * Math.sin(angle);         // 82 % → 17 % → 82 %

  const elevation = Math.sin(angle);            // 0=horizon, 1=zenith

  return { x, y, elevation, opacity };
}

/** Returns a CSS box-shadow string reflecting sun height + time-of-day colour */
function getSunGlow(elevation, h) {
  const isLow = h < 8 || h > 16.5; // near horizon (golden times)
  if (isLow) {
    return `
      0 0  0  5px rgba(255,170, 50,0.45),
      0 0 30px 14px rgba(255,130,  0,0.55),
      0 0 80px 40px rgba(255, 80,  0,0.35),
      0 0 160px 80px rgba(255, 40,  0,0.18)`;
  }
  return `
    0 0  0  4px rgba(255,230,120,0.30),
    0 0 25px 12px rgba(255,210, 70,0.42),
    0 0 65px 32px rgba(255,185, 40,0.22),
    0 0 110px 55px rgba(255,150,  0,0.10)`;
}

/** Sun body radial gradient (orange at horizon, yellow-white at noon) */
function getSunBody(h) {
  if (h < 8 || h > 16.5) {
    // Warm orange-red sun close to horizon
    return 'radial-gradient(circle at 36% 36%, #fff3e0 0%, #ffcc80 28%, #ff8a65 62%, #e64a19 100%)';
  }
  // Bright yellow sun high in sky
  return 'radial-gradient(circle at 36% 36%, #fffde7 0%, #fff9c4 22%, #ffee58 52%, #fdd835 76%, #f9a825 100%)';
}

/** Outer atmospheric haze around sun (huge soft circle) */
function getSunAtmoColor(h) {
  if (h < 6.5 || h > 17.5) return 'radial-gradient(circle, rgba(255,100, 0,0.14) 0%, transparent 65%)';
  if (h < 8    || h > 16.5) return 'radial-gradient(circle, rgba(255,200,60,0.10) 0%, transparent 65%)';
  return                           'radial-gradient(circle, rgba(255,220,90,0.06) 0%, transparent 65%)';
}

// ──────────────────────────────────────────────────────
// MOON STATE (arc from 6 pm to 6 am — opposite of sun)
// ──────────────────────────────────────────────────────
function getMoonState(h) {
  // Opacity transitions (fade in at dusk, fade out at dawn)
  let opacity;
  if      (h > 7.0 && h < 17.5) opacity = 0;
  else if (h >= 17.5 && h < 19) opacity = (h - 17.5) / 1.5;
  else if (h >= 19  || h < 5.5) opacity = 1;
  else if (h >= 5.5 && h <= 7)  opacity = 1 - (h - 5.5) / 1.5;
  else                           opacity = 0;

  // Night arc: 6 pm → 6 am  (normalise to 18-30 range)
  const hN  = h >= 18 ? h : h + 24;
  const progress = clamp((hN - 18) / 12, 0, 1);
  const angle    = Math.PI * (1 - progress);
  const x = 50 + 45 * Math.cos(angle);
  const y = 82 - 65 * Math.sin(angle);

  return { x, y, opacity };
}

// ──────────────────────────────────────────────────────
// STARS OPACITY
// ──────────────────────────────────────────────────────
function getStarsOpacity(h) {
  if (h < 5.0)  return 1;
  if (h < 7.5)  return 1 - (h - 5.0) / 2.5;
  if (h < 17.5) return 0;
  if (h < 19.5) return (h - 17.5) / 2.0;
  return 1;
}

// ──────────────────────────────────────────────────────
// HORIZON GLOW  (the warm band at the edge of sky at sunrise/sunset)
// ──────────────────────────────────────────────────────
function getHorizonGlow(h) {
  // Sunrise 5:30–8:00
  if (h >= 5.5 && h < 6.5) {
    const t = (h - 5.5);                               // 0→1 over 1 h
    return `linear-gradient(to top, rgba(255,120,0,${(t*0.7).toFixed(2)}) 0%, rgba(255,170,50,${(t*0.35).toFixed(2)}) 30%, transparent 75%)`;
  }
  if (h >= 6.5 && h < 8.0) {
    const t = 1 - (h - 6.5) / 1.5;
    return `linear-gradient(to top, rgba(255,160,60,${(t*0.4).toFixed(2)}) 0%, transparent 65%)`;
  }
  // Sunset 16:30–19:30
  if (h >= 16.5 && h < 17.5) {
    const t = (h - 16.5);
    return `linear-gradient(to top, rgba(255,90,0,${(t*0.7).toFixed(2)}) 0%, rgba(255,140,40,${(t*0.35).toFixed(2)}) 35%, transparent 75%)`;
  }
  if (h >= 17.5 && h < 18.5) {
    const t = 1 - (h - 17.5);
    return `linear-gradient(to top, rgba(200,40,80,${(t*0.55).toFixed(2)}) 0%, rgba(150,20,120,${(t*0.25).toFixed(2)}) 40%, transparent 75%)`;
  }
  if (h >= 18.5 && h < 19.5) {
    const t = 1 - (h - 18.5);
    return `linear-gradient(to top, rgba(80,10,120,${(t*0.35).toFixed(2)}) 0%, transparent 65%)`;
  }
  return 'transparent';
}

// ──────────────────────────────────────────────────────
// CLOUD COLOUR
// ──────────────────────────────────────────────────────
function getCloudColor(h) {
  if (h >= 5.5 && h < 7.5) {
    // Sunrise: pink-peach clouds
    const t = (h - 5.5) / 2;
    return `rgba(${Math.round(lerp(255,255,t))},${Math.round(lerp(190,255,t))},${Math.round(lerp(130,255,t))},0.82)`;
  }
  if (h >= 16.5 && h < 18.5) {
    // Sunset: orange→purple clouds
    const t = (h - 16.5) / 2;
    return `rgba(${Math.round(lerp(255,110,t))},${Math.round(lerp(165,85,t))},${Math.round(lerp(85,145,t))},0.78)`;
  }
  if (h >= 18.5 || h < 5.5) {
    // Night: dark blue-grey clouds (barely visible)
    return 'rgba(28,32,62,0.55)';
  }
  // Daytime: white
  return 'rgba(255,255,255,0.84)';
}

// ──────────────────────────────────────────────────────
// GROUND SILHOUETTE
// ──────────────────────────────────────────────────────
function getGroundBg(h) {
  if (h >= 5.5 && h < 7.5)  return 'linear-gradient(to top, #120c04 0%, transparent 100%)';
  if (h >= 7.5 && h < 17.5) return 'linear-gradient(to top, #0a1206 0%, transparent 100%)';
  if (h >= 17.5 && h < 19)  return 'linear-gradient(to top, #140804 0%, transparent 100%)';
  return 'linear-gradient(to top, #040406 0%, transparent 100%)'; // night
}

// ──────────────────────────────────────────────────────
// MAIN SKY UPDATE  (called every second)
// ──────────────────────────────────────────────────────
function updateSky(now) {
  const h = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;

  // 1 ─ Sky gradient on body (CSS transition handles smoothing)
  const { top, bot } = getSkyColors(h);
  document.body.style.background =
    `linear-gradient(to bottom, ${toRGB(top)} 0%, ${toRGB(bot)} 100%)`;

  // 2 ─ Sun
  const sun    = getSunState(h);
  const sunWrap = document.getElementById('sun-wrap');
  sunWrap.style.left    = sun.x.toFixed(2) + '%';
  sunWrap.style.top     = sun.y.toFixed(2) + '%';
  sunWrap.style.opacity = clamp(sun.opacity, 0, 1).toFixed(3);

  document.getElementById('sun-body').style.background = getSunBody(h);
  document.getElementById('sun-body').style.boxShadow  = getSunGlow(sun.elevation, h);
  document.getElementById('sun-outer-glow').style.background = getSunAtmoColor(h);

  // Sun rays more prominent at golden hour
  const raysOpacity = (h < 8 || h > 16.5) ? 0.85 : 0.40;
  document.getElementById('sun-rays').style.opacity = raysOpacity;

  // 3 ─ Moon
  const moon    = getMoonState(h);
  const moonWrap = document.getElementById('moon-wrap');
  moonWrap.style.left    = moon.x.toFixed(2) + '%';
  moonWrap.style.top     = moon.y.toFixed(2) + '%';
  moonWrap.style.opacity = clamp(moon.opacity, 0, 1).toFixed(3);

  // 4 ─ Stars
  document.getElementById('stars-layer').style.opacity = getStarsOpacity(h).toFixed(3);

  // 5 ─ Horizon glow
  document.getElementById('horizon-glow').style.background = getHorizonGlow(h);

  // 6 ─ Clouds
  const cloudColor = getCloudColor(h);
  document.querySelectorAll('.cloud').forEach(el => { el.style.background = cloudColor; });

  // 7 ─ Ground
  document.getElementById('ground').style.background = getGroundBg(h);
}

// ──────────────────────────────────────────────────────
// GENERATE STARS
// ──────────────────────────────────────────────────────
function generateStars() {
  const layer = document.getElementById('stars-layer');
  for (let i = 0; i < 200; i++) {
    const el   = document.createElement('div');
    el.className = 'star';
    const size = Math.random() * 2.4 + 0.4;
    const peak = (Math.random() * 0.55 + 0.35).toFixed(2);
    el.style.cssText = `
      width:${size.toFixed(1)}px; height:${size.toFixed(1)}px;
      top:${(Math.random() * 88).toFixed(1)}%;
      left:${(Math.random() * 100).toFixed(1)}%;
      --dur:${(Math.random() * 3 + 2).toFixed(1)}s;
      --del:${(Math.random() * 6).toFixed(1)}s;
      --peak:${peak};
    `;
    layer.appendChild(el);
  }
}

// ──────────────────────────────────────────────────────
// CLOCK LOGIC
// ──────────────────────────────────────────────────────
const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June','July','August',
                'September','October','November','December'];

function getGreeting(h) {
  if (h < 5)  return '🌙 Good Night';
  if (h < 12) return '🌅 Good Morning';
  if (h < 17) return '☀️ Good Afternoon';
  if (h < 21) return '🌆 Good Evening';
  return '🌙 Good Night';
}

function pad(n) { return String(n).padStart(2, '0'); }

function updateClock() {
  const now = new Date();
  const h24 = now.getHours();
  const m   = now.getMinutes();
  const s   = now.getSeconds();

  let displayH = h24, ampm = '';
  if (!use24h) {
    ampm    = h24 < 12 ? 'AM' : 'PM';
    displayH = h24 % 12 || 12;
  }

  document.getElementById('hours').textContent   = pad(displayH);
  document.getElementById('minutes').textContent = pad(m);
  document.getElementById('seconds').textContent = pad(s);
  document.getElementById('ampm').textContent    = ampm;
  document.getElementById('ampm').style.display  = use24h ? 'none' : '';

  document.getElementById('greeting').textContent    = getGreeting(h24);
  document.getElementById('date-display').textContent =
    `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

  try {
    document.getElementById('timezone-label').textContent =
      Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch { /* ignore */ }

  // Day progress
  const dayPct  = ((h24 * 3600 + m * 60 + s) / 86400) * 100;
  document.getElementById('day-progress').style.width = dayPct.toFixed(2) + '%';

  // Year progress
  const start   = new Date(now.getFullYear(), 0, 1);
  const end     = new Date(now.getFullYear() + 1, 0, 1);
  const yearPct = ((now - start) / (end - start)) * 100;
  document.getElementById('year-progress').style.width = yearPct.toFixed(2) + '%';

  // Update sky every tick
  updateSky(now);
}

function toggleFormat(h) {
  use24h = (h === 24);
  document.getElementById('btn-12h').classList.toggle('active', !use24h);
  document.getElementById('btn-24h').classList.toggle('active',  use24h);
  updateClock();
}

// ──────────────────────────────────────────────────────
// INIT
// ──────────────────────────────────────────────────────
generateStars();
updateClock();              // immediate first paint
setInterval(updateClock, 1000); // update every second
