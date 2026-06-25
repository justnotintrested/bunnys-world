// Floating music player — HTML5 audio, local MP3s
const TRACKS = [
  { title: 'Snooze',      artist: 'SZA',         src: 'assets/audio/snooze.mp3' },
  { title: 'Film Out',    artist: 'BTS',          src: 'assets/audio/film-out.mp3' },
  { title: 'Naan Un',     artist: 'A.R. Rahman',  src: 'assets/audio/naan-un.mp3' },
  { title: 'Olave Olave', artist: 'Saptasagara',  src: 'assets/audio/olave-olave.mp3' },
  { title: 'E85',         artist: 'Don Toliver',  src: 'assets/audio/e85.mp3' },
];

export function initPlayer() {
  // ── Inject styles ──────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #bw-player {
      position: fixed;
      bottom: 1.4rem;
      right: 1.4rem;
      z-index: 9000;
      font-family: 'Cormorant Garamond', serif;
      user-select: none;
    }
    #bw-player-bubble {
      width: 48px; height: 48px;
      border-radius: 50%;
      background: #1a1008;
      border: 1.5px solid #c9a84c;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      box-shadow: 0 0 18px rgba(201,168,76,.2);
      transition: box-shadow .2s;
      position: relative;
    }
    #bw-player-bubble:hover { box-shadow: 0 0 30px rgba(201,168,76,.4); }
    #bw-player-bubble svg { width:19px; height:19px; fill:#c9a84c; flex-shrink:0; }

    /* spinning ring when playing */
    #bw-player-bubble::before {
      content:'';
      position:absolute; inset:-4px;
      border-radius:50%;
      border: 1.5px solid transparent;
      border-top-color: #c9a84c;
      animation: bw-spin 1.8s linear infinite;
      opacity: 0;
      transition: opacity .3s;
    }
    #bw-player.playing #bw-player-bubble::before { opacity: 1; }
    @keyframes bw-spin { to { transform: rotate(360deg); } }

    /* panel */
    #bw-player-panel {
      position: absolute;
      bottom: 62px; right: 0;
      width: 268px;
      background: #110b07;
      border: 1px solid #2a1a10;
      border-radius: 10px;
      padding: 1rem 1.1rem 0.8rem;
      box-shadow: 0 8px 40px rgba(0,0,0,.7);
      display: none;
    }
    #bw-player-panel.open { display: block; }

    .bw-track-info { margin-bottom: .7rem; }
    .bw-track-title {
      font-family: 'Bodoni Moda', serif;
      font-size: 1rem; color: #f0e8e0;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .bw-track-artist { font-size: .72rem; color: #a08060; font-style: italic; }

    .bw-controls {
      display: flex; align-items: center; justify-content: center;
      gap: .5rem; margin-bottom: .65rem;
    }
    .bw-btn {
      background: none; border: none; color: #c9a84c;
      cursor: pointer; padding: .25rem .5rem;
      opacity: .65; transition: opacity .15s; line-height: 1;
      font-size: 1.3rem;
    }
    .bw-btn:hover { opacity: 1; }
    .bw-btn.bw-play-pause {
      font-size: 1.6rem; opacity: 1;
      width: 38px; height: 38px;
      border-radius: 50%;
      border: 1.5px solid rgba(201,168,76,.35);
      display: flex; align-items: center; justify-content: center;
      padding: 0;
    }

    .bw-time-row {
      display: flex; justify-content: space-between;
      font-size: .62rem; color: #5a4030; margin-bottom: .3rem;
    }
    .bw-progress-wrap {
      height: 3px; background: #2a1a10; border-radius: 2px;
      cursor: pointer; margin-bottom: .8rem;
    }
    .bw-progress-bar {
      height: 100%; background: #c9a84c;
      border-radius: 2px; width: 0%;
      transition: width .3s linear;
      pointer-events: none;
    }

    .bw-track-list { border-top: 1px solid #1e1208; padding-top: .5rem; }
    .bw-track-item {
      display: flex; align-items: center; gap: .45rem;
      padding: .28rem .2rem; cursor: pointer; border-radius: 3px;
      font-size: .78rem; color: #6a5040;
      transition: color .15s, background .15s;
    }
    .bw-track-item:hover { color: #f0e8e0; background: rgba(201,168,76,.05); }
    .bw-track-item.active { color: #c9a84c; }
    .bw-dot { width:5px; height:5px; border-radius:50%; background:#c9a84c; opacity:0; flex-shrink:0; }
    .bw-track-item.active .bw-dot { opacity:1; }
    .bw-track-name { flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .bw-track-sub { font-size:.63rem; opacity:.5; }

    @media (max-width: 540px) {
      #bw-player { bottom: 1rem; right: 1rem; }
      #bw-player-bubble { width: 42px; height: 42px; }
      #bw-player-panel {
        width: min(264px, calc(100vw - 2rem));
        bottom: 54px;
      }
    }
  `;
  document.head.appendChild(style);

  // ── Inject HTML ────────────────────────────────────────────────
  const wrap = document.createElement('div');
  wrap.id = 'bw-player';
  wrap.innerHTML = `
    <div id="bw-player-panel">
      <div class="bw-track-info">
        <div class="bw-track-title" id="bw-title">Snooze</div>
        <div class="bw-track-artist" id="bw-artist">SZA</div>
      </div>
      <div class="bw-controls">
        <button class="bw-btn" id="bw-prev" title="Previous">&#8249;</button>
        <button class="bw-btn bw-play-pause" id="bw-play" title="Play">&#9654;</button>
        <button class="bw-btn" id="bw-next" title="Next">&#8250;</button>
      </div>
      <div class="bw-time-row"><span id="bw-cur">0:00</span><span id="bw-dur">0:00</span></div>
      <div class="bw-progress-wrap" id="bw-prog-wrap">
        <div class="bw-progress-bar" id="bw-prog"></div>
      </div>
      <div class="bw-track-list" id="bw-list"></div>
    </div>
    <div id="bw-player-bubble" title="Music">
      <svg viewBox="0 0 24 24"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>
    </div>
  `;
  document.body.appendChild(wrap);

  // ── Audio element ──────────────────────────────────────────────
  const audio = new Audio();
  audio.preload = 'none';

  // ── State (persisted across pages via sessionStorage) ─────────
  const STATE_KEY = 'bw_player_state';
  let saved = {};
  try { saved = JSON.parse(sessionStorage.getItem(STATE_KEY) || '{}'); } catch {}
  let cur = (saved.idx >= 0 && saved.idx < TRACKS.length) ? saved.idx : 0;

  function persist() {
    try {
      sessionStorage.setItem(STATE_KEY, JSON.stringify({
        idx: cur,
        time: audio.currentTime || 0,
        playing: !audio.paused && !audio.ended
      }));
    } catch {}
  }

  // ── Build track list ───────────────────────────────────────────
  const listEl = document.getElementById('bw-list');
  TRACKS.forEach((t, i) => {
    const item = document.createElement('div');
    item.className = 'bw-track-item' + (i === 0 ? ' active' : '');
    item.innerHTML = `<div class="bw-dot"></div><div class="bw-track-name">${t.title} <span class="bw-track-sub">· ${t.artist}</span></div>`;
    item.addEventListener('click', () => { cur = i; loadAndPlay(); });
    listEl.appendChild(item);
  });

  // ── Helpers ────────────────────────────────────────────────────
  function fmt(s) {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60), ss = Math.floor(s % 60);
    return m + ':' + String(ss).padStart(2, '0');
  }

  function getRoot() {
    // Works on both root pages and nested paths
    const path = location.pathname;
    const depth = (path.match(/\//g) || []).length;
    // GitHub Pages: /bunnys-world/page.html → depth 2, need '../' once? No.
    // All pages are at the same level so 'assets/audio/...' always works
    return '';
  }

  function loadTrack() {
    const t = TRACKS[cur];
    document.getElementById('bw-title').textContent = t.title;
    document.getElementById('bw-artist').textContent = t.artist;
    document.querySelectorAll('.bw-track-item').forEach((el, i) => el.classList.toggle('active', i === cur));
    document.getElementById('bw-prog').style.width = '0%';
    document.getElementById('bw-cur').textContent = '0:00';
    document.getElementById('bw-dur').textContent = '0:00';
    audio.src = t.src;
    audio.load();
  }

  function loadAndPlay() {
    loadTrack();
    audio.play().catch(() => {});
  }

  function setPlayUI(playing) {
    document.getElementById('bw-play').innerHTML = playing ? '&#9646;&#9646;' : '&#9654;';
    wrap.classList.toggle('playing', playing);
  }

  // ── Audio events ───────────────────────────────────────────────
  audio.addEventListener('play',  () => { setPlayUI(true); persist(); });
  audio.addEventListener('pause', () => { setPlayUI(false); persist(); });
  audio.addEventListener('ended', () => { cur = (cur + 1) % TRACKS.length; loadAndPlay(); });
  audio.addEventListener('timeupdate', () => {
    const pct = audio.duration ? audio.currentTime / audio.duration * 100 : 0;
    document.getElementById('bw-prog').style.width = pct + '%';
    document.getElementById('bw-cur').textContent = fmt(audio.currentTime);
    persist();
  });
  window.addEventListener('pagehide', persist);
  audio.addEventListener('durationchange', () => {
    document.getElementById('bw-dur').textContent = fmt(audio.duration);
  });

  // ── UI events ──────────────────────────────────────────────────
  document.getElementById('bw-player-bubble').addEventListener('click', () => {
    document.getElementById('bw-player-panel').classList.toggle('open');
  });

  document.getElementById('bw-play').addEventListener('click', () => {
    if (audio.paused) {
      if (!audio.src) loadTrack();
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  });

  document.getElementById('bw-prev').addEventListener('click', () => {
    cur = (cur - 1 + TRACKS.length) % TRACKS.length;
    if (!audio.paused) loadAndPlay(); else loadTrack();
  });

  document.getElementById('bw-next').addEventListener('click', () => {
    cur = (cur + 1) % TRACKS.length;
    if (!audio.paused) loadAndPlay(); else loadTrack();
  });

  document.getElementById('bw-prog-wrap').addEventListener('click', e => {
    if (!audio.duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    audio.currentTime = (e.clientX - r.left) / r.width * audio.duration;
  });

  document.addEventListener('click', e => {
    if (!wrap.contains(e.target)) document.getElementById('bw-player-panel').classList.remove('open');
  });

  // ── Restore playback from previous page ───────────────────────
  loadTrack();
  if (saved.time > 0) {
    const resumeAt = saved.time;
    audio.preload = 'metadata';
    audio.load();
    audio.addEventListener('loadedmetadata', () => {
      if (resumeAt < (audio.duration || Infinity)) audio.currentTime = resumeAt;
    }, { once: true });
  }
  if (saved.playing) {
    // try to continue playing; browsers may block autoplay until a user gesture
    audio.play().catch(() => {
      const resume = () => { audio.play().catch(() => {}); };
      document.addEventListener('pointerdown', resume, { once: true });
      document.addEventListener('keydown', resume, { once: true });
    });
  }
}
