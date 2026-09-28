// Chapter 1: where Unani comes from. A map table from Greece to India with a glowing book that
// travels from stop to stop: Kos, Rome, Baghdad, Rey, Hamadan, a Latin branch to Toledo, then
// Delhi, Tibbiya College and India today.
// Places are plotted at their real longitude and latitude (equirectangular, x squeezed by cos 35°).
// Coastlines are hand-simplified and only meant to orient you.
// Sources (see history.json for more):
//  - Hippocratic Corpus, c. 400 BCE, four humours in "On the Nature of Man" (Britannica, "Hippocrates";
//    Wikipedia "Humorism").
//  - Galen of Pergamon (129 – c. 216), worked in Rome (Britannica, "Galen").
//  - House of Wisdom (Bayt al-Hikma), Baghdad, 9th century; Hunayn ibn Ishaq (809–873) translated
//    most of Galen into Syriac and Arabic (Britannica, "Hunayn ibn Ishaq"; "Bayt al-Hikma").
//  - al-Razi (c. 854 – c. 925/935), from Rey: al-Hawi, and the Treatise on Smallpox and Measles
//    (Britannica, "al-Razi").
//  - Ibn Sina (980–1037) finished al-Qanun fi al-Tibb in Hamadan in 1025 (Wikipedia, "The Canon of
//    Medicine"); Latin translation by Gerard of Cremona (d. 1187) in Toledo, 12th century; used as a
//    textbook at Montpellier and Louvain until about 1650 (Britannica, "Avicenna").
//  - Unani ("Yunani", Greek) in India from the Delhi Sultanate (13th century) and at Mughal courts
//    (Wikipedia, "Unani medicine"; CCRUM, "The Science of Health and Healing", 2016).
//  - Ayurvedic and Unani Tibbia College, Delhi: foundation stone 29 March 1916, opened by Mahatma
//    Gandhi on 13 February 1921 (Delhi Government, autch.delhi.gov.in, "History").
//  - India today: about 46–57 Unani colleges and roughly 50,000 registered practitioners; India
//    "has the largest number of Unani educational, research and health care institutions"
//    (CCRUM 2016; Wikipedia "Unani medicine", citing Ministry of AYUSH data); Ministry of AYUSH
//    since 9 November 2014; CCRUM since 1978; NIUM Bengaluru since 1984.
import { THREE, M, clamp, smooth, canvasTexture, tube } from '../kit.js';
import { board, tint, fitNarrow, compactReadout, inReel, rows, book } from '../unani.js';

const KX = 16 / 104, KZ = KX / Math.cos(35 * Math.PI / 180), LON0 = 40, LAT0 = 29;
const P = (lon, lat, y = 0) => new THREE.Vector3((lon - LON0) * KX, y, -(lat - LAT0) * KZ);

export const STOPS = [
  { lon: 27.3, lat: 36.9, from: null, date: 'c. 400 BCE', place: 'Kos, Greece', who: 'Hippocrates and his school', book: 'The Hippocratic writings', what: 'Health is a balance of four humours in the body.' },
  { lon: 12.5, lat: 41.9, from: 0, date: 'c. 170 CE', place: 'Pergamon and Rome', who: 'Galen', book: 'Hundreds of works in Greek', what: 'Galen joins humours and temperaments into one big system.' },
  { lon: 44.4, lat: 33.3, from: 1, date: '9th century', place: 'Baghdad', who: 'Hunayn ibn Ishaq, House of Wisdom', book: 'Galen in Arabic', what: 'Greek medical books are translated into Arabic.' },
  { lon: 51.4, lat: 35.6, from: 2, date: 'c. 900', place: 'Rey and Baghdad', who: 'al-Razi (Rhazes)', book: 'al-Hawi; Smallpox and Measles', what: 'Case notes, hospitals, and smallpox told apart from measles.' },
  { lon: 48.5, lat: 34.8, from: 3, date: '1025', place: 'Hamadan, Persia', who: 'Ibn Sina (Avicenna)', book: 'al-Qanun fi al-Tibb, the Canon', what: 'Five books that organise all the medicine he knew.' },
  { lon: -4.0, lat: 39.9, from: 4, date: '12th century', place: 'Toledo, Spain', who: 'Gerard of Cremona', book: 'Canon medicinae (Latin)', what: 'Europe gets the Canon: taught at Montpellier until about 1650.' },
  { lon: 77.2, lat: 28.6, from: 4, date: '13th–17th centuries', place: 'Delhi', who: 'Hakims of the Sultanate and Mughal courts', book: 'Books in Arabic and Persian', what: 'Unani, “the Greek medicine”, takes root in India.' },
  { lon: 76.6, lat: 29.9, from: 6, date: '1916 · 1921', place: 'Karol Bagh, Delhi', who: 'Hakim Ajmal Khan', book: 'Tibbiya College', what: 'Unani and Ayurveda taught side by side; opened by Gandhi in 1921.' },
  { lon: 77.6, lat: 13.0, from: 7, date: 'today', place: 'All over India', who: 'Ministry of AYUSH, CCRUM, NCISM', book: 'BUMS degree, pharmacopoeia', what: 'India has more Unani colleges, hospitals and hakims than anywhere else.' },
];

// Hand-simplified water bodies [lon, lat].
const SEAS = [
  // Mediterranean
  [[-5.6, 36], [-1, 35.3], [3, 36.8], [10, 37.2], [10.5, 34], [15, 32.3], [20, 30.6], [25, 31.8], [32, 31.2], [35, 32.6], [36, 36.2], [33, 36.2], [30, 36.4], [27.4, 37.2], [26.4, 40.1], [23.5, 40.5], [22.6, 38], [21.2, 37.1], [21, 38.8], [19.5, 41.5], [16.5, 43.3], [13.6, 45.6], [12.3, 44.3], [14.5, 42.3], [18.4, 40.2], [16.6, 38.7], [15.7, 38], [15.6, 40], [12, 41.7], [10, 43.9], [8.5, 44.3], [5.5, 43.2], [3.2, 42], [0.5, 40.4], [-0.5, 38.4], [-2.2, 36.8]],
  // Black Sea
  [[28, 41.3], [28.1, 43.5], [30, 45.6], [33, 46], [36.5, 45.3], [39.5, 47], [41.6, 42], [36, 41.7], [31, 41.1]],
  // Caspian
  [[47, 44.6], [49, 46.6], [52, 46.9], [53.2, 45.1], [51, 44.2], [53, 41.5], [54, 37.4], [51, 36.7], [49, 37.6], [49.5, 40.3], [47.6, 42.6]],
  // Red Sea
  [[32.6, 29.9], [34.9, 29.5], [35.1, 28], [39, 21.6], [43.5, 12.7], [43.2, 12.4], [38.4, 18], [35.5, 23.6], [33.6, 27.4]],
  // Persian Gulf, Arabian Sea, Indian Ocean and Bay of Bengal
  [[48.5, 30.1], [50.8, 28.9], [54, 26.7], [56.3, 27.2], [57.5, 25.7], [61.5, 25.2], [66.5, 25.4], [67.5, 24], [68.8, 22.8], [70.2, 22.6], [72.6, 21.5], [72.8, 19], [73.5, 16], [74.8, 12.8], [76.3, 9.5], [77.5, 8.1], [78.2, 9], [79.8, 10.3], [80.2, 13], [80.3, 15.8], [82.3, 16.6], [85, 19.5], [87, 21.5], [88.8, 21.8], [90.5, 22.3], [92, 21.5], [93, 6], [44, 6], [51.2, 11.8], [44, 10.6], [43.4, 12.7], [45, 13], [49, 14.5], [52.2, 15.7], [55, 17.5], [57.8, 19], [59.8, 22.5], [58.5, 23.6], [56.3, 24.8], [56.3, 26.3], [55, 25.2], [53, 24.2], [51.6, 24.5], [51.5, 26], [50.2, 26.3], [49.5, 27.2], [48, 29.4]],
  // Atlantic
  [[-13, 51], [-4.5, 48.5], [-1.5, 46.5], [-1.8, 43.4], [-8, 43.7], [-9.3, 43], [-8.8, 38.7], [-9, 37], [-6.3, 36.8], [-5.6, 36], [-6, 35.6], [-9.8, 30], [-13, 27]],
];

function drawMap(g, w, h) {
  const px = (lon) => ((lon + 12) / 104) * w, py = (lat) => ((50 - lat) / 42) * h;
  g.fillStyle = '#1d2230'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#0d2a40';
  SEAS.forEach((poly) => { g.beginPath(); poly.forEach(([lo, la], i) => (i ? g.lineTo(px(lo), py(la)) : g.moveTo(px(lo), py(la)))); g.closePath(); g.fill(); });
  g.strokeStyle = 'rgba(142,240,255,0.25)'; g.lineWidth = 3;
  SEAS.forEach((poly) => { g.beginPath(); poly.forEach(([lo, la], i) => (i ? g.lineTo(px(lo), py(la)) : g.moveTo(px(lo), py(la)))); g.closePath(); g.stroke(); });
  g.strokeStyle = 'rgba(255,255,255,0.06)'; g.lineWidth = 2;
  for (let lo = -10; lo <= 90; lo += 10) { g.beginPath(); g.moveTo(px(lo), 0); g.lineTo(px(lo), h); g.stroke(); }
  for (let la = 10; la <= 50; la += 10) { g.beginPath(); g.moveTo(0, py(la)); g.lineTo(w, py(la)); g.stroke(); }
  g.fillStyle = 'rgba(160,200,230,0.55)'; g.font = 'italic 34px Georgia, serif'; g.textAlign = 'center';
  [['Mediterranean Sea', 18, 34.2], ['Black Sea', 34, 43.6], ['Caspian', 51, 42.3], ['Arabian Sea', 64, 15], ['Bay of Bengal', 88, 14], ['Persian Gulf', 52.5, 27.6], ['Atlantic', -9.5, 33]].forEach(([t, lo, la]) => g.fillText(t, px(lo), py(la)));
  g.fillStyle = 'rgba(255,255,255,0.28)'; g.font = '600 30px system-ui, sans-serif';
  [['EUROPE', 8, 48], ['AFRICA', 18, 22], ['ARABIA', 45, 22], ['PERSIA', 58, 31], ['INDIA', 78, 21], ['CENTRAL ASIA', 66, 44]].forEach(([t, lo, la]) => g.fillText(t, px(lo), py(la)));
}

const fmtStep = (v) => STOPS[clamp(Math.round(v), 0, STOPS.length - 1)].place;

export default {
  id: 'roots',
  short: 'Where it comes from',
  title: 'From Greece to Baghdad to Delhi',
  subtitle: 'A 2,400-year journey of ideas, books and translators.',
  view: { pos: [0.5, 15.5, 10.5], target: [0.3, 0, -1.6] },
  learn: `<p><b>Unani</b> means “Greek”. The name tells you where the story starts: with <b>Hippocrates</b> on the island of Kos, about 400 BCE, and with <b>Galen</b>, a Greek doctor working in Rome around 170 CE. They taught that health is a balance of four body fluids, the <b>humours</b>.</p>
    <p>In the 9th century, scholars in <b>Baghdad</b>, many linked to the <b>House of Wisdom</b>, translated these Greek books into Arabic. Doctors in the Islamic world then added a great deal of their own. <b>al-Razi</b> (Rhazes) kept detailed case notes and was the first to describe smallpox and measles as different diseases. <b>Ibn Sina</b> (Avicenna) finished his <b>Canon of Medicine</b> in 1025. Translated into Latin, it was taught in European universities for centuries.</p>
    <p>The system reached <b>India</b> with the Delhi Sultanate from the 13th century and flourished at Mughal courts, where its doctors were called <b>hakims</b>. In the 20th century <b>Hakim Ajmal Khan</b> founded <b>Tibbiya College</b> in Delhi, opened by Gandhi in 1921, which taught Unani and Ayurveda under one roof.</p>
    <p>Today India is the world's biggest centre of Unani. It has more Unani colleges, hospitals and hakims than any other country. Hakims study for a 5½-year <b>BUMS</b> degree and are regulated by the <b>NCISM</b>. Research is run by the <b>CCRUM</b>, under the <b>Ministry of AYUSH</b>. Unani is also practised in Pakistan, Bangladesh, Iran and the Gulf. Its sister systems have their own boxes: see AyurvedaClear and HomeopathyClear, and MedicineClear for modern medicine.</p>
    <p class="tip"><b>Try it:</b> drag the journey slider and follow the glowing book. Notice where the story splits: one copy of the Canon goes west to Europe, another goes east to India.</p>`,
  terms: [
    { t: 'Unani', d: 'From “Yunani”, Greek. A system of medicine built on Greek humoral theory, developed in the Islamic world and now practised mainly in South Asia.' },
    { t: 'Hakim', d: 'A practitioner of Unani medicine (tabib is also used).' },
    { t: 'House of Wisdom', d: 'A 9th-century centre of learning and translation in Baghdad.' },
    { t: 'The Canon of Medicine', d: 'Ibn Sina’s five-book encyclopedia of medicine, finished in 1025.' },
    { t: 'BUMS', d: 'Bachelor of Unani Medicine and Surgery, the 5½-year Unani degree in India.' },
    { t: 'AYUSH', d: 'India’s ministry for Ayurveda, Yoga, Unani, Siddha, Sowa-Rigpa and Homoeopathy, set up in 2014.' },
  ],
  defaults: { step: 0, play: true, labels: true },
  controls: [
    { key: 'step', type: 'range', label: 'Journey', min: 0, max: STOPS.length - 1, step: 0.01, ends: ['Kos, 400 BCE', 'India today'], fmt: fmtStep },
    { key: 'play', type: 'toggle', label: 'Travel on its own' },
    { key: 'labels', type: 'toggle', label: 'Labels' },
  ],
  onChange(s, key) { if (key === 'step') s.play = false; },
  quiz: [
    { q: 'What does the word “Unani” mean?', options: ['Ancient', 'Greek', 'Balance', 'Herbal'], answer: 1, why: 'Yunani means Greek: the system grew from the Greek medicine of Hippocrates and Galen.' },
    { q: 'Who finished the Canon of Medicine in 1025?', options: ['Galen', 'al-Razi', 'Ibn Sina (Avicenna)', 'Hakim Ajmal Khan'], answer: 2, why: 'Ibn Sina finished it in Hamadan. It was later translated into Latin and taught in Europe.' },
    { q: 'Which country is the biggest centre of Unani medicine today?', options: ['Greece', 'Iraq', 'India', 'Spain'], answer: 2, why: 'India has the most Unani colleges, hospitals, research centres and registered practitioners.' },
  ],
  reel: [
    { ms: 5400, caption: 'Unani means “Greek”: it began with Hippocrates and Galen and their four body fluids.', set: { step: 0, play: false, labels: false }, anim: { step: [0, 1.9] }, view: { pos: [-2, 6.6, 2.4], target: [-2, 0, -1] }, spin: 0.15 },
    { ms: 5600, caption: 'Baghdad translated it, Ibn Sina organised it in 1025, and it took root in India.', set: { step: 2, play: false, labels: false }, anim: { step: [2, 8] }, view: { pos: [3.5, 6.8, 3.4], target: [3.5, 0, 0] }, spin: 0.15 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const W = 16, D = 42 * KZ;
    const mapTex = canvasTexture(2048, Math.round(2048 * D / W), drawMap);
    const table = new THREE.Mesh(new THREE.BoxGeometry(W + 0.4, 0.3, D + 0.4), M.matte(0x3a2a1c)); table.position.set(P(40, 29).x, -0.16, 0); table.receiveShadow = true;
    const map = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ map: mapTex.tex, roughness: 0.9 }));
    map.rotation.x = -Math.PI / 2; map.position.set(P(40, 29).x, 0.001, 0); map.receiveShadow = true;
    root.add(table, map);

    // Pillars with a book on top at each stop.
    const pts = STOPS.map((st) => P(st.lon, st.lat));
    const colors = [0xc49bff, 0xc49bff, 0xffd166, 0xffd166, 0xffd166, 0x8ef0ff, 0xff8a5c, 0xff8a5c, 0x6ee7a8];
    const pins = STOPS.map((st, i) => {
      const g = new THREE.Group(); g.position.copy(pts[i]);
      const mat = new THREE.MeshStandardMaterial({ color: colors[i], emissive: colors[i], emissiveIntensity: 0.2, roughness: 0.4 });
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.5, 16), mat); post.position.y = 0.25; post.castShadow = true;
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 24), mat); disc.position.y = 0.015;
      const b = book(colors[i] === 0x6ee7a8 ? 0x2f7a55 : 0x8a3b2e, 0.28, 0.07, 0.36); b.position.y = 0.55;
      g.add(post, disc, b); g.scale.setScalar(1.6); root.add(g);
      return { g, mat, b };
    });
    // Arcs between stops.
    const arcs = STOPS.map((st, i) => {
      if (st.from === null) return null;
      const a = pts[st.from].clone().setY(0.9), b = pts[i].clone().setY(0.9);
      const mid = a.clone().add(b).multiplyScalar(0.5); mid.y = 0.9 + 0.12 * a.distanceTo(b) + 0.3;
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      const t = tube(curve.getPoints(60), 0.03, M.glow(colors[i], { transparent: true, opacity: 0.85 }), false, 80);
      root.add(t);
      return { curve, t, count: t.geometry.index.count };
    });
    // The travelling book.
    const traveller = book(0xb8452f, 0.5, 0.13, 0.64);
    const halo = new THREE.Mesh(new THREE.SphereGeometry(0.4, 24, 16), M.ghost(0xffd166, 0.25)); traveller.add(halo);
    root.add(traveller);

    const labs = STOPS.map((st, i) => {
      const up = [3, 5].includes(i) ? 1.9 : i === 7 ? 2.2 : 1.4;
      return tint(stage.label(`${st.date} · ${st.place.split(',')[0]}`, [pts[i].x, up, pts[i].z], root), '#' + colors[i].toString(16).padStart(6, '0'));
    });

    let t = 0;
    const fit = fitNarrow(stage, { pos: [0.3, 12.2, 8.3], target: [0.3, 0, -2.4] });
    return compactReadout(stage, {
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        if (s.play && !inReel()) { s.step += dt * 0.28; if (s.step > STOPS.length - 1 + 1.2) s.step = 0; }
        const k = clamp(s.step, 0, STOPS.length - 1), i = Math.floor(k), f = k - i;
        // Arcs: finished ones fully drawn, the current one partly.
        arcs.forEach((a, j) => { if (!a) return; const frac = j <= i ? 1 : j === i + 1 ? smooth(f) : 0; a.t.geometry.setDrawRange(0, Math.floor(a.count * frac / 6) * 6); a.t.visible = frac > 0.001; });
        // The book rides the current arc.
        const nxt = Math.min(STOPS.length - 1, i + 1);
        if (nxt > i && arcs[nxt] && f > 0.001) traveller.position.copy(arcs[nxt].curve.getPoint(smooth(f))).add(new THREE.Vector3(0, 0.12, 0));
        else traveller.position.copy(pts[i]).setY(1.3);
        traveller.rotation.y = t * 1.2;
        halo.material.opacity = 0.18 + 0.1 * Math.sin(t * 4);
        pins.forEach((p, j) => {
          const on = j <= i || (j === i + 1 && f > 0.97), cur = j === Math.round(k);
          p.mat.emissiveIntensity = cur ? 0.9 : on ? 0.35 : 0.05;
          p.g.scale.setScalar(on ? 1.6 : 0.9); p.b.visible = on;
        });
        const narrow = fit();
        labs.forEach((l, j) => { l.visible = s.labels && !inReel() && j === Math.round(k); l.element.style.fontWeight = j === Math.round(k) ? '700' : '500'; });
      },
      readout: (s) => {
        const st = STOPS[clamp(Math.round(s.step), 0, STOPS.length - 1)];
        return `<div class="big">${st.date}</div>${rows([['Where', st.place], ['Who', st.who], ['Book', st.book]])}<small>${st.what}</small>`;
      },
    });
  },
};
