// Chapter 4: what history got right and wrong. A town square of 64 people and a toy outbreak.
// Isolating the sick early stops it; the "explain it with" switch shows the old bad-air picture
// (miasma, corrupted air, which the humoral tradition used) or the modern germ picture. A board
// lists Ibn Sina's rules for testing a medicine from the Canon.
// The outbreak model is a toy (a simple SIR model), not a real disease:
//  - each sick person meets C = 5 others a day; each meeting infects a healthy person with
//    p = 0.06; a person stays infectious for D = 8 days, so R0 = C·p·D = 2.4 (in the range of
//    many real respiratory infections; e.g. early COVID-19 estimates were about 2–3, WHO 2020);
//  - isolating people L days after they fall ill cuts R to C·p·L.
// History sources:
//  - The Canon's seven rules for testing drugs (Book 2): Wikipedia "The Canon of Medicine"; Tschanz,
//    "Arab roots of European medicine", Heart Views 4 (2003); CCRUM, "Unani System of Medicine:
//    The Science of Health and Healing" (New Delhi, 2016).
//  - The Canon describes some diseases as passing between people (e.g. phthisis) and also blames
//    corrupted air: Wikipedia "The Canon of Medicine"; Britannica "Avicenna".
//  - The claim that Ibn Sina invented a 40-day "al-arba'iniya" quarantine is widely repeated but not
//    found in the Canon's text (Wikipedia "Talk:Quarantine" and "Quarantine"). Recorded quarantine:
//    Ragusa (Dubrovnik) 1377, 30 days; the word from Venetian "quaranta giorni", 40 days, 15th
//    century (Wikipedia "Quarantine"; Britannica "quarantine").
//  - al-Razi's comparison of patients with brain inflammation treated with and without bloodletting,
//    in al-Hawi: S. Tibi, "Al-Razi and Islamic medicine in the 9th century", J R Soc Med 99:206
//    (2006); James Lind Library, "al-Razi".
//  - Humours replaced: Virchow, "Die Cellularpathologie" (1858); Pasteur (1860s) and Koch (anthrax
//    1876, tuberculosis 1882): Britannica "germ theory"; Wikipedia "Humorism". Black bile is not a
//    body fluid modern anatomy finds (Wikipedia "Humorism").
import { THREE, M, clamp, lerp, canvasTexture } from '../kit.js';
import { board, tint, fitNarrow, compactReadout, inReel, rows, rrect, rng, wrap } from '../unani.js';

const N = 64, C = 5, PINF = 0.06, D = 8, DAY = 0.7;       // DAY: seconds of animation per model day
const RULES = [
  'Use the pure medicine, not a spoiled or mixed one.',
  'Test it on one simple illness, not a mix of illnesses.',
  'Test it on opposite kinds of cases too, to see what it really does.',
  'Match the strength of the medicine to the illness.',
  'Watch the timing: does the effect come soon enough to be the medicine?',
  'Check the effect happens again and again, not just once.',
  'Test it in people: a lion or a horse may react differently.',
];

export default {
  id: 'legacy',
  short: 'Right and wrong',
  title: 'What history got right, and what it got wrong',
  subtitle: 'Careful observers, good rules for testing, and a theory that did not survive.',
  view: { pos: [0.6, 8.2, 12.5], target: [0.2, 0.9, -0.6] },
  learn: `<p>Some things the old masters did have lasted. In his <b>Canon</b>, Ibn Sina set out <b>rules for testing a medicine</b>: use it pure, try it on one simple illness, check the effect comes at the right time and happens again and again, and test it in people, not only animals. These are early seeds of the <b>clinical trial</b>. Before him, <b>al-Razi</b> compared patients who were bled with patients who were not, an early kind of controlled comparison. Big hospitals called <b>bimaristans</b> treated rich and poor alike.</p>
    <p>The Canon also says some illnesses <b>pass from person to person</b>. You may read online that Ibn Sina invented a 40-day <b>quarantine</b>. That claim is repeated a lot, but historians have not found it in the Canon. The first recorded quarantine was in Ragusa (now Dubrovnik) in 1377, and the word comes from Venetian <i>quaranta giorni</i>, “40 days”.</p>
    <p>What did not last was the <b>theory</b> of why we fall ill. Blood, phlegm and bile are real, but there is no “black bile”, and disease is not an imbalance of four fluids. From the 1850s, scientists found that bodies are made of <b>cells</b> (Virchow, 1858) and that many diseases are caused by <b>germs</b> (Pasteur and Koch). Bloodletting, once used for almost everything, was shown to do more harm than good. Modern medicine is built on that newer picture: see MedicineClear, and ImmuneClear for how the body fights germs.</p>
    <p class="tip"><b>Try it:</b> run the outbreak with isolation off, then on. Then slide “isolate after” to see why isolating early matters. Switch the explanation between bad air and germs: the same isolation works either way, but only germs explain <i>why</i>.</p>`,
  terms: [
    { t: 'Contagion', d: 'Disease passing from one person to another.' },
    { t: 'Quarantine', d: 'Keeping people who may be ill apart from others for a set time. From Venetian “quaranta”, forty.' },
    { t: 'Miasma', d: 'The old idea that disease comes from bad or corrupted air.' },
    { t: 'Germ theory', d: 'The idea, proved in the 1800s, that many diseases are caused by microbes such as bacteria and viruses.' },
    { t: 'R number', d: 'How many people, on average, each sick person infects. Below 1, an outbreak dies out.' },
    { t: 'Bimaristan', d: 'A hospital of the medieval Islamic world.' },
  ],
  defaults: { isolate: false, after: 2, explain: 'germs', labels: true },
  controls: [
    { key: 'run', type: 'buttons', label: 'Outbreak', items: [{ label: 'Start again', act: (s, inst) => inst.reset?.() }] },
    { key: 'isolate', type: 'toggle', label: 'Isolate the sick (quarantine)' },
    { key: 'after', type: 'range', label: 'Isolate after', min: 1, max: 8, step: 1, fmt: (v) => v + (v === 1 ? ' day' : ' days') + ' of illness' },
    { key: 'explain', type: 'seg', label: 'Explain it with', options: [{ v: 'miasma', label: 'Bad air' }, { v: 'germs', label: 'Germs' }], fmt: (v) => (v === 'germs' ? 'Microbes pass between people' : 'Corrupted air (old idea)') },
    { key: 'labels', type: 'toggle', label: 'Labels' },
  ],
  onChange(s, key) { if (key === 'isolate' || key === 'after') s.restart = true; },
  quiz: [
    { q: 'Which idea from Ibn Sina’s Canon still matters in modern medicine?', options: ['Black bile causes sadness', 'Rules for testing whether a medicine works', 'Bleeding cures fevers', 'Health is four fluids in balance'], answer: 1, why: 'His rules, such as testing a pure drug on a simple illness and checking the effect repeats, are early seeds of the clinical trial.' },
    { q: 'What happens to an outbreak when each sick person infects fewer than one other on average?', options: ['It grows faster', 'It dies out', 'It stays the same', 'It moves to animals'], answer: 1, why: 'With R below 1, every generation of cases is smaller than the last.' },
    { q: 'What replaced the four-humour theory in Western medicine in the 1800s?', options: ['Astrology', 'Cells, germs and chemistry', 'A new fifth humour', 'Nothing'], answer: 1, why: 'Virchow’s cell theory of disease and the germ theory of Pasteur and Koch explained disease in ways that could be tested.' },
  ],
  reel: [
    { ms: 5600, caption: 'Ibn Sina wrote rules for testing medicines, and knew some illnesses spread between people.', set: { isolate: true, after: 2, explain: 'germs', labels: false }, act: (s, inst) => inst.reset?.(11), view: { pos: [-0.6, 8.2, 5.4], target: [-0.6, 0.3, 0.3] }, spin: 0.25 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    // Square and isolation yard.
    const sq = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.1, 8.2), M.matte(0x4a4034)); sq.position.set(-1, -0.05, 0); sq.receiveShadow = true; root.add(sq);
    const yard = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 5.2), M.matte(0x2f3a4a)); yard.position.set(5.2, -0.05, 1.2); yard.receiveShadow = true; root.add(yard);
    const fenceM = M.matte(0x9aa3b5);
    [[3.6, 1.2, 0.06, 5.2], [6.8, 1.2, 0.06, 5.2], [5.2, -1.4, 3.2, 0.06], [5.2, 3.8, 3.2, 0.06]].forEach(([x, z, w, d]) => { const f = new THREE.Mesh(new THREE.BoxGeometry(w, 0.35, d), fenceM); f.position.set(x, 0.17, z); root.add(f); });

    // People as instanced bodies and heads.
    const bodyG = new THREE.CapsuleGeometry(0.13, 0.36, 4, 10); bodyG.translate(0, 0.31, 0);
    const headG = new THREE.SphereGeometry(0.11, 14, 10); headG.translate(0, 0.72, 0);
    const bodies = new THREE.InstancedMesh(bodyG, new THREE.MeshStandardMaterial({ roughness: 0.6 }), N);
    const heads = new THREE.InstancedMesh(headG, new THREE.MeshStandardMaterial({ roughness: 0.6 }), N);
    bodies.castShadow = heads.castShadow = true; root.add(bodies, heads);
    const cS = new THREE.Color(0xc9cfdb), cI = new THREE.Color(0xff4a5a), cR = new THREE.Color(0x6ee7a8), cQ = new THREE.Color(0xffa07a);
    const home = Array.from({ length: N }, (_, i) => new THREE.Vector3(-4.5 + (i % 8) + ((i >> 3) % 2) * 0.25, 0, -3.5 + Math.floor(i / 8)));
    const posN = home.map((p) => p.clone());

    // Germ particles and miasma clouds.
    const GP = 80, germs = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.05, 0), M.glow(0xb6ff6a), GP); root.add(germs);
    const flights = [];
    const clouds = Array.from({ length: 7 }, (_, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), M.ghost(0x7fa860, 0.12)); m.scale.set(1.6, 0.5, 1.2); root.add(m); return m; });

    // Canon rules board.
    const rb = canvasTexture(1000, 1000, (g, w, h) => {
      g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(30,24,16,0.92)'; rrect(g, 0, 0, w, h, 30); g.fill();
      g.strokeStyle = '#d8b25a'; g.lineWidth = 4; rrect(g, 14, 14, w - 28, h - 28, 22); g.stroke();
      g.fillStyle = '#ffd166'; g.font = '600 46px Georgia, serif'; g.fillText('Ibn Sina: testing a medicine', 50, 90);
      g.fillStyle = 'rgba(255,255,255,0.6)'; g.font = 'italic 30px Georgia, serif'; g.fillText('The Canon of Medicine, Book 2 (1025), in plain words', 50, 136);
      g.font = '32px system-ui, sans-serif'; let y = 200;
      RULES.forEach((r, i) => { g.fillStyle = '#ffd166'; g.fillText(`${i + 1}.`, 50, y); g.fillStyle = '#f3ead8'; y = wrap(g, r, 100, y, w - 150, 40) + 22; });
    });
    const rbM = board(rb, 3.4, 3.4); rbM.position.set(5.4, 2.1, -3.4); rbM.rotation.y = -0.3; root.add(rbM);

    const quarL = tint(stage.label('Isolation', [5.2, 0.9, 3.9], root), 'orange');
    const sqL = tint(stage.label('Town square', [-4.6, 0.9, 4.2], root), 'grey');

    // ---- the model
    let state, day, dayT, rand, history, t = 0;
    const reset = (seed = 7) => {
      rand = rng(seed);
      state = Array.from({ length: N }, () => ({ s: 'S', d: 0, q: false }));
      [27, 36].forEach((i) => { state[i].s = 'I'; });
      day = 0; dayT = 0; history = [2]; flights.length = 0;
      home.forEach((p, i) => posN[i].copy(p));
    };
    reset();
    const stepDay = (s) => {
      const newly = [];
      state.forEach((p, i) => {
        if (p.s !== 'I' || p.q) return;
        for (let c = 0; c < C; c++) {
          const j = Math.floor(rand() * N); if (j === i) continue;
          if (state[j].s === 'S' && !state[j].q && rand() < PINF) { newly.push(j); if (flights.length < GP) flights.push({ a: i, b: j, k: 0 }); }
        }
      });
      state.forEach((p) => { if (p.s === 'I') { p.d++; if (s.isolate && p.d >= s.after) p.q = true; if (p.d >= D) { p.s = 'R'; } } });
      newly.forEach((j) => { if (state[j].s === 'S') { state[j].s = 'I'; state[j].d = 0; } });
      day++;
      history.push(state.filter((p) => p.s === 'I').length);
    };
    const count = (k) => state.filter((p) => p.s === k).length;

    const o = new THREE.Object3D();
    const fit = fitNarrow(stage, { pos: [0.8, 8, 5.5], target: [0.8, 0, -2.5] });
    return compactReadout(stage, {
      reset: (seed) => reset(seed ?? 7 + Math.floor(Math.random() * 1000)),
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        if (s.restart) { s.restart = false; reset(7); }
        dayT += dt;
        const active = count('I') > 0;
        if (dayT > DAY && active && day < 120) { dayT = 0; stepDay(s); }
        if (!active && dayT > 6 && !inReel()) { dayT = 0; reset(7 + day); }
        // Move people: isolated ones walk into the yard.
        let qi = 0;
        state.forEach((p, i) => {
          const inYard = p.q && p.s === 'I';
          const target = inYard ? new THREE.Vector3(4.1 + (qi % 5) * 0.55, 0, -0.9 + Math.floor(qi++ / 5) * 0.6) : home[i];
          posN[i].x = lerp(posN[i].x, target.x, Math.min(1, dt * 3)); posN[i].z = lerp(posN[i].z, target.z, Math.min(1, dt * 3));
          const wob = p.s === 'I' && !inYard ? Math.sin(t * 6 + i) * 0.03 : 0;
          o.position.set(posN[i].x + wob, 0, posN[i].z); o.updateMatrix();
          bodies.setMatrixAt(i, o.matrix); heads.setMatrixAt(i, o.matrix);
          const col = p.s === 'S' ? cS : p.s === 'R' ? cR : inYard ? cQ : cI;
          bodies.setColorAt(i, col); heads.setColorAt(i, col);
        });
        bodies.instanceMatrix.needsUpdate = heads.instanceMatrix.needsUpdate = true;
        bodies.instanceColor.needsUpdate = heads.instanceColor.needsUpdate = true;
        // Germs fly from one person to the next.
        const g = s.explain === 'germs';
        germs.visible = g;
        let gi = 0;
        for (let f = flights.length - 1; f >= 0; f--) { flights[f].k += dt * 1.6; if (flights[f].k >= 1) flights.splice(f, 1); }
        flights.forEach((f) => {
          const a = posN[f.a], b = posN[f.b], k = f.k;
          o.position.set(lerp(a.x, b.x, k), 0.75 + Math.sin(k * Math.PI) * 0.8, lerp(a.z, b.z, k)); o.scale.setScalar(1); o.updateMatrix(); germs.setMatrixAt(gi++, o.matrix);
        });
        o.scale.setScalar(0.0001); o.updateMatrix(); for (; gi < GP; gi++) germs.setMatrixAt(gi, o.matrix);
        o.scale.setScalar(1);
        germs.instanceMatrix.needsUpdate = true;
        clouds.forEach((c, i) => {
          c.visible = !g;
          c.position.set(-1 + Math.sin(t * 0.2 + i * 1.7) * 3, 1.3 + 0.2 * Math.sin(t * 0.5 + i), Math.cos(t * 0.17 + i * 2.3) * 3);
          c.material.opacity = 0.06 + 0.12 * clamp(count('I') / 20, 0, 1);
        });
        const narrow = fit(), on = s.labels && !inReel();
        quarL.visible = on; sqL.visible = on && !narrow;
      },
      readout: (s) => {
        const r = s.isolate ? C * PINF * Math.min(s.after, D) : C * PINF * D;
        const ever = N - count('S');
        const peak = Math.max(...history);
        return `<div class="big">Day ${day}: ${count('I')} ill</div>${rows([['Ever infected', `${ever} of ${N}`], ['Worst day so far', `${peak} ill at once`], ['R (each sick person infects)', r.toFixed(1)], ['Isolation', s.isolate ? `after ${s.after} day${s.after > 1 ? 's' : ''}` : 'off']])}<small>A toy outbreak with made-up numbers, not a real disease. ${r < 1 ? 'R is below 1, so it fizzles out.' : 'R is above 1, so it spreads.'}</small>`;
      },
    });
  },
};
