// UnaniClear's shared models and helpers: the four humours and temperaments as Unani describes
// them, a small stylised person, books, flasks and jars, a seeded random generator, and the label,
// board and phone-layout helpers the chapters share (same patterns as CirculationClear).
//
// The humour model below is the system's OWN description, taken from its classical texts, not a
// finding of modern physiology. Sources for the model:
//  - Ibn Sina, al-Qanun fi al-Tibb (The Canon of Medicine, 1025), Book 1, on the elements, temperaments
//    (mizaj) and humours (akhlat); English: O. Cameron Gruner, "A Treatise on the Canon of Medicine
//    of Avicenna" (1930).
//  - WHO, "Benchmarks for the training of Unani medicine" (2022) and "Benchmarks for the practice of
//    Unani medicine" (2022): the humours dam (blood, hot and moist), balgham (phlegm, cold and
//    moist), safra (yellow bile, hot and dry) and sauda (black bile, cold and dry); the six
//    essential factors (asbab-e-sitta zarooriya); tabiyat (the body's own power of healing).
//  - CCRUM, "Unani System of Medicine: The Science of Health and Healing" (2016).
//  - Greek names and seasons: Wikipedia "Humorism" and "Four temperaments" (sanguine, phlegmatic,
//    choleric, melancholic; spring, winter, summer, autumn).
import { THREE, M, clamp } from './kit.js';

// ---------------------------------------------------------------- the four humours (as described)
// hot: +1 hot, -1 cold. wet: +1 moist, -1 dry.
export const HUMOURS = [
  { key: 'dam', name: 'Dam', en: 'blood', hot: 1, wet: 1, col: 0xe0404f, css: '#ff7a86', temper: 'Damvi', greek: 'sanguine', season: 'spring' },
  { key: 'balgham', name: 'Balgham', en: 'phlegm', hot: -1, wet: 1, col: 0xdfe7f0, css: '#dfe7f0', temper: 'Balghami', greek: 'phlegmatic', season: 'winter' },
  { key: 'safra', name: 'Safra', en: 'yellow bile', hot: 1, wet: -1, col: 0xf2c230, css: '#ffd166', temper: 'Safravi', greek: 'choleric', season: 'summer' },
  { key: 'sauda', name: 'Sauda', en: 'black bile', hot: -1, wet: -1, col: 0x3a3450, css: '#b9a8e8', temper: 'Saudavi', greek: 'melancholic', season: 'autumn' },
];

// Where a mix of humours sits on the hot–cold / moist–dry plane, and what Unani calls that mizaj.
// This is a teaching sketch of the idea (a weighted balance), not a formula from the texts.
export function mizajOf(w) {
  const tot = HUMOURS.reduce((a, h) => a + Math.max(0, w[h.key]), 0) || 1;
  let hot = 0, wet = 0;
  HUMOURS.forEach((h) => { const k = Math.max(0, w[h.key]) / tot; hot += h.hot * k; wet += h.wet * k; });
  const share = Object.fromEntries(HUMOURS.map((h) => [h.key, Math.max(0, w[h.key]) / tot]));
  const top = HUMOURS.reduce((a, h) => (share[h.key] > share[a.key] ? h : a), HUMOURS[0]);
  const near = Math.hypot(hot, wet) < 0.18;
  const q = (v, a, b) => (Math.abs(v) < 0.12 ? '' : v > 0 ? a : b);
  const words = [q(hot, 'hot', 'cold'), q(wet, 'moist', 'dry')].filter(Boolean).join(' and ');
  return { hot, wet, share, top, balanced: near, words: near ? 'balanced' : words || 'nearly balanced' };
}

// The six essential factors (asbab-e-sitta zarooriya), with the modern advice that overlaps.
export const SIX = [
  { key: 'air', name: 'Air', urdu: 'Hawa-e-muheet', en: 'the air around you', col: '#8ef0ff' },
  { key: 'food', name: 'Food and drink', urdu: 'Makool wa mashroob', en: 'what you eat and drink', col: '#ffd166' },
  { key: 'move', name: 'Movement and rest', urdu: 'Harkat wa sukoon-e-badani', en: 'bodily activity and rest', col: '#6ee7a8' },
  { key: 'mind', name: 'Emotions', urdu: 'Harkat wa sukoon-e-nafsani', en: 'mental activity and rest', col: '#ff9fc0' },
  { key: 'sleep', name: 'Sleep and waking', urdu: 'Naum wa yaqza', en: 'sleep and wakefulness', col: '#c9a7ff' },
  { key: 'out', name: 'Retention and elimination', urdu: 'Ihtibas wa istifragh', en: 'keeping in and letting out', col: '#ff8a5c' },
];

// ---------------------------------------------------------------- colours and label helpers
const TINT = { gold: '#ffd166', good: '#6ee7a8', side: '#8ef0ff', pink: '#ff9fc0', purple: '#c9a7ff', red: '#ff8a8a', blue: '#9db4ff', orange: '#ff8a5c', grey: '#aab2c5' };
export function tint(l, cls) { const c = TINT[cls] || cls; if (c) { l.element.style.borderColor = c; l.element.style.color = c; } return l; }
export const inReel = () => document.body.classList.contains('gb-reel');
// On a phone-width stage the readout covers the upper left: re-centre once, unless orbited.
export function fitNarrow(stage, view) {
  let done = false;
  return () => {
    const narrow = stage.host.clientWidth < 560;
    if (narrow && !done && !stage.moved && !inReel()) { stage.setView(view.pos, view.target, 0.01); done = true; }
    return narrow;
  };
}
// On phones keep only the readout's headline and two rows.
export function compactReadout(stage, api) {
  const full = api.readout;
  if (!full) return api;
  api.readout = (s) => {
    const html = full(s);
    if (stage.host.clientWidth >= 560 || !html) return html;
    let rows = 0;
    return html.replace(/<small>[\s\S]*?<\/small>/g, '').replace(/<div class="row">[\s\S]*?<\/div>/g, (m) => (++rows <= 2 ? m : ''));
  };
  return api;
}
export const rows = (list) => list.map(([a, b]) => `<div class="row"><span>${a}</span><b>${b}</b></div>`).join('');
// A flat board carrying a canvas chart.
export function board(ct, w, h) {
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: ct.tex, transparent: true, toneMapped: false, side: THREE.DoubleSide, depthWrite: false }));
}
export function rrect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
export const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
// Seeded generator (mulberry32) so a "run" of a trial is repeatable.
export function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
// Wrap text on a canvas; returns the y after the last line.
export function wrap(g, text, x, y, maxW, lh) {
  const words = text.split(' '); let line = '';
  for (const w of words) {
    const t = line ? line + ' ' + w : w;
    if (g.measureText(t).width > maxW && line) { g.fillText(line, x, y); y += lh; line = w; } else line = t;
  }
  if (line) { g.fillText(line, x, y); y += lh; }
  return y;
}

// ---------------------------------------------------------------- small models
export function capsule(a, b, r, mat) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), len = A.distanceTo(B);
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 16), mat);
  m.position.copy(A).add(B).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  m.castShadow = true;
  return m;
}

// A simple, respectful, clearly stylised person about 1.7 units tall, feet at y = 0.
export function person(mat, { h = 1.7 } = {}) {
  const g = new THREE.Group(), k = h / 1.7;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.12 * k, 24, 16), mat); head.position.y = 1.56 * k; head.castShadow = true;
  const torso = capsule([0, 0.98 * k, 0], [0, 1.3 * k, 0], 0.16 * k, mat);
  const legL = capsule([-0.08 * k, 0.08 * k, 0], [-0.08 * k, 0.8 * k, 0], 0.065 * k, mat);
  const legR = capsule([0.08 * k, 0.08 * k, 0], [0.08 * k, 0.8 * k, 0], 0.065 * k, mat);
  const armL = capsule([-0.23 * k, 1.36 * k, 0], [-0.27 * k, 0.86 * k, 0], 0.05 * k, mat);
  const armR = capsule([0.23 * k, 1.36 * k, 0], [0.27 * k, 0.86 * k, 0], 0.05 * k, mat);
  g.add(head, torso, legL, legR, armL, armR);
  g.userData.parts = { head, torso, legL, legR, armL, armR };
  return g;
}

// A closed book (the Canon, a pharmacopoeia...). Its spine faces -x.
export function book(color = 0x8a3b2e, w = 0.5, h = 0.12, d = 0.7) {
  const g = new THREE.Group();
  const cover = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M.matte(color)); cover.castShadow = true;
  const pages = new THREE.Mesh(new THREE.BoxGeometry(w * 0.94, h * 0.78, d * 0.96), M.matte(0xf3e7c8)); pages.position.x = w * 0.04;
  const band = new THREE.Mesh(new THREE.BoxGeometry(w * 0.06, h * 1.02, d * 1.01), M.metal(0xd8b25a, { roughness: 0.4 })); band.position.x = -w * 0.47;
  g.add(cover, pages, band);
  return g;
}

// A rolled scroll lying along x.
export function scroll(len = 0.7, r = 0.07) {
  const g = new THREE.Group();
  const paper = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 24), M.matte(0xefdcb0)); paper.rotation.z = Math.PI / 2;
  const endMat = M.matte(0x6b3a22);
  [-1, 1].forEach((sx) => { const e = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.45, r * 0.45, 0.08, 12), endMat); e.rotation.z = Math.PI / 2; e.position.x = sx * (len / 2 + 0.04); g.add(e); });
  g.add(paper);
  return g;
}

// A round-bottomed glass flask with a liquid whose level (0–1) and colour can change.
export function flask(r = 0.35, neck = 0.35, liquid = 0xe0404f) {
  const g = new THREE.Group();
  const glass = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 20), M.clear(0xdff3ff, 0.22)); glass.position.y = r;
  const neckM = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.28, r * 0.3, neck, 20, 1, true), M.clear(0xdff3ff, 0.25)); neckM.position.y = 2 * r + neck / 2 - r * 0.1;
  const liqMat = new THREE.MeshStandardMaterial({ color: liquid, roughness: 0.2, transparent: true, opacity: 0.88 });
  // Liquid as a sphere clipped by scaling a cap: approximate with a squashed sphere whose top rises.
  const liq = new THREE.Mesh(new THREE.SphereGeometry(r * 0.93, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), liqMat);
  liq.rotation.x = 0; liq.position.y = r;
  const top = new THREE.Mesh(new THREE.CircleGeometry(1, 32), liqMat); top.rotation.x = -Math.PI / 2;
  g.add(liq, top, glass, neckM);
  const setLevel = (k) => {
    k = clamp(k, 0.02, 0.98);
    // Fill height inside the sphere, from its bottom (0) to its top (2r).
    const hgt = 2 * r * 0.93 * k, y = hgt - r * 0.93;               // y relative to centre
    liq.geometry.dispose();
    const theta = Math.acos(clamp(y / (r * 0.93), -1, 1));         // polar angle of the surface, from the top
    liq.geometry = new THREE.SphereGeometry(r * 0.93, 32, 16, 0, Math.PI * 2, theta, Math.PI - theta);
    const rr = Math.sqrt(Math.max(0, (r * 0.93) ** 2 - y * y));
    top.scale.setScalar(Math.max(0.001, rr)); top.position.y = r + y;
  };
  setLevel(0.5);
  return { g, setLevel, liqMat, glass };
}

// A lidded jar (for majoon, khamira and the like).
export function jar(color = 0x6b3a22, fill = 0x8a4a1a, r = 0.22, h = 0.4) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.9, h, 28), M.clear(0xe8f4ff, 0.3)); body.position.y = h / 2;
  const content = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.9, r * 0.84, h * 0.72, 28), M.matte(fill)); content.position.y = h * 0.37;
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.05, r * 1.05, h * 0.14, 28), M.plastic(color)); lid.position.y = h + h * 0.05;
  g.add(content, body, lid); g.children.forEach((c) => { c.castShadow = true; });
  return g;
}
