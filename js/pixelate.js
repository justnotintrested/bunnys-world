// Pixelate toggle — Three.js mosaic wave that sweeps the screen,
// flips the page into Soft Pixel mode at full cover, then sweeps away.
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const KEY = 'bw_pixel_mode';
const PALETTE = [0x241c2c, 0x7c4456, 0xcc7888, 0xf0b8a0, 0xf8ecd8, 0x2e2438];

export function initPixelate() {
  // apply saved mode instantly (no animation on load)
  if (localStorage.getItem(KEY) === '1') document.body.classList.add('pixel-mode');

  if (localStorage.getItem('bw_evil') === '1') document.body.classList.add('evil-mode');

  // bunny companion — triple-tap him to wake the evil bunny
  if (!document.getElementById('px-bunny')) {
    const b = document.createElement('div');
    b.id = 'px-bunny';
    document.body.appendChild(b);
    let taps = 0, tapTimer = null;
    b.addEventListener('pointerdown', () => {
      taps++;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(() => { taps = 0; }, 1200);
      if (taps >= 3) {
        taps = 0;
        document.body.classList.toggle('evil-mode');
        const evil = document.body.classList.contains('evil-mode');
        localStorage.setItem('bw_evil', evil ? '1' : '0');
        dispatchEvent(new CustomEvent('bw-pixel-mode', {
          detail: { on: document.body.classList.contains('pixel-mode'), evil }
        }));
      }
    });
  }

  // button into the nav
  const nav = document.querySelector('.site-nav') || document.querySelector('.nav');
  if (!nav) return;
  const btn = document.createElement('button');
  btn.className = 'pixelate-btn';
  btn.textContent = pixelOn() ? '◳ de-pixelate' : '◳ pixelate';
  btn.title = 'toggle soft pixel mode';
  (nav.querySelector('.nav-links') || nav).appendChild(
    Object.assign(document.createElement(nav.querySelector('ul.nav-links') ? 'li' : 'span'), {})
  ).appendChild(btn);

  let busy = false;
  btn.addEventListener('click', () => {
    if (busy) return;
    busy = true;
    runMosaic(() => {
      document.body.classList.toggle('pixel-mode');
      localStorage.setItem(KEY, pixelOn() ? '1' : '0');
      btn.textContent = pixelOn() ? '◳ de-pixelate' : '◳ pixelate';
      dispatchEvent(new CustomEvent('bw-pixel-mode', {
        detail: { on: pixelOn(), evil: document.body.classList.contains('evil-mode') }
      }));
    }, () => { busy = false; });
  });
}

function pixelOn() { return document.body.classList.contains('pixel-mode'); }

// ── The mosaic wave ───────────────────────────────────────────────
function runMosaic(atCover, done) {
  const W = innerWidth, H = innerHeight;
  const TILE = Math.max(26, Math.min(44, Math.floor(W / 24)));
  const cols = Math.ceil(W / TILE) + 1;
  const rows = Math.ceil(H / TILE) + 1;
  const count = cols * rows;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;z-index:99999;pointer-events:none;';
  document.body.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(W, H);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, W, 0, H, -10, 10);

  const geo = new THREE.PlaneGeometry(TILE, TILE);
  const mat = new THREE.MeshBasicMaterial({ vertexColors: true });
  const mesh = new THREE.InstancedMesh(geo, mat, count);

  const color = new THREE.Color();
  const dummy = new THREE.Object3D();
  const delays = new Float32Array(count);
  const tiles = [];

  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * TILE + TILE / 2;
      const y = r * TILE + TILE / 2;
      dummy.position.set(x, y, 0);
      dummy.scale.setScalar(0.0001);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, color.setHex(PALETTE[(Math.random() * PALETTE.length) | 0]));
      // diagonal wave from top-left, with a sprinkle of randomness for charm
      delays[i] = (c / cols + r / rows) * 0.42 + Math.random() * 0.12;
      tiles.push({ x, y });
      i++;
    }
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  scene.add(mesh);

  const IN = 0.62, HOLD = 0.18, OUT = 0.62;
  const TOTAL = IN + HOLD + OUT + 0.55; // + max delay headroom
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const t0 = performance.now();
  let covered = false, finished = false;

  // guarantee the toggle + cleanup happen even if rAF is throttled
  // (backgrounded tab, mid-transition tab switch)
  setTimeout(() => { if (!covered) { covered = true; atCover(); } }, (0.55 + IN) * 1000);
  setTimeout(() => { if (!finished) finish(); }, (TOTAL + 0.3) * 1000);

  function finish() {
    finished = true;
    renderer.dispose();
    geo.dispose(); mat.dispose();
    canvas.remove();
    done();
  }

  function frame() {
    if (finished) return;
    const t = (performance.now() - t0) / 1000;

    for (let i = 0; i < count; i++) {
      const d = delays[i];
      let s;
      if (t < d) s = 0;
      else if (t < d + IN) s = ease((t - d) / IN);                       // grow in
      else if (t < d + IN + HOLD) s = 1;                                  // hold
      else if (t < d + IN + HOLD + OUT) s = 1 - ease((t - d - IN - HOLD) / OUT); // shrink out
      else s = 0;
      const tile = tiles[i];
      dummy.position.set(tile.x, tile.y, 0);
      dummy.rotation.z = (1 - s) * 0.5;             // a little twist as they bloom
      dummy.scale.setScalar(Math.max(0.0001, s * 1.04));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    renderer.render(scene, camera);

    // the moment every tile is at full cover (worst-case delay + IN)
    if (!covered && t >= 0.55 + IN) {
      covered = true;
      atCover();
    }

    if (t < TOTAL) requestAnimationFrame(frame);
    else if (!finished) finish();
  }
  requestAnimationFrame(frame);
}
