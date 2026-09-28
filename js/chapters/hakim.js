// Chapter 3: how a hakim works. Five stations on a long table:
//  1. nabz (pulse) at the wrist, with a live pulse trace;
//  2. qaroora (the urine flask) with an 8-step colour chart;
//  3. hijama (cupping) on a back, with the vacuum worked out from gas physics;
//  4. ilaj bil ghiza (diet), foods tagged hot/cold, moist/dry as classical texts class them;
//  5. ilaj bil dawa (medicines): majoon, khamira and an alembic distilling an arq.
// Sources:
//  - Diagnosis by nabz, baul (urine) and baraz (stool); ilaj bil tadbeer (regimental therapy,
//    including hijama, dalak/massage, riyazat/exercise), ilaj bil ghiza (dietotherapy), ilaj bil
//    dawa (pharmacotherapy) and jarahat (surgery): CCRUM, "Unani System of Medicine: The Science of
//    Health and Healing" (2016); NHP India, "Unani"; WHO "Benchmarks for the practice of Unani
//    medicine" (2022). Ilaj bil zid (treatment by opposites): same sources.
//  - Dosage forms: majoon (semi-solid, in honey or sugar syrup), khamira (a semi-solid confection),
//    arq (a distillate), sharbat (syrup): National Formulary of Unani Medicine and Unani Pharmacopoeia
//    of India (Ministry of AYUSH / PCIM&H, Ghaziabad).
//  - Ibn Sina's pulse features (size, strength, speed, rhythm and others): Canon Book 1.
//  - Resting pulse in adults 60–100 beats per minute (American Heart Association, "Target heart
//    rates"); the modern dicrotic-notch waveform shape (Guyton & Hall, 14th ed., ch. 15).
//  - Urine colour chart of 8 shades from pale to dark (Armstrong et al., Int J Sport Nutr 4:265,
//    1994); darker usually means more concentrated. Dipstick tests: glucose, protein, blood.
//  - Fire cupping: air warmed to T_hot is sealed on skin and cools to about skin temperature
//    (33 °C = 306 K); at constant volume P = P0 · T_skin / T_hot (Gay-Lussac's law). Skin pulled
//    into the cup reduces the volume, so real vacuums are smaller than this upper bound.
//  - Water boils at 100 °C at sea level (and about 95 °C at 1,600 m).
//  - Food classes: honey (asal) and ginger (zanjabeel) hot and dry; cucumber (khiyar) and bottle
//    gourd (kaddu) cold and moist: National Formulary of Unani Medicine; CCRUM monographs.
import { THREE, M, clamp, lerp, canvasTexture, tube, approach } from '../kit.js';
import { board, tint, fitNarrow, compactReadout, inReel, rows, rrect, capsule, flask, jar } from '../unani.js';

const ST = {
  nabz: { label: 'Nabz (pulse)', x: -8 },
  qaroora: { label: 'Qaroora (urine)', x: -4 },
  hijama: { label: 'Hijama (cupping)', x: 0 },
  ghiza: { label: 'Ghiza (diet)', x: 4 },
  dawa: { label: 'Dawa (medicines)', x: 8 },
};
const URINE = ['#fbf8e2', '#f6efb4', '#f1e38a', '#ead166', '#dfba45', '#cf9d31', '#b67f25', '#8f5d1c'];
const P0 = 101.325, TSKIN = 306.15;
export const cupVacuum = (tC) => P0 * (1 - TSKIN / (tC + 273.15));    // kPa below atmospheric

// Pressure pulse shape over one beat, 0..1: fast upstroke, dicrotic notch, slow fall.
function pulseShape(ph) {
  const up = Math.exp(-((ph - 0.12) ** 2) / 0.004);
  const notch = 0.35 * Math.exp(-((ph - 0.38) ** 2) / 0.003);
  const fall = Math.exp(-Math.max(0, ph - 0.12) * 3.2) * (ph > 0.12 ? 1 : 0);
  return clamp(0.15 + 0.55 * Math.max(up, fall * 0.9) + notch * 0.5, 0, 1);
}

export default {
  id: 'hakim',
  short: 'How a hakim works',
  title: 'Pulse, flask, cup and jar',
  subtitle: 'How a hakim examines a patient and what the treatments are.',
  view: { pos: [-8.5, 4.6, 7.4], target: [-8.9, 0.5, -0.9] },
  learn: `<p>A visit to a hakim starts with questions about your life: food, sleep, work, mood, the season. Then comes the examination. The classic three are the <b>nabz</b> (pulse), the <b>baul</b> (urine, looked at in a glass flask called a <b>qaroora</b>) and the <b>baraz</b> (stool). Ibn Sina described many features of the pulse: its size, strength, speed and rhythm. Hakims use them to judge the patient's mizaj.</p>
    <p>Treatment follows a rule called <b>ilaj bil zid</b>, treating by opposites: a “hot” imbalance gets “cold” measures, and so on. It comes in four main kinds:</p>
    <p><b>Ilaj bil tadbeer</b>, regimental therapy: changes to routine, <b>riyazat</b> (exercise), <b>dalak</b> (massage), baths and <b>hijama</b> (cupping). In cupping, a cup is made airless enough to suck the skin up. <b>Dry</b> cupping just pulls. <b>Wet</b> cupping first makes tiny cuts so a little blood is drawn.</p>
    <p><b>Ilaj bil ghiza</b>, diet therapy: foods are classed hot or cold, moist or dry, and chosen to balance you. <b>Ilaj bil dawa</b>, medicines: mostly plant-based, sometimes with animal or mineral parts. Common forms are <b>majoon</b> (a paste in honey or syrup), <b>khamira</b> (a soft confection), <b>sharbat</b> (syrup) and <b>arq</b> (a liquid distilled from herbs, like rose water). A fourth kind, <b>jarahat</b>, is surgery.</p>
    <p>Recipes are written down in India's official <b>Unani Pharmacopoeia</b> and <b>National Formulary</b>. Whether the treatments work is a separate question: chapter 5.</p>
    <p class="tip"><b>Try it:</b> visit each station. At the cup, change how hot the air was when the cup went on, and watch the vacuum. It is the same gas law that crushes a heated can.</p>`,
  terms: [
    { t: 'Nabz', d: 'The pulse, felt at the wrist. Hakims read many features of it.' },
    { t: 'Qaroora', d: 'The glass flask used to look at a urine sample.' },
    { t: 'Ilaj bil zid', d: 'Treatment by opposites: countering a “hot” imbalance with “cold” measures, and so on.' },
    { t: 'Ilaj bil tadbeer', d: 'Regimental therapy: exercise, massage, baths, cupping and changes to routine.' },
    { t: 'Hijama', d: 'Cupping. Dry cupping only sucks the skin; wet cupping also draws a little blood through small cuts.' },
    { t: 'Majoon, khamira, arq', d: 'Unani medicine forms: a paste in honey or syrup, a soft confection, and a distilled herbal water.' },
  ],
  defaults: { station: 'nabz', bpm: 72, shade: 3, cupT: 120, wet: false, heat: true, labels: true },
  controls: [
    { key: 'station', type: 'seg', label: 'Station', options: Object.entries(ST).map(([v, o]) => ({ v, label: o.label.split(' ')[0] })), fmt: (v) => ST[v].label },
    { key: 'bpm', type: 'range', label: 'Pulse rate (nabz)', min: 40, max: 160, step: 1, fmt: (v) => Math.round(v) + ' beats/min' },
    { key: 'shade', type: 'range', label: 'Urine colour (qaroora)', min: 1, max: 8, step: 1, ends: ['pale', 'dark'], fmt: (v) => 'shade ' + v + ' of 8' },
    { key: 'cupT', type: 'range', label: 'Air in the cup when placed (hijama)', min: 35, max: 200, step: 1, fmt: (v) => Math.round(v) + ' °C' },
    { key: 'wet', type: 'toggle', label: 'Wet cupping (small cuts)' },
    { key: 'heat', type: 'toggle', label: 'Heat the still (arq)' },
    { key: 'labels', type: 'toggle', label: 'Labels' },
  ],
  onChange(s, key) {
    if (key === 'bpm') s.station = 'nabz';
    if (key === 'shade') s.station = 'qaroora';
    if (key === 'cupT' || key === 'wet') s.station = 'hijama';
    if (key === 'heat') s.station = 'dawa';
  },
  quiz: [
    { q: 'What is “nabz” in Unani?', options: ['A herbal syrup', 'The pulse', 'A cupping cup', 'The stool'], answer: 1, why: 'Nabz is the pulse. Hakims feel it at the wrist and read many features of it.' },
    { q: 'Air at 120 °C is sealed in a cup on skin and cools to 33 °C. Its pressure…', options: ['Rises', 'Stays the same', 'Falls, so the cup sucks the skin up', 'Turns to steam'], answer: 2, why: 'At fixed volume, gas pressure is proportional to absolute temperature: 306 K / 393 K ≈ 0.78, a fall of about 22 kPa.' },
    { q: 'What does “ilaj bil zid” mean?', options: ['Treatment by opposites', 'Surgery', 'Diet by season', 'Massage'], answer: 0, why: 'It is the rule that a hot imbalance is treated with cold measures, a moist one with dry, and so on.' },
  ],
  reel: [
    { ms: 5200, caption: 'A hakim reads the pulse; in hijama, air cooling in a sealed cup sucks up the skin.', set: { station: 'hijama', cupT: 40, wet: false, labels: false }, anim: { cupT: [40, 170] }, view: { pos: [0.2, 2.3, 3.4], target: [0, 0.6, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const wood = M.matte(0x5a3b24), skin = M.matte(0xc98c63), skin2 = M.matte(0xb57a54);
    const top = new THREE.Mesh(new THREE.BoxGeometry(20, 0.16, 3.2), wood); top.position.y = -0.08; top.receiveShadow = true; root.add(top);
    const cloth = new THREE.Mesh(new THREE.BoxGeometry(20.2, 0.02, 1.2), M.matte(0x2f5a4a)); cloth.position.set(0, 0.01, 1.1); root.add(cloth);

    // ---- 1. Nabz: a forearm with three fingertips on the radial artery, and a pulse trace.
    const nx = ST.nabz.x;
    const arm = capsule([nx - 1.6, 0.3, 0.3], [nx + 0.6, 0.3, 0.3], 0.26, skin); root.add(arm);
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.2, 0.55), skin); hand.position.set(nx + 1.05, 0.26, 0.3); hand.castShadow = true; root.add(hand);
    const artery = tube([[nx - 1.2, 0.54, 0.46], [nx + 0.6, 0.54, 0.46]], 0.035, M.plastic(0xd8323c), false, 20); root.add(artery);
    const bulge = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 10), M.plastic(0xff4a5a)); root.add(bulge);
    const fingers = [0, 1, 2].map((i) => { const f = capsule([nx - 0.1 + i * 0.26, 0.62, 0.55], [nx - 0.1 + i * 0.26, 0.9, 1.05], 0.075, skin2); root.add(f); return f; });
    const st = { hist: new Float32Array(300), n: 0 };
    const trace = canvasTexture(900, 360, (g, w, h) => {
      g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(10,12,18,0.85)'; rrect(g, 0, 0, w, h, 26); g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.08)'; g.lineWidth = 2; for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(0, i * h / 6); g.lineTo(w, i * h / 6); g.stroke(); }
      g.strokeStyle = '#ff5a6a'; g.lineWidth = 5; g.beginPath();
      for (let i = 0; i < 300; i++) { const v = st.hist[(st.n + i) % 300], x = 30 + (i / 299) * (w - 60), y = h - 40 - v * (h - 110); i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke();
      g.fillStyle = '#fff'; g.font = '600 34px system-ui, sans-serif'; g.fillText('Pulse at the wrist', 30, 50);
    });
    const tb = board(trace, 2.6, 1.04); tb.position.set(nx - 0.3, 1.25, -0.9); root.add(tb);

    // ---- 2. Qaroora: the flask and an 8-shade colour chart.
    const qx = ST.qaroora.x;
    const q = flask(0.42, 0.55, 0xf1e38a); q.g.position.set(qx - 0.4, 0, 0.3); q.setLevel(0.6); root.add(q.g);
    const chart = canvasTexture(900, 220, (g, w, h) => {
      g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(10,12,18,0.85)'; rrect(g, 0, 0, w, h, 20); g.fill();
      URINE.forEach((c, i) => { g.fillStyle = c; rrect(g, 24 + i * 106, 70, 94, 120, 10); g.fill(); g.fillStyle = '#222'; g.font = '600 30px system-ui'; g.fillText(String(i + 1), 60 + i * 106, 140); });
      g.fillStyle = '#fff'; g.font = '600 32px system-ui'; g.fillText('Colour chart: pale  →  dark', 24, 48);
    });
    const cb = board(chart, 2.2, 0.54); cb.position.set(qx + 0.7, 0.62, -0.5); cb.rotation.x = -0.35; root.add(cb);
    const marker = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 12), M.glow(0xffffff)); marker.rotation.x = Math.PI; root.add(marker);

    // ---- 3. Hijama: a back (lying face down) with three cups.
    const hx = ST.hijama.x;
    const back = new THREE.Mesh(new THREE.CapsuleGeometry(0.62, 2.2, 8, 24), skin); back.rotation.z = Math.PI / 2; back.scale.set(1, 1, 0.55); back.position.set(hx, 0.32, 0.25); back.castShadow = true; root.add(back);
    const headB = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 16), skin); headB.position.set(hx - 1.95, 0.32, 0.25); root.add(headB);
    const cups = [-0.6, 0.15, 0.9].map((dx) => {
      const g = new THREE.Group(); g.position.set(hx + dx, 0.66, 0.25);
      const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.42, 32, 1, true), M.clear(0xdff3ff, 0.3)); glass.position.y = 0.21;
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.clear(0xdff3ff, 0.3)); cap.position.y = 0.42;
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.02, 8, 32), M.clear(0xdff3ff, 0.5)); rim.rotation.x = Math.PI / 2;
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.matte(0xd9826a)); dome.scale.y = 0.01;
      const drops = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x9a1020, transparent: true, opacity: 0.0, roughness: 0.3 })); drops.scale.y = 0.2;
      g.add(dome, drops, glass, cap, rim); root.add(g);
      return { g, dome, drops };
    });
    const gs = { T: 120 };
    const gauge = canvasTexture(640, 300, (g, w, h) => {
      g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(10,12,18,0.85)'; rrect(g, 0, 0, w, h, 24); g.fill();
      const dP = cupVacuum(gs.T), k = clamp(dP / 40, 0, 1), cx = w / 2, cy = h - 40, r = 190;
      g.lineWidth = 26; g.strokeStyle = 'rgba(255,255,255,0.12)'; g.beginPath(); g.arc(cx, cy, r, Math.PI, 0); g.stroke();
      g.strokeStyle = '#8ef0ff'; g.beginPath(); g.arc(cx, cy, r, Math.PI, Math.PI + k * Math.PI); g.stroke();
      g.fillStyle = '#fff'; g.font = '600 56px system-ui'; g.textAlign = 'center'; g.fillText(`−${dP.toFixed(0)} kPa`, cx, cy - 40);
      g.font = '28px system-ui'; g.fillStyle = 'rgba(255,255,255,0.7)'; g.fillText('suction inside the cup (0 to 40)', cx, cy - 110);
    });
    const gb = board(gauge, 1.6, 0.75); gb.position.set(hx + 0.2, 1.75, -0.6); root.add(gb);

    // ---- 4. Ghiza: a plate of foods classed by quality.
    const gx = ST.ghiza.x;
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 0.9, 0.08, 48), M.plastic(0xeeeeee)); plate.position.set(gx, 0.04, 0.3); root.add(plate);
    const foods = [
      { name: 'Honey (asal)', q: 'hot and dry', col: 0xe8a524, mk: () => { const g = jar(0x8a5a1a, 0xe8a524, 0.18, 0.3); return g; }, at: [-0.5, -0.35] },
      { name: 'Ginger (zanjabeel)', q: 'hot and dry', col: 0xd9b27a, mk: () => { const g = new THREE.Group(); [0, 1, 2].forEach((i) => { const c = capsule([i * 0.14 - 0.14, 0.08, 0], [i * 0.14 - 0.08, 0.1 + i * 0.03, 0.16], 0.06, M.matte(0xd9b27a)); g.add(c); }); return g; }, at: [0.45, -0.4] },
      { name: 'Cucumber (khiyar)', q: 'cold and moist', col: 0x4f9a4a, mk: () => { const g = new THREE.Group(); g.add(capsule([-0.3, 0.1, 0], [0.3, 0.1, 0], 0.09, M.matte(0x3f7f3a))); return g; }, at: [-0.4, 0.45] },
      { name: 'Bottle gourd (kaddu)', q: 'cold and moist', col: 0x9ccf6a, mk: () => { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 14), M.matte(0x9ccf6a)); b.position.y = 0.2; b.scale.set(1, 0.9, 1); const n = capsule([0, 0.3, 0], [0.12, 0.55, 0], 0.09, M.matte(0x9ccf6a)); g.add(b, n); return g; }, at: [0.45, 0.4] },
    ];
    const foodL = foods.map((f) => { const o = f.mk(); o.position.set(gx + f.at[0], 0.08, 0.3 + f.at[1]); root.add(o); return tint(stage.label(`${f.name}<br><small style="opacity:.8">${f.q}</small>`, [gx + Math.sign(f.at[0]) * 1.25, f.at[1] < 0 ? 1.15 : 0.5, 0.3 + f.at[1] * 2.2], root), f.q.startsWith('hot') ? 'orange' : 'side'); });

    // ---- 5. Dawa: jars of majoon and khamira, and an alembic distilling an arq.
    const dx = ST.dawa.x;
    const j1 = jar(0x6b3a22, 0x5a2a14); j1.position.set(dx - 1.8, 0, 0.9); root.add(j1);
    const j2 = jar(0x2f5a4a, 0xe6b8c8); j2.position.set(dx - 0.8, 0, 1.0); root.add(j2);
    const j3 = jar(0x3a3450, 0xb8382a, 0.16, 0.5); j3.position.set(dx - 1.3, 0, 0.1); root.add(j3);
    const still = flask(0.4, 0.3, 0x7fbf7a); still.g.position.set(dx - 0.1, 0.35, -0.3); still.setLevel(0.55); root.add(still.g);
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.35, 24, 1, true), M.metal(0x6a6f78, { side: THREE.DoubleSide })); stand.position.set(dx - 0.1, 0.175, -0.3); root.add(stand);
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 16), M.glow(0xff8a2a, { transparent: true, opacity: 0.9 })); flame.position.set(dx - 0.1, 0.17, -0.3); root.add(flame);
    const pipe = tube([[dx - 0.1, 1.35, -0.3], [dx + 0.3, 1.5, -0.3], [dx + 1.3, 1.0, -0.3], [dx + 1.6, 0.62, -0.3]], 0.045, M.clear(0xdff3ff, 0.5), false, 60); root.add(pipe);
    const condenser = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.9, 20), M.clear(0x8ec8ff, 0.3)); condenser.position.set(dx + 0.8, 1.25, -0.3); condenser.rotation.z = Math.PI / 2 + 0.47; root.add(condenser);
    const recv = flask(0.28, 0.25, 0xeaf6ff); recv.g.position.set(dx + 1.6, 0, -0.3); recv.setLevel(0.05); root.add(recv.g);
    const drip = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), M.glow(0xcfe8ff)); root.add(drip);
    const steam = Array.from({ length: 10 }, () => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), M.ghost(0xffffff, 0.4)); root.add(m); return m; });
    const dawaL = [
      tint(stage.label('Majoon', [dx - 1.9, 0.6, 1.0], root), 'gold'),
      tint(stage.label('Khamira', [dx - 0.7, 0.6, 1.15], root), 'pink'),
      tint(stage.label('Sharbat', [dx - 1.3, 1.0, 0.1], root), 'red'),
      tint(stage.label('Arq: distilled herb water', [dx + 1.6, 0.9, -0.3], root), 'side'),
    ];

    const stL = Object.entries(ST).map(([k, o]) => tint(stage.label(o.label, [o.x, 2.35, 0], root), 'gold'));
    const views = Object.fromEntries(Object.entries(ST).map(([k, o]) => [k, { pos: [o.x - 0.5, 4.6, 7.4], target: [o.x - 0.9, 0.5, -0.9] }]));
    let t = 0, beat = 0, lastSt = null, collected = 0, acc = 0, dripY = 0;
    const near = (v) => { const f = stage.host.clientWidth < 560 ? 0.6 : 1; return { pos: v.pos.map((p, i) => v.target[i] + (p - v.target[i]) * f), target: v.target }; };
    const fit = fitNarrow(stage, near(views.nabz));
    return compactReadout(stage, {
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        if (s.station !== lastSt) {
          const v = near(views[s.station]);
          if (lastSt !== null || (s.station !== 'nabz' && !inReel())) stage.setView(v.pos, v.target, lastSt === null ? 0.01 : 0.9);
          lastSt = s.station;
        }
        // Pulse
        beat = (beat + dt * s.bpm / 60) % 1;
        const pv = pulseShape(beat);
        const along = clamp(beat / 0.35, 0, 1);
        bulge.position.set(lerp(nx - 1.2, nx + 0.6, along), 0.54, 0.46); bulge.scale.setScalar(0.6 + 0.9 * pv);
        fingers.forEach((f) => { f.position.y = 0.76 + 0.02 * pv; });
        acc += dt;
        while (acc > 1 / 60) { acc -= 1 / 60; st.hist[st.n] = pulseShape((beat + 0) % 1); st.n = (st.n + 1) % 300; }
        if (s.station === 'nabz') trace.redraw();
        // Qaroora
        const sh = clamp(Math.round(s.shade), 1, 8);
        q.liqMat.color.set(URINE[sh - 1]);
        marker.position.set(qx + 0.7 - 1.1 + ((71 + 106 * (sh - 1)) / 900) * 2.2, 0.98, -0.6);
        // Hijama
        const dP = cupVacuum(s.cupT), k = clamp(dP / 40, 0, 1);
        cups.forEach((c, i) => {
          c.dome.scale.y = approach(c.dome.scale.y, 0.02 + 0.55 * k, 3, dt);
          c.drops.material.opacity = approach(c.drops.material.opacity, s.wet ? 0.55 * k : 0, 2, dt);
          c.drops.scale.y = 0.05 + 0.3 * k;
        });
        if (s.station === 'hijama' && gs.T !== s.cupT) { gs.T = s.cupT; gauge.redraw(); }
        // Dawa
        flame.visible = s.heat; flame.scale.set(1, 0.8 + 0.3 * Math.sin(t * 17), 1);
        steam.forEach((m, i) => {
          const u = ((t * 0.35 + i / steam.length) % 1);
          const p = u < 0.3 ? new THREE.Vector3(dx - 0.1, 1.0 + u * 1.3, -0.3) : new THREE.Vector3(lerp(dx - 0.1, dx + 1.5, (u - 0.3) / 0.7), lerp(1.4, 0.75, (u - 0.3) / 0.7), -0.3);
          m.position.copy(p); m.visible = s.heat; m.material.opacity = 0.35 * (1 - u);
        });
        if (s.heat) { collected = Math.min(1, collected + dt * 0.02); dripY = (dripY + dt * 1.6) % 1; }
        drip.visible = s.heat; drip.position.set(dx + 1.6, 0.6 - dripY * 0.35, -0.3);
        recv.setLevel(0.05 + 0.6 * collected);
        const narrow = fit(), on = s.labels && !inReel();
        Object.keys(ST).forEach((k, i) => { stL[i].visible = on && !narrow && k === s.station; });
        foodL.forEach((l) => { l.visible = on && s.station === 'ghiza'; });
        dawaL.forEach((l) => { l.visible = on && s.station === 'dawa'; });
      },
      readout: (s) => {
        const c = s.station;
        if (c === 'nabz') {
          const r = Math.round(s.bpm), zone = r < 60 ? 'below the usual adult resting range' : r > 100 ? 'above the usual adult resting range' : 'in the usual adult resting range';
          return `<div class="big">${r} beats a minute</div>${rows([['Resting adult (AHA)', '60–100 a minute'], ['This pulse is', zone], ['A hakim also reads', 'size, strength, speed, rhythm']])}<small>Only the rate here is a standard modern measurement. A fast or slow resting pulse is a reason to see a doctor.</small>`;
        }
        if (c === 'qaroora') {
          const sh = clamp(Math.round(s.shade), 1, 8);
          return `<div class="big">Shade ${sh} of 8</div>${rows([['A hakim looks at', 'colour, clarity, sediment, smell'], ['Darker usually means', 'more concentrated urine'], ['A modern lab also tests', 'glucose, protein, blood, germs']])}<small>${sh >= 6 ? 'Dark urine often means too little water, but some foods, medicines and illnesses change colour too. Ask a doctor if it lasts.' : 'Pale straw colour is typical when you drink enough.'}</small>`;
        }
        if (c === 'hijama') {
          const dP = cupVacuum(s.cupT);
          return `<div class="big">${dP.toFixed(1)} kPa of suction</div>${rows([['Air sealed at', Math.round(s.cupT) + ' °C'], ['Cools to skin', '33 °C'], ['Pressure inside', `${(P0 - dP).toFixed(1)} kPa (${Math.round((P0 - dP) / P0 * 100)}% of air)`], ['About', Math.round(dP * 7.5) + ' mmHg below air']])}<small>Gay-Lussac: P ∝ T at fixed volume. Skin pulled in shrinks the space, so real suction is less. ${s.wet ? 'Wet cupping breaks the skin: it must be done by a trained practitioner with sterile, single-use tools.' : ''}</small>`;
        }
        if (c === 'ghiza') return `<div class="big">Food as treatment</div>${rows([['Honey, ginger', 'classed hot and dry'], ['Cucumber, bottle gourd', 'classed cold and moist'], ['The rule', 'treat by opposites (ilaj bil zid)']])}<small>These are Unani's classes, not measured temperatures. Modern nutrition sorts foods by nutrients instead (chapter 6).</small>`;
        return `<div class="big">Majoon, khamira, arq</div>${rows([['Majoon', 'herbs in honey or syrup'], ['Khamira', 'a soft sweet confection'], ['Arq', 'steam-distilled herb water'], ['Water boils at', '100 °C at sea level']])}<small>Recipes are fixed in the Unani Pharmacopoeia of India. Medicines, even herbal ones, can have side effects: tell your doctor what you take.</small>`;
      },
    });
  },
};
