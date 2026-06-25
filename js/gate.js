// ── Password Gate ──────────────────────────────────────────────
import { getRandomCompliment } from './compliments.js';
import { playSplash } from './splash.js';

const PASSWORD = 'bunny';
const SESSION_KEY = 'bw_unlocked';

// ── Petal colours ───────────────────────────────────────────────
const PETAL_SVGS = [
  // Rose petal — crimson
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 60" width="22" height="32">
    <path d="M20 5 Q35 15 32 35 Q28 55 20 58 Q12 55 8 35 Q5 15 20 5Z"
          fill="#c41e3a" opacity="0.7"/>
  </svg>`,
  // Smaller petal — gold tint
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 45" width="16" height="24">
    <path d="M15 3 Q26 12 24 28 Q21 42 15 44 Q9 42 6 28 Q4 12 15 3Z"
          fill="#c9a84c" opacity="0.5"/>
  </svg>`,
  // Tiny deep rose
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="13" height="19">
    <path d="M12 2 Q20 9 18 22 Q16 33 12 34 Q8 33 6 22 Q4 9 12 2Z"
          fill="#8b1a1a" opacity="0.6"/>
  </svg>`,
];

function spawnPetal() {
  const el = document.createElement('div');
  el.className = 'petal';
  const svg = PETAL_SVGS[Math.floor(Math.random() * PETAL_SVGS.length)];
  el.innerHTML = svg;

  const left     = Math.random() * 100;
  const duration = 5 + Math.random() * 6;   // 5–11s
  const delay    = Math.random() * 3;
  const swing    = (Math.random() - 0.5) * 120; // horizontal drift

  el.style.cssText = `
    left: ${left}vw;
    animation-duration: ${duration}s;
    animation-delay: ${delay}s;
    filter: blur(${Math.random() < 0.3 ? 1 : 0}px);
  `;
  // Add horizontal drift via CSS custom property
  el.style.setProperty('--swing', `${swing}px`);

  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

function startPetals(count = 18) {
  for (let i = 0; i < count; i++) {
    setTimeout(spawnPetal, Math.random() * 2000);
  }
}

// ── Compliment toast ────────────────────────────────────────────
export function showCompliment(text) {
  let toast = document.getElementById('compliment-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'compliment-toast';
    toast.innerHTML = `<span class="toast-text"></span>
      <span class="toast-close" onclick="this.closest('#compliment-toast').classList.remove('show')">
        close &nbsp;×
      </span>`;
    document.body.appendChild(toast);
  }
  toast.querySelector('.toast-text').textContent = text || getRandomCompliment();
  setTimeout(() => toast.classList.add('show'), 50);
  // Auto-dismiss after 7s
  setTimeout(() => toast.classList.remove('show'), 7000);
}

// ── Gate logic ──────────────────────────────────────────────────
export function initGate() {
  // Already unlocked this session?
  if (sessionStorage.getItem(SESSION_KEY) === '1') {
    removeSavedGate();
    return;
  }

  buildGate();
}

function buildGate() {
  const gate = document.createElement('div');
  gate.id = 'gate';
  gate.innerHTML = `
    <div class="gate-corner gate-tl"></div>
    <div class="gate-corner gate-br"></div>

    <p class="gate-eyebrow caps mist" style="margin-bottom:2rem;font-size:0.6rem;letter-spacing:0.3em;">
      Private — by invitation only
    </p>

    <h1 class="gate-title">Bunny's<br>World</h1>
    <p class="gate-sub italic">a small dark room, lit just for you</p>

    <form class="gate-form" id="gate-form" autocomplete="off">
      <input
        class="gate-input"
        type="password"
        id="gate-pass"
        placeholder="enter the word"
        maxlength="30"
        autocomplete="new-password"
        autofocus
      />
      <button type="submit" class="btn btn-gold" style="width:100%;">Enter ◆</button>
      <p class="gate-error" id="gate-error">not quite — try again</p>
    </form>

    <p class="gate-hint">you know the word &nbsp;✦</p>
  `;

  // Inline corner ornament styles
  const style = document.createElement('style');
  style.textContent = `
    .gate-corner {
      position: absolute; width: 60px; height: 60px;
      border-color: rgba(201,168,76,0.2); border-style: solid; pointer-events: none;
    }
    .gate-tl { top: 2rem; left: 2rem; border-width: 1px 0 0 1px; }
    .gate-br { bottom: 2rem; right: 2rem; border-width: 0 1px 1px 0; }
  `;
  document.head.appendChild(style);

  document.body.prepend(gate);

  document.getElementById('gate-form').addEventListener('submit', e => {
    e.preventDefault();
    const val = document.getElementById('gate-pass').value.trim().toLowerCase();
    if (val === PASSWORD) {
      unlock(gate);
    } else {
      shake(gate);
      const err = document.getElementById('gate-error');
      err.classList.add('show');
      setTimeout(() => err.classList.remove('show'), 2500);
      document.getElementById('gate-pass').value = '';
    }
  });
}

function unlock(gate) {
  sessionStorage.setItem(SESSION_KEY, '1');
  gate.classList.add('unlocking');
  startPetals(24);
  setTimeout(() => {
    gate.remove();
    // Splash interstitial → then a welcome compliment
    playSplash(() => showCompliment(getRandomCompliment()));
  }, 900);
}

function shake(el) {
  el.animate([
    { transform: 'translateX(0)' },
    { transform: 'translateX(-8px)' },
    { transform: 'translateX(8px)' },
    { transform: 'translateX(-6px)' },
    { transform: 'translateX(0)' },
  ], { duration: 350, easing: 'ease-out' });
}

function removeSavedGate() {
  // Just in case gate HTML was pre-rendered
  const gate = document.getElementById('gate');
  if (gate) gate.remove();
}

// ── Click-trigger compliments ────────────────────────────────────
// Call this after DOM is ready. Pass selector + optional specific compliment.
export function addComplimentTrigger(selector, text = null) {
  document.querySelectorAll(selector).forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => showCompliment(text || getRandomCompliment()));
  });
}
