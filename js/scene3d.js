// Bunny's World — ambient Three.js background
// A golden particle heart drifting in dust, behind every page.
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export function initScene({ heart = true } = {}) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const isMobile = matchMedia('(max-width: 600px)').matches;

  // ── Canvas behind everything ───────────────────────────────────
  const canvas = document.createElement('canvas');
  canvas.id = 'bw-scene';
  canvas.style.cssText = 'position:fixed;inset:0;z-index:-1;pointer-events:none;';
  document.body.prepend(canvas);
  // page backgrounds must not cover the canvas
  document.documentElement.style.background = '#0d0908';
  document.body.style.background = 'transparent';

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.setSize(innerWidth, innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0d0908, 0.018);

  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 200);
  camera.position.z = 42;

  // ── Soft round sprite texture ──────────────────────────────────
  function makeSprite(inner, outer) {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, inner);
    grad.addColorStop(0.35, outer);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  const goldSprite = makeSprite('rgba(255,235,180,1)', 'rgba(201,168,76,.55)');
  const roseSprite = makeSprite('rgba(255,190,200,1)', 'rgba(196,30,58,.45)');

  // hard-edged square sprite for pixel mode
  function makeSquare(colorA, colorB) {
    const c = document.createElement('canvas');
    c.width = c.height = 16;
    const g = c.getContext('2d');
    g.fillStyle = colorA; g.fillRect(2, 2, 12, 12);
    g.fillStyle = colorB; g.fillRect(4, 4, 8, 8);
    const t = new THREE.CanvasTexture(c);
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  const peachSquare = makeSquare('rgba(240,184,160,.9)', 'rgba(248,236,216,1)');
  const pinkSquare  = makeSquare('rgba(204,120,136,.9)', 'rgba(240,184,160,1)');

  // ── Heart-shaped particle cloud ────────────────────────────────
  let heartPts = null;
  if (heart) {
    const COUNT = isMobile ? 700 : 1400;
    const pos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const t = Math.random() * Math.PI * 2;
      // classic heart curve
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      const jitter = Math.random();
      const spread = 0.55 + jitter * 0.9;        // fill the inside a little
      pos[i * 3]     = hx * 0.55 * spread + (Math.random() - 0.5) * 0.8;
      pos[i * 3 + 1] = hy * 0.55 * spread + (Math.random() - 0.5) * 0.8 + 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      size: isMobile ? 0.55 : 0.45,
      map: goldSprite,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: 0xc9a84c,
    });
    heartPts = new THREE.Points(geo, mat);
    scene.add(heartPts);
  }

  // ── Ambient dust field ─────────────────────────────────────────
  const DUST = isMobile ? 250 : 600;
  const dustPos = new Float32Array(DUST * 3);
  const dustSpeed = new Float32Array(DUST);
  for (let i = 0; i < DUST; i++) {
    dustPos[i * 3]     = (Math.random() - 0.5) * 120;
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 80;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 60 - 10;
    dustSpeed[i] = 0.2 + Math.random() * 0.8;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({
    size: 0.5,
    map: Math.random() > 0.5 ? goldSprite : roseSprite,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    color: 0xb89060,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  // a few crimson embers
  const EMB = isMobile ? 40 : 90;
  const embPos = new Float32Array(EMB * 3);
  for (let i = 0; i < EMB; i++) {
    embPos[i * 3]     = (Math.random() - 0.5) * 90;
    embPos[i * 3 + 1] = (Math.random() - 0.5) * 60;
    embPos[i * 3 + 2] = (Math.random() - 0.5) * 40 - 5;
  }
  const embGeo = new THREE.BufferGeometry();
  embGeo.setAttribute('position', new THREE.BufferAttribute(embPos, 3));
  const embers = new THREE.Points(embGeo, new THREE.PointsMaterial({
    size: 0.9, map: roseSprite, transparent: true, opacity: 0.5,
    depthWrite: false, blending: THREE.AdditiveBlending, color: 0xc41e3a,
  }));
  scene.add(embers);

  // ── Theme: gothic gold ⇄ soft pixel ⇄ evil bunny ───────────────
  const redSquare = makeSquare('rgba(212,0,34,.95)', 'rgba(255,68,85,1)');
  function applyTheme(pixel, evil = false) {
    const bg = evil ? '#0c0306' : pixel ? '#241c2c' : '#0d0908';
    document.documentElement.style.background = bg;
    scene.fog.color.set(evil ? 0x0c0306 : pixel ? 0x241c2c : 0x0d0908);
    if (heartPts) {
      heartPts.material.map = evil ? redSquare : pixel ? pinkSquare : goldSprite;
      heartPts.material.color.set(evil ? 0xd40022 : pixel ? 0xcc7888 : 0xc9a84c);
      heartPts.material.size = (pixel || evil ? 0.7 : isMobile ? 0.55 : 0.45);
      heartPts.material.needsUpdate = true;
    }
    dustMat.map = evil ? redSquare : pixel ? peachSquare : goldSprite;
    dustMat.color.set(evil ? 0x8a1020 : pixel ? 0xf0b8a0 : 0xb89060);
    dustMat.size = pixel || evil ? 0.65 : 0.5;
    dustMat.needsUpdate = true;
    embers.material.map = evil ? redSquare : pixel ? pinkSquare : roseSprite;
    embers.material.color.set(evil ? 0xff4455 : pixel ? 0xf8ecd8 : 0xc41e3a);
    embers.material.needsUpdate = true;
  }
  // read saved modes directly — this module may run before pixelate.js
  // has applied the body classes, which left the gothic bg after a refresh
  {
    const px = localStorage.getItem('bw_pixel_mode') === '1'
      || document.body.classList.contains('pixel-mode');
    const ev = localStorage.getItem('bw_evil') === '1'
      || document.body.classList.contains('evil-mode');
    if (px || ev) applyTheme(px, ev);
  }
  addEventListener('bw-pixel-mode', e => applyTheme(e.detail.on, !!e.detail.evil));

  // ── Parallax (mouse / touch / gyro-lite via scroll) ────────────
  let tx = 0, ty = 0;
  addEventListener('pointermove', e => {
    tx = (e.clientX / innerWidth - 0.5) * 2;
    ty = (e.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });
  addEventListener('scroll', () => {
    ty = Math.min(1, scrollY / 1200) * 0.8;
  }, { passive: true });

  // ── Animate ────────────────────────────────────────────────────
  const clock = new THREE.Clock();
  let running = true;
  document.addEventListener('visibilitychange', () => { running = !document.hidden; });

  function tick() {
    requestAnimationFrame(tick);
    if (!running) return;
    const t = clock.getElapsedTime();

    if (heartPts) {
      heartPts.rotation.y = Math.sin(t * 0.18) * 0.35;
      const beat = 1 + Math.pow(Math.max(0, Math.sin(t * 1.4)), 8) * 0.06; // heartbeat
      heartPts.scale.setScalar(beat);
      heartPts.material.opacity = 0.7 + Math.sin(t * 0.8) * 0.15;
    }

    // dust drifts upward, wraps
    const dp = dustGeo.attributes.position.array;
    for (let i = 0; i < DUST; i++) {
      dp[i * 3 + 1] += dustSpeed[i] * 0.012;
      if (dp[i * 3 + 1] > 42) dp[i * 3 + 1] = -42;
    }
    dustGeo.attributes.position.needsUpdate = true;
    dust.rotation.y = t * 0.012;
    embers.rotation.y = -t * 0.02;
    embers.rotation.x = Math.sin(t * 0.1) * 0.05;

    // camera parallax — eased
    camera.position.x += (tx * 4 - camera.position.x) * 0.03;
    camera.position.y += (-ty * 2.5 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  tick();

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
}
