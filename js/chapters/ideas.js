// Chapter 2: the ideas, in Unani's own terms. A temperament board (hot–cold across, moist–dry from
// front to back) with a flask for each humour at its corner. The glowing orb is the resulting
// mizaj. Season buttons push one humour up, as the classical texts describe, and "tabiyat" (the
// body's own healing power, in the system's description) pulls it back. A ring of six pillars
// shows the six essential factors.
// This is a model of what the system SAYS, not of what modern physiology measures. The weighted
// average that places the orb is our teaching sketch of "balance", not a formula from the texts.
// Sources: Ibn Sina, Canon Book 1 (Gruner's 1930 translation); WHO "Benchmarks for the training of
// Unani medicine" (2022); CCRUM, "Unani System of Medicine: The Science of Health and Healing"
// (2016, New Delhi); NHP India, "Unani" (nhp.gov.in); seasons and Greek names: Wikipedia "Humorism".
// European history: humoral medicine dominated European medicine until the 19th century; Rudolf
// Virchow's "Cellular Pathology" (1858) and the germ theory of Pasteur and Koch (1860s–1880s)
// replaced it (Britannica, "humour"; Wikipedia "Humorism").
import { THREE, M, clamp, canvasTexture, torus, approach } from '../kit.js';
import { HUMOURS, SIX, mizajOf, board, tint, fitNarrow, compactReadout, inReel, rows, flask } from '../unani.js';

const R = 2.6;             // half-size of the board's plotting area
const PRESET = {
  motadil: [0.5, 0.5, 0.5, 0.5], damvi: [0.9, 0.4, 0.45, 0.25], balghami: [0.35, 0.9, 0.25, 0.45], safravi: [0.45, 0.25, 0.9, 0.35], saudavi: [0.25, 0.45, 0.35, 0.9],
};
const SEASON = { spring: 'dam', summer: 'safra', autumn: 'sauda', winter: 'balgham' };

function drawBoard(g, w, h) {
  g.clearRect(0, 0, w, h);
  const m = 70, S = w - 2 * m;
  // Canvas: x right = hot, y down = moist (front of the board faces the viewer).
  const quads = { dam: [1, 1], balgham: [0, 1], safra: [1, 0], sauda: [0, 0] };
  HUMOURS.forEach((hm) => {
    const [cx, cy] = quads[hm.key];
    const grd = g.createRadialGradient(m + cx * S, m + cy * S, 10, m + cx * S, m + cy * S, S * 0.75);
    grd.addColorStop(0, hm.css + '55'); grd.addColorStop(1, hm.css + '00');
    g.fillStyle = grd; g.fillRect(m + cx * S / 2, m + cy * S / 2, S / 2, S / 2);
  });
  g.fillStyle = 'rgba(12,14,20,0.55)'; g.fillRect(m, m, S, S);
  g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 3; g.strokeRect(m, m, S, S);
  g.strokeStyle = 'rgba(255,255,255,0.1)'; g.lineWidth = 2;
  for (let i = 1; i < 8; i++) { g.beginPath(); g.moveTo(m + i * S / 8, m); g.lineTo(m + i * S / 8, m + S); g.stroke(); g.beginPath(); g.moveTo(m, m + i * S / 8); g.lineTo(m + S, m + i * S / 8); g.stroke(); }
  g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 4;
  g.beginPath(); g.moveTo(m, m + S / 2); g.lineTo(m + S, m + S / 2); g.stroke();
  g.beginPath(); g.moveTo(m + S / 2, m); g.lineTo(m + S / 2, m + S); g.stroke();
  // balanced zone
  g.strokeStyle = 'rgba(110,231,168,0.8)'; g.setLineDash([12, 10]); g.beginPath(); g.arc(m + S / 2, m + S / 2, S * 0.09, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
  g.font = '600 40px system-ui, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#ff9a6a';
  g.fillText('HOT →', m + S - 90, m + S / 2 - 16); g.fillStyle = '#8ec8ff'; g.fillText('← COLD', m + 100, m + S / 2 - 16);
  g.save(); g.translate(m + S / 2 + 20, m + S - 110); g.rotate(-Math.PI / 2); g.fillStyle = '#8ef0ff'; g.fillText('MOIST', 0, 0); g.restore();
  g.save(); g.translate(m + S / 2 + 20, m + 110); g.rotate(-Math.PI / 2); g.fillStyle = '#e8c38a'; g.fillText('DRY', 0, 0); g.restore();
  g.font = 'italic 44px Georgia, serif'; g.fillStyle = 'rgba(255,255,255,0.75)';
  [['Damvi', 0.78, 0.82], ['Balghami', 0.22, 0.82], ['Safravi', 0.78, 0.2], ['Saudavi', 0.22, 0.2]].forEach(([t, x, y]) => g.fillText(t, m + x * S, m + y * S));
  g.font = '28px system-ui, sans-serif'; g.fillStyle = 'rgba(255,255,255,0.45)';
  [['sanguine', 0.78, 0.87], ['phlegmatic', 0.22, 0.87], ['choleric', 0.78, 0.25], ['melancholic', 0.22, 0.25]].forEach(([t, x, y]) => g.fillText(t, m + x * S, m + y * S));
  g.fillStyle = 'rgba(110,231,168,0.9)'; g.font = '600 28px system-ui, sans-serif'; g.fillText('Motadil', m + S / 2, m + S / 2 + S * 0.09 + 34);
}

export default {
  id: 'ideas',
  short: 'Humours and mizaj',
  title: 'Four humours, one temperament',
  subtitle: 'The core ideas of Unani, as the system itself describes them.',
  view: { pos: [-1.4, 14.5, 8.2], target: [-1.8, 0, -2.6] },
  learn: `<p>This chapter explains Unani <b>in its own terms</b>, the way its classical books and today's hakims describe it. The next chapters look at how it works in practice and what science has found.</p>
    <p>Unani teaches that the body holds four fluids, the <b>akhlat</b> or <b>humours</b>: <b>dam</b> (blood, hot and moist), <b>balgham</b> (phlegm, cold and moist), <b>safra</b> (yellow bile, hot and dry) and <b>sauda</b> (black bile, cold and dry). Their mix gives each person a <b>mizaj</b>, or temperament. Someone with more dam is called <b>damvi</b>, with more balgham <b>balghami</b>, and so on. A well-balanced mizaj is <b>motadil</b>.</p>
    <p>In this view, health means your humours are in the right balance for <i>your</i> mizaj, and illness means they have drifted. The body's own healing power, <b>tabiyat</b>, is said to keep pushing them back. The hakim's job is to help it.</p>
    <p>Six things are said to shape the balance, the <b>asbab-e-sitta zarooriya</b> or six essential factors: the <b>air</b> you breathe, <b>food and drink</b>, <b>movement and rest</b>, <b>emotions</b>, <b>sleep and waking</b>, and <b>retention and elimination</b> (what the body keeps and lets out).</p>
    <p>Europe used the same Greek humours for about 2,000 years. English still carries them: <b>sanguine</b> (cheerful, from blood), <b>phlegmatic</b> (calm), <b>choleric</b> (angry) and <b>melancholy</b> (from “black bile”). European doctors dropped humours in the 1800s, when cells, germs and chemistry explained disease better (chapter 4). Unani kept and developed them.</p>
    <p class="tip"><b>Try it:</b> press a temperament, then a season, and watch the orb move. Switch tabiyat off and on to see the “pull back to balance” the system describes. This is a picture of the idea, not a measurement of anyone's body.</p>`,
  terms: [
    { t: 'Akhlat (humours)', d: 'The four body fluids of Unani theory: dam, balgham, safra and sauda.' },
    { t: 'Mizaj (temperament)', d: 'A person’s blend of hot or cold and moist or dry, set by the humours.' },
    { t: 'Motadil', d: 'Balanced: the mizaj Unani treats as ideal.' },
    { t: 'Tabiyat', d: 'In Unani, the body’s own power to keep itself in balance and heal.' },
    { t: 'Asbab-e-sitta zarooriya', d: 'The six essential factors: air, food and drink, movement and rest, emotions, sleep and waking, retention and elimination.' },
    { t: 'Humorism', d: 'The Greek theory of four humours, used in Europe until the 1800s and still central to Unani.' },
  ],
  defaults: { dam: 0.5, balgham: 0.5, safra: 0.5, sauda: 0.5, tabiyat: true, six: true, labels: true },
  controls: [
    { key: 'temper', type: 'buttons', label: 'Pick a temperament', items: Object.entries(PRESET).map(([k, v]) => ({ label: k[0].toUpperCase() + k.slice(1), act: (s, inst) => { HUMOURS.forEach((h, i) => { s[h.key] = v[i]; }); inst.clear?.(); } })) },
    ...HUMOURS.map((h) => ({ key: h.key, type: 'range', label: `${h.name} (${h.en}, ${h.hot > 0 ? 'hot' : 'cold'} and ${h.wet > 0 ? 'moist' : 'dry'})`, min: 0, max: 1, step: 0.01, fmt: (v) => Math.round(v * 100) + '%' })),
    { key: 'season', type: 'buttons', label: 'A season arrives (as the texts describe)', items: Object.entries(SEASON).map(([k, hk]) => ({ label: k[0].toUpperCase() + k.slice(1), act: (s, inst) => inst.push?.(hk) })) },
    { key: 'tabiyat', type: 'toggle', label: 'Tabiyat: the pull back to balance', hint: 'As Unani describes it. Switch it off and a season’s push stays.' },
    { key: 'six', type: 'toggle', label: 'Show the six essential factors' },
    { key: 'labels', type: 'toggle', label: 'Labels' },
  ],
  quiz: [
    { q: 'In Unani, which humour is described as hot and moist?', options: ['Balgham (phlegm)', 'Dam (blood)', 'Sauda (black bile)', 'Safra (yellow bile)'], answer: 1, why: 'Dam is hot and moist, balgham cold and moist, safra hot and dry, sauda cold and dry.' },
    { q: 'What does “tabiyat” mean in Unani?', options: ['A herbal paste', 'The pulse', 'The body’s own power to keep balance and heal', 'A type of cupping'], answer: 2, why: 'Unani sees the hakim as a helper of tabiyat, the body’s own healing power.' },
    { q: 'Why did European doctors stop using the four humours in the 1800s?', options: ['A king banned them', 'Cells, germs and chemistry explained disease better', 'They ran out of books', 'Humours were too hard to spell'], answer: 1, why: 'Cellular pathology and germ theory gave explanations that could be tested and that led to treatments that worked.' },
  ],
  reel: [
    { ms: 5200, caption: 'Unani describes four humours: blood, phlegm, yellow bile and black bile.', set: { dam: 0.5, balgham: 0.5, safra: 0.5, sauda: 0.5, tabiyat: true, six: false, labels: false }, anim: { safra: [0.5, 0.95], balgham: [0.5, 0.25] }, view: { pos: [0, 7.6, 4.6], target: [0, 0, 0] }, spin: 0.4 },
    { ms: 5000, caption: 'Their mix is your mizaj, and six everyday factors are said to tip the balance.', set: { dam: 0.8, balgham: 0.4, safra: 0.45, sauda: 0.3, tabiyat: true, six: true, labels: false }, view: { pos: [0, 8.6, 5.4], target: [0, 0, 0] }, spin: 0.5 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const bt = canvasTexture(1400, 1400, drawBoard);
    const plate = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.2, 6.6), M.matte(0x3a2a1c)); plate.position.y = -0.1; plate.receiveShadow = true;
    const face = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 6.6), new THREE.MeshStandardMaterial({ map: bt.tex, roughness: 0.8 }));
    face.rotation.x = -Math.PI / 2; face.position.y = 0.005; face.receiveShadow = true;
    root.add(plate, face);

    // Flasks at the corners.
    const pos = { dam: [1, 1], balgham: [-1, 1], safra: [1, -1], sauda: [-1, -1] };
    const fl = {};
    HUMOURS.forEach((h) => {
      const f = flask(0.42, 0.45, h.col); const [x, z] = pos[h.key];
      f.g.position.set(x * 4.0, 0, z * 4.0); root.add(f.g); fl[h.key] = f;
      const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.08, 32), M.matte(0x2a2f3a)); ped.position.set(x * 4.0, 0.04, z * 4.0); root.add(ped);
      f.g.position.y = 0.08;
      if (h.key === 'balgham') { f.liqMat.opacity = 0.7; }
      if (h.key === 'sauda') { f.liqMat.color.set(0x2a2438); }
    });
    // The mizaj orb, its post, and a trail.
    const orbMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.6, roughness: 0.3 });
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.26, 32, 16), orbMat); orb.castShadow = true;
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 16), M.ghost(0xffffff, 0.18));
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1, 8), M.glow(0xffffff, { transparent: true, opacity: 0.5 }));
    const home = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.3, 32), M.glow(0x6ee7a8, { transparent: true, opacity: 0.8, side: THREE.DoubleSide })); home.rotation.x = -Math.PI / 2; home.position.y = 0.02;
    root.add(orb, glow, post, home);
    const TR = 60, trailPts = new Float32Array(TR * 3);
    const trailG = new THREE.BufferGeometry(); trailG.setAttribute('position', new THREE.BufferAttribute(trailPts, 3));
    const trail = new THREE.Line(trailG, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 }));
    root.add(trail);

    // Six factors ring.
    const ring = new THREE.Group(); root.add(ring);
    const loop = torus(5.0, 0.03, M.glow(0x6ee7a8, { transparent: true, opacity: 0.35 }), 128); loop.rotation.x = Math.PI / 2; ring.add(loop);
    const sixL = [];
    const beacons = SIX.map((f, i) => {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6, x = Math.cos(a) * 5.0, z = Math.sin(a) * 5.0;
      const col = new THREE.Color(f.col);
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.9, 20), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.25, roughness: 0.5 }));
      p.position.set(x, 0.45, z); p.castShadow = true;
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 12), M.glow(col)); b.position.set(x, 1.05, z);
      ring.add(p, b);
      sixL.push(tint(stage.label(f.name, [x, 1.5, z], ring), f.col));
      return b;
    });
    const labs = HUMOURS.map((h) => { const [x, z] = pos[h.key]; return tint(stage.label(`${h.name} · ${h.en}`, [x * 4.0, 1.75, z * 4.0], root), h.css); });
    const tag = tint(stage.label('As described in Unani, not a body measurement', [0, 0.1, 3.7], root), 'grey');

    const extra = { dam: 0, balgham: 0, safra: 0, sauda: 0 };
    let t = 0, cur = null, trailN = 0;
    const eff = (s) => Object.fromEntries(HUMOURS.map((h) => [h.key, clamp(s[h.key] + extra[h.key], 0, 2)]));
    const fit = fitNarrow(stage, { pos: [0, 8.5, 5.0], target: [0, 0, -2.4] });
    const api = compactReadout(stage, {
      push(k) { extra[k] = Math.min(1.2, extra[k] + 0.7); },
      clear() { Object.keys(extra).forEach((k) => { extra[k] = 0; }); },
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        if (s.tabiyat) Object.keys(extra).forEach((k) => { extra[k] = approach(extra[k], 0, 0.45, dt); });
        const e = eff(s), mz = mizajOf(e);
        const tx = mz.hot * R * 1.0, tz = mz.wet * R * 1.0;
        if (!cur) cur = new THREE.Vector3(tx, 0.55, tz);
        cur.x = approach(cur.x, tx, 5, dt); cur.z = approach(cur.z, tz, 5, dt); cur.y = 0.55 + 0.05 * Math.sin(t * 2.4);
        orb.position.copy(cur); glow.position.copy(cur);
        post.position.set(cur.x, cur.y / 2, cur.z); post.scale.y = cur.y;
        // Orb colour: a blend of the humour colours by share.
        const c = new THREE.Color(0, 0, 0);
        HUMOURS.forEach((h) => c.add(new THREE.Color(h.key === 'sauda' ? 0x8a7ab8 : h.col).multiplyScalar(mz.share[h.key])));
        orbMat.color.copy(c); orbMat.emissive.copy(c); glow.material.color.copy(c);
        glow.scale.setScalar(1 + 0.12 * Math.sin(t * 3));
        home.material.opacity = mz.balanced ? 0.95 : 0.4;
        // Trail
        if ((t * 20 | 0) !== trailN) { trailN = t * 20 | 0; trailPts.copyWithin(3, 0, (TR - 1) * 3); trailPts[0] = cur.x; trailPts[1] = 0.03; trailPts[2] = cur.z; trailG.attributes.position.needsUpdate = true; }
        HUMOURS.forEach((h) => { fl[h.key].setLevel(0.1 + 0.85 * clamp(mz.share[h.key] * 2, 0, 1)); });
        ring.visible = s.six;
        beacons.forEach((b, i) => { b.scale.setScalar(1 + 0.2 * Math.sin(t * 2 + i)); });
        const narrow = fit(), on = s.labels && !inReel();
        labs.forEach((l) => { l.visible = on; });
        sixL.forEach((l) => { l.visible = on && s.six && !narrow; });
        tag.visible = on;
      },
      readout: (s) => {
        const e = eff(s), mz = mizajOf(e);
        const name = mz.balanced ? 'Motadil (balanced)' : `${mz.top.temper}: ${mz.words}`;
        return `<div class="big">${name}</div>${rows(HUMOURS.map((h) => [`${h.name} (${h.en})`, Math.round(mz.share[h.key] * 100) + '%']))}<small>The system’s own model, drawn as a picture. It is not a measurement of your body.</small>`;
      },
    });
    return api;
  },
};
