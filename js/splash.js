// Splash interstitial — shows once per session right after the password gate.
// Anna's photo fades in, words drift in one by one, then it lifts to reveal the site.

const LINES = [
  'For Anna',
  'on her twenty-fifth turning',
  'a whole world,',
  'kept just for you',
];

export function playSplash(onDone) {
  const wrap = document.createElement('div');
  wrap.id = 'bw-splash';
  wrap.innerHTML = `
    <div class="splash-photo"></div>
    <div class="splash-veil"></div>
    <div class="splash-words" id="splash-words"></div>
    <div class="splash-enter" id="splash-enter">enter ◆</div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    #bw-splash {
      position: fixed; inset: 0; z-index: 9990;
      background: #0d0908;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      overflow: hidden;
      transition: opacity 1s ease;
    }
    #bw-splash.lift { opacity: 0; pointer-events: none; }
    .splash-photo {
      position: absolute; inset: 0;
      background: url('assets/images/splash.jpg') center 22% / cover no-repeat;
      opacity: 0;
      transform: scale(1.12);
      animation: splashPhotoIn 2.4s ease forwards, splashKen 14s ease-out forwards;
      filter: saturate(1.05) contrast(1.02);
    }
    @keyframes splashPhotoIn { to { opacity: 0.55; } }
    @keyframes splashKen { to { transform: scale(1.0); } }
    .splash-veil {
      position: absolute; inset: 0;
      background:
        linear-gradient(to top, rgba(13,9,8,0.92) 0%, rgba(13,9,8,0.35) 45%, rgba(13,9,8,0.6) 100%),
        radial-gradient(ellipse 70% 60% at 50% 60%, transparent, rgba(13,9,8,0.5));
      pointer-events: none;
    }
    .splash-words {
      position: relative; z-index: 2;
      text-align: center; padding: 0 1.5rem;
      max-width: 680px;
    }
    .splash-line {
      display: block;
      font-family: 'Bodoni Moda', 'Didot', serif;
      color: #f0e8e0;
      opacity: 0;
      filter: blur(8px);
      transform: translateY(28px);
      will-change: opacity, transform, filter;
    }
    .splash-line.in {
      animation: lineIn 1.3s cubic-bezier(0.2,0.8,0.2,1) forwards;
    }
    @keyframes lineIn {
      to { opacity: 1; filter: blur(0); transform: translateY(0); }
    }
    .splash-line.l0 { font-size: clamp(2.4rem, 8vw, 4.2rem); color: #c9a84c; line-height: 1.1; margin-bottom: 0.4rem; text-shadow: 0 0 50px rgba(201,168,76,0.3); }
    .splash-line.l1 { font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: clamp(1rem, 3.5vw, 1.5rem); color: #b8a898; margin-bottom: 2.2rem; }
    .splash-line.l2 { font-size: clamp(1.6rem, 5.5vw, 2.8rem); color: #f0e8e0; line-height: 1.25; }
    .splash-line.l3 { font-size: clamp(1.6rem, 5.5vw, 2.8rem); color: #f0e8e0; line-height: 1.25; }
    .splash-enter {
      position: relative; z-index: 2;
      margin-top: 2.6rem;
      font-family: 'Cormorant Garamond', serif;
      font-size: 0.7rem; letter-spacing: 0.35em; text-transform: uppercase;
      color: #c9a84c; cursor: pointer;
      border: 1px solid rgba(201,168,76,0.4);
      padding: 0.6rem 1.6rem; border-radius: 3px;
      opacity: 0; transition: opacity 0.8s ease, background 0.2s;
    }
    .splash-enter.show { opacity: 0.85; }
    .splash-enter:hover { background: rgba(201,168,76,0.12); opacity: 1; }
    /* a slow drift of light particles */
    .splash-dust {
      position: absolute; width: 3px; height: 3px; border-radius: 50%;
      background: rgba(201,168,76,0.5); pointer-events: none; z-index: 1;
      animation: splashDust linear infinite;
    }
    @keyframes splashDust {
      from { transform: translateY(20px); opacity: 0; }
      20%  { opacity: 0.7; }
      to   { transform: translateY(-110vh); opacity: 0; }
    }
    body.pixel-mode #bw-splash .splash-line,
    body.pixel-mode #bw-splash .splash-enter { font-family: 'Press Start 2P', monospace; }
    body.pixel-mode #bw-splash .splash-line.l0 { font-size: clamp(1.3rem,5vw,2.4rem); }
    body.pixel-mode #bw-splash .splash-line.l2,
    body.pixel-mode #bw-splash .splash-line.l3 { font-size: clamp(1rem,4vw,1.7rem); line-height:1.6; }
  `;
  document.head.appendChild(style);
  document.body.appendChild(wrap);

  // build lines
  const words = wrap.querySelector('#splash-words');
  LINES.forEach((text, i) => {
    const span = document.createElement('span');
    span.className = `splash-line l${i}`;
    span.textContent = text;
    words.appendChild(span);
  });

  // drifting dust
  for (let i = 0; i < 22; i++) {
    const d = document.createElement('div');
    d.className = 'splash-dust';
    d.style.left = Math.random() * 100 + 'vw';
    d.style.bottom = '-10px';
    d.style.animationDuration = (6 + Math.random() * 7) + 's';
    d.style.animationDelay = (Math.random() * 6) + 's';
    if (Math.random() < 0.3) d.style.background = 'rgba(196,30,58,0.45)';
    wrap.appendChild(d);
  }

  // sequence the lines in
  const lineEls = words.querySelectorAll('.splash-line');
  const startDelay = 900;            // let photo begin fading first
  const stagger = 1100;
  lineEls.forEach((el, i) => {
    setTimeout(() => el.classList.add('in'), startDelay + i * stagger);
  });

  const enterBtn = wrap.querySelector('#splash-enter');
  const allInAt = startDelay + lineEls.length * stagger + 400;
  setTimeout(() => enterBtn.classList.add('show'), allInAt);

  let finished = false;
  function finish() {
    if (finished) return;
    finished = true;
    wrap.classList.add('lift');
    setTimeout(() => { wrap.remove(); style.remove(); if (onDone) onDone(); }, 1050);
  }

  enterBtn.addEventListener('click', finish);
  wrap.addEventListener('click', e => {           // tap anywhere once words are in
    if (e.target === enterBtn) return;
    if (enterBtn.classList.contains('show')) finish();
  });
  // graceful auto-advance if she just watches
  setTimeout(finish, allInAt + 6000);
}
