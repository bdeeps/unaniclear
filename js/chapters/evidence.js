// Chapter 5: what the evidence says. A fair-test simulator: two groups of patients, one gets the
// remedy, the other a look-alike dummy. You set the hidden truth (how much the remedy really helps)
// and switch fairness on and off: randomising, blinding, a placebo. The trial's result, its 95%
// range and a p-value come from the simulated patients (seeded random numbers, so a run repeats).
// A safety board sits beside it.
// Model (illustrative numbers):
//  - 40% get better anyway (natural course of many illnesses, plus regression to the mean);
//  - taking any pill adds 10 points (placebo response; Hróbjartsson & Gøtzsche, Cochrane Review
//    2010, found placebo effects mainly on patient-reported outcomes such as pain);
//  - not blinded: assessors and patients who know rate the remedy 8 points better (Wood et al.,
//    BMJ 336:601, 2008: unblinded trials with subjective outcomes exaggerate effects);
//  - not randomised: healthier patients end up in the remedy group, worth 10 points (selection bias;
//    Schulz et al., JAMA 273:408, 1995; Cochrane Handbook ch. 8).
// Statistics: difference of two proportions, 95% interval ±1.96·SE, two-sided p from a z-test.
// Evidence summary sources (see the learn text):
//  - Unani trials: few are randomised and blinded; e.g. Itrat et al., "Unani medicines for glycemic
//    control in type 2 diabetes: a systematic review", Altern Ther Health Med 30(6):46 (2024), which
//    calls for better-quality trials. India requires trials to be registered with the Clinical Trials
//    Registry–India (CTRI, ICMR, mandatory since 2009).
//  - Cupping: Cao, Li & Liu, "An updated review of the efficacy of cupping therapy", PLoS One
//    7:e31793 (2012): 135 RCTs, generally low quality.
//  - Reserpine: from Rauvolfia serpentina (asrol in Unani, sarpagandha in Ayurveda); Indian work by
//    Sen & Bose (1931) and R. J. Vakil's trial in hypertension (Br Heart J 11:350, 1949); isolated at
//    Ciba in 1952 (Wikipedia "Reserpine"; Britannica "reserpine").
// Safety sources:
//  - Kushtas (calcined metal preparations) with lead, mercury and silver: Haq & Asghar, J
//    Ethnopharmacol 26:287 (1989); Aziz, Gilani & Rindh, Med Hypotheses 59:468 (2002).
//  - Traditional medicines sold in India: Bhalla & Pannu (PGIMER Chandigarh), Toxicol Res (2022):
//    42 Ayurvedic formulations, mercury above limits in 29 (69%). Not Unani-specific.
//  - India: ASU drugs are licensed under the Drugs and Cosmetics Act 1940 (chapter IVA); heavy-metal
//    testing of every export batch (Ministry of AYUSH notification, 2005, in force 2006); national
//    pharmacovigilance for Ayurveda, Siddha, Unani and Homoeopathy drugs (Ministry of AYUSH, 2017–18).
//  - Cupping harms (bruising, pain, dizziness, infection, scarring): Cao et al. (2012); Kim et al.,
//    "Adverse events related to cupping therapy in studies conducted in Korea", Eur J Integr Med (2014).
//  - Herb–drug interactions: NCCIH, "Herb-drug interactions" (2024); Indian J Pharmacol reviews.
import { THREE, M, clamp, canvasTexture } from '../kit.js';
import { board, tint, fitNarrow, compactReadout, inReel, rows, rrect, rng, wrap } from '../unani.js';

const BASE = 0.40, PLACEBO = 0.10, UNBLIND = 0.08, UNRAND = 0.10, SHOW = 60;
const erf = (x) => { const s = Math.sign(x); x = Math.abs(x); const t = 1 / (1 + 0.3275911 * x); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return s * y; };

export function runTrial(s) {
  const r = rng(1000 + s.seed * 7919 + Math.round(s.n));
  const pRem = clamp(BASE + s.truth + PLACEBO + (s.blind ? 0 : UNBLIND) + (s.random ? 0 : UNRAND), 0, 1);
  const pCon = clamp(BASE + (s.placebo ? PLACEBO : 0), 0, 1);
  const A = [], B = [];
  for (let i = 0; i < s.n; i++) { A.push(r() < pRem); B.push(r() < pCon); }
  const a = A.filter(Boolean).length / s.n, b = B.filter(Boolean).length / s.n, d = a - b;
  const se = Math.sqrt(Math.max(1e-9, (a * (1 - a) + b * (1 - b)) / s.n));
  const pp = (a + b) / 2, sep = Math.sqrt(Math.max(1e-9, 2 * pp * (1 - pp) / s.n));
  const z = d / sep, p = 1 - erf(Math.abs(z) / Math.SQRT2);
  return { A, B, a, b, d, lo: d - 1.96 * se, hi: d + 1.96 * se, p, pRem, pCon };
}

const SAFETY = [
  ['Metals', 'Some kushtas (preparations made by strongly heating metals) contain lead or mercury. Tests of traditional medicines sold in India have found heavy metals above safe limits.'],
  ['Cupping', 'Bruises, pain, dizziness and fainting. Wet cupping cuts the skin: dirty or reused tools can spread infection.'],
  ['Interactions', 'Herbs can change how medicines work, such as blood thinners or diabetes drugs.'],
  ['Delay', 'The biggest risk: waiting too long to get proven treatment for a serious illness.'],
  ['Rules', 'India licenses Unani medicines under the Drugs and Cosmetics Act 1940 and runs a safety reporting scheme for them.'],
];

export default {
  id: 'evidence',
  short: 'What the evidence says',
  title: 'Does it work? Run a fair test',
  subtitle: 'Placebo, blinding and randomising, and what trials of Unani have found.',
  view: { pos: [1.5, 4.2, 10.2], target: [1.3, 1.1, -0.4] },
  learn: `<p>How do we know if any treatment works, Unani or modern? Many people get better anyway, and simply taking something you believe in can make you <b>feel</b> better: the <b>placebo effect</b>. So we need a <b>fair test</b>. Split patients into two groups by chance (<b>randomising</b>), give one the remedy and the other a look-alike dummy (<b>placebo</b>), and make sure nobody knows who got which (<b>blinding</b>). Only the difference between the groups is the remedy's real effect. MedicineClear has a bigger trial simulator.</p>
    <p><b>What trials of Unani show.</b> Ibn Sina asked for careful testing, but good modern trials of Unani medicines are still <b>few</b>. Reviews find most studies are small, and many are not randomised or blinded. A 2024 review of Unani medicines for type 2 diabetes found hopeful results but called for better trials. For <b>cupping</b>, a 2012 review of 135 trials found some possible benefit for pain and a few other conditions, but most trials were of low quality. The CCRUM runs clinical studies, and Indian trials must be registered with <b>CTRI</b> (run by ICMR). Some plants from these traditions did become real drugs: <b>reserpine</b>, a blood-pressure medicine, came from <i>Rauvolfia serpentina</i> (asrol in Unani, sarpagandha in Ayurveda), tested by Indian doctors in the 1930s and 1940s.</p>
    <p><b>Safety.</b> “Natural” does not mean safe. Some <b>kushtas</b> (medicines made by burning metals) contain lead or mercury, and studies of traditional medicines sold in India have found heavy metals above safe limits. Cupping can bruise, and wet cupping with dirty or reused tools can spread infection. Herbs can <b>interact</b> with medicines. In India, Unani medicines are licensed under the <b>Drugs and Cosmetics Act</b>, export batches must be tested for heavy metals, and the Ministry of AYUSH runs a scheme for reporting side effects. The biggest danger is <b>delay</b>: using any unproven remedy instead of seeing a doctor for a serious illness. Its sister systems face the same questions: see AyurvedaClear, HomeopathyClear, SiddhaClear and NaturopathyClear.</p>
    <p class="tip"><b>Try it:</b> set the hidden truth to 0, so the remedy does nothing. Switch off blinding and randomising, and the remedy seems to “work”. Switch them back on and the fake effect vanishes. Then give it a real effect and shrink the groups: small trials miss real effects. Switch the board to see the safety checks.</p>`,
  terms: [
    { t: 'Placebo', d: 'A dummy treatment that looks like the real one. The comfort of being treated can make people feel better.' },
    { t: 'Randomised', d: 'Patients are put in groups by chance, so the groups start out alike.' },
    { t: 'Blinded', d: 'Patients and assessors do not know who got the real treatment, so hopes cannot tip the result.' },
    { t: 'Systematic review', d: 'A study that gathers and weighs every good trial on a question.' },
    { t: 'Kushta', d: 'A Unani preparation made by strongly heating metals or minerals with herbs. Some contain toxic metals.' },
    { t: 'CTRI', d: 'Clinical Trials Registry–India, run by ICMR, where trials in India must be registered.' },
  ],
  defaults: { truth: 0, placebo: true, blind: true, random: true, n: 100, seed: 1, show: 'chart', labels: true },
  controls: [
    { key: 'truth', type: 'range', label: 'Hidden truth: how much the remedy really helps', min: 0, max: 0.3, step: 0.01, ends: ['nothing', '+30 points'], fmt: (v) => (v < 0.005 ? 'nothing' : '+' + Math.round(v * 100) + ' points') },
    { key: 'random', type: 'toggle', label: 'Randomise who gets what' },
    { key: 'blind', type: 'toggle', label: 'Blind patients and assessors' },
    { key: 'placebo', type: 'toggle', label: 'Give the other group a placebo' },
    { key: 'n', type: 'range', label: 'Patients in each group', min: 10, max: 300, step: 1, fmt: (v) => Math.round(v) },
    { key: 'again', type: 'buttons', label: 'Chance', items: [{ label: 'Run the trial again', act: (s) => { s.seed++; } }] },
    { key: 'show', type: 'seg', label: 'Board', options: [{ v: 'chart', label: 'Trial result' }, { v: 'safety', label: 'Safety checks' }] },
    { key: 'labels', type: 'toggle', label: 'Labels' },
  ],
  quiz: [
    { q: 'Why does a fair trial give the comparison group a placebo?', options: ['To save money', 'So both groups get the comfort of being treated, and only the real effect differs', 'Because placebos cure illness', 'To make the trial shorter'], answer: 1, why: 'The placebo response happens in both groups, so the difference between them shows what the remedy itself adds.' },
    { q: 'A remedy does nothing, but a trial that was not blinded shows it “works”. Why?', options: ['Luck only', 'People who knew who got it rated them better', 'The remedy has hidden powers', 'The groups were too big'], answer: 1, why: 'Hope and expectation tilt what patients report and what assessors see. Blinding stops that.' },
    { q: 'Which is a real safety concern with some traditional preparations?', options: ['They are always too weak to matter', 'Some contain toxic metals such as lead or mercury', 'They never interact with other medicines', 'Natural means safe'], answer: 1, why: 'Some kushtas and other preparations contain heavy metals. Herbs can also interact with prescribed medicines.' },
  ],
  reel: [
    { ms: 5400, caption: 'A remedy that does nothing can look like it works if a trial is not blinded or randomised.', set: { truth: 0, placebo: true, blind: false, random: false, n: 120, seed: 3, show: 'chart', labels: false }, view: { pos: [0, 3.2, 4.2], target: [0, 0.6, 0.4] }, spin: 0 },
    { ms: 5200, caption: 'Make it fair and the fake effect vanishes. Good trials of Unani remedies are still few.', set: { truth: 0, placebo: true, blind: true, random: true, n: 120, seed: 3, show: 'chart', labels: false }, view: { pos: [0, 3.2, 4.2], target: [0, 0.6, 0.4] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const X = [-1.4, 1.4];
    const pads = X.map((x, g) => { const p = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.1, 3.6), M.matte(g ? 0x2f3a4a : 0x3a3024)); p.position.set(x, -0.05, 0.4); p.receiveShadow = true; root.add(p); return p; });
    const figG = new THREE.CapsuleGeometry(0.07, 0.18, 4, 8); figG.translate(0, 0.16, 0);
    const hG = new THREE.SphereGeometry(0.065, 10, 8); hG.translate(0, 0.39, 0);
    const figs = [0, 1].map(() => { const a = new THREE.InstancedMesh(figG, new THREE.MeshStandardMaterial({ roughness: 0.6 }), SHOW), b = new THREE.InstancedMesh(hG, new THREE.MeshStandardMaterial({ roughness: 0.6 }), SHOW); root.add(a, b); return [a, b]; });
    const o = new THREE.Object3D();
    figs.forEach(([a, b], g) => { for (let i = 0; i < SHOW; i++) { o.position.set(X[g] - 0.9 + (i % 6) * 0.36, 0, -1.1 + Math.floor(i / 6) * 0.34); o.updateMatrix(); a.setMatrixAt(i, o.matrix); b.setMatrixAt(i, o.matrix); } });
    // Bottles: remedy and dummy.
    const bottle = (col) => { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.42, 20), M.plastic(col)); b.position.y = 0.21; const c = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 16), M.plastic(0xeeeeee)); c.position.y = 0.47; g.add(b, c); return { g, b }; };
    const b1 = bottle(0x8a4a1a), b2 = bottle(0x8a4a1a);
    b1.g.position.set(X[0], 0, 2.5); b2.g.position.set(X[1], 0, 2.5); root.add(b1.g, b2.g);
    // Blinding screen.
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.3, 3.6), M.clear(0x9db4ff, 0.3)); screen.position.set(0, 0.65, 0.4); root.add(screen);

    // Chart board.
    let res = null;
    const chart = canvasTexture(1100, 760, (g, w, h) => {
      g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(10,12,18,0.88)'; rrect(g, 0, 0, w, h, 28); g.fill();
      if (!res) return;
      const x0 = 120, y0 = h - 90, H = h - 220, bw = 220;
      g.strokeStyle = 'rgba(255,255,255,0.12)'; g.lineWidth = 2; g.fillStyle = 'rgba(255,255,255,0.5)'; g.font = '26px system-ui';
      for (let v = 0; v <= 100; v += 20) { const y = y0 - H * v / 100; g.beginPath(); g.moveTo(x0, y); g.lineTo(w - 40, y); g.stroke(); g.fillText(v + '%', 40, y + 8); }
      const draw = (i, parts, measured, name) => {
        const x = x0 + 60 + i * 420;
        let acc = 0;
        parts.forEach(([v, col, lab]) => { if (v <= 0.001) return; const y = y0 - H * (acc + v); g.fillStyle = col; g.fillRect(x, y, bw, H * v); if (H * v > 30) { g.fillStyle = '#10131a'; g.font = '600 24px system-ui'; g.fillText(lab, x + 12, y + H * v / 2 + 8); } acc += v; });
        const ym = y0 - H * measured; g.strokeStyle = '#fff'; g.lineWidth = 5; g.beginPath(); g.moveTo(x - 20, ym); g.lineTo(x + bw + 20, ym); g.stroke();
        g.fillStyle = '#fff'; g.font = '600 30px system-ui'; g.fillText(`${Math.round(measured * 100)}% better`, x + bw + 28, ym + 10);
        g.fillStyle = 'rgba(255,255,255,0.8)'; g.font = '600 28px system-ui'; g.fillText(name, x, y0 + 44);
      };
      const s = res.s;
      draw(0, [[BASE, '#9aa3b5', 'better anyway'], [PLACEBO, '#c9a7ff', 'placebo'], [s.random ? 0 : UNRAND, '#ff8a5c', 'unfair groups'], [s.blind ? 0 : UNBLIND, '#ffd166', 'not blinded'], [s.truth, '#6ee7a8', 'real effect']], res.a, 'Remedy group');
      draw(1, [[BASE, '#9aa3b5', 'better anyway'], [s.placebo ? PLACEBO : 0, '#c9a7ff', 'placebo']], res.b, s.placebo ? 'Placebo group' : 'No-pill group');
      g.fillStyle = '#fff'; g.font = '600 36px system-ui'; g.fillText('Why people got better (expected) · white line = this trial', 40, 60);
    });
    const cb = board(chart, 4.0, 2.76); cb.position.set(4.0, 1.75, -1.0); cb.rotation.y = -0.35; root.add(cb);

    const safe = canvasTexture(800, 1000, (g, w, h) => {
      g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(28,14,16,0.9)'; rrect(g, 0, 0, w, h, 28); g.fill();
      g.strokeStyle = '#ff8a8a'; g.lineWidth = 4; rrect(g, 12, 12, w - 24, h - 24, 20); g.stroke();
      g.fillStyle = '#ff9a9a'; g.font = '600 48px system-ui'; g.fillText('Safety checks', 40, 80);
      let y = 150;
      SAFETY.forEach(([t, d]) => { g.fillStyle = '#ffd166'; g.font = '600 32px system-ui'; g.fillText(t, 40, y); y += 42; g.fillStyle = '#f3ead8'; g.font = '27px system-ui'; y = wrap(g, d, 40, y, w - 80, 36) + 24; });
    });
    const sb = board(safe, 2.4, 3.0); sb.position.set(3.8, 1.75, -1.0); sb.rotation.y = -0.35; root.add(sb);

    const gl = [tint(stage.label('Remedy', [X[0], 0.9, 2.5], root), 'good'), tint(stage.label('Placebo', [X[1], 0.9, 2.5], root), 'purple')];
    const scrL = tint(stage.label('Blinded: nobody knows who got which', [0, 1.45, 1.6], root), 'blue');
    const cG = new THREE.Color(0x6ee7a8), cN = new THREE.Color(0x5a6070);
    let key = '';
    const fit = fitNarrow(stage, { pos: [1.6, 4.4, 7.4], target: [1.6, 0.8, -1.6] });
    return compactReadout(stage, {
      update(dt, s) {
        dt = Math.max(0, dt);
        const k = [s.truth, s.placebo, s.blind, s.random, Math.round(s.n), s.seed].join('|');
        if (k !== key) {
          key = k; res = runTrial({ ...s, n: Math.round(s.n) }); res.s = { ...s };
          chart.redraw();
          [res.a, res.b].forEach((p, gI) => {
            const nG = Math.round(p * SHOW);
            const [a, b] = figs[gI];
            for (let i = 0; i < SHOW; i++) { const c = i < nG ? cG : cN; a.setColorAt(i, c); b.setColorAt(i, c); }
            a.instanceColor.needsUpdate = b.instanceColor.needsUpdate = true;
          });
        }
        cb.visible = s.show !== 'safety'; sb.visible = s.show === 'safety';
        screen.visible = s.blind;
        b2.g.visible = s.placebo;
        const narrow = fit(), on = s.labels && !inReel();
        gl.forEach((l) => { l.visible = on; });
        gl[1].element.textContent = s.placebo ? 'Placebo (looks the same)' : 'No pill';
        scrL.visible = on && s.blind && !narrow;
      },
      readout: (s) => {
        if (!res) return '';
        const d = Math.round(res.d * 100), lo = Math.round(res.lo * 100), hi = Math.round(res.hi * 100);
        const sig = res.p < 0.05;
        const fake = (!s.blind || !s.random);
        const verdict = sig
          ? (s.truth < 0.005 ? 'Looks like it works, but it really does nothing: this is bias.' : fake ? 'Part of this “effect” is bias.' : 'A real effect, found fairly.')
          : (fake && s.truth < 0.005 ? 'Bias is pushing the remedy up. With more patients it would seem to “work”.' : s.truth > 0.005 ? 'A real effect was missed: try more patients.' : 'No real effect, and the fair test shows none.');
        return `<div class="big">${d >= 0 ? '+' : ''}${d} points</div>${rows([['Remedy group better', Math.round(res.a * 100) + '%'], [s.placebo ? 'Placebo group better' : 'No-pill group better', Math.round(res.b * 100) + '%'], ['95% range of the difference', `${lo} to ${hi} points`], ['Chance alone (p)', res.p < 0.001 ? 'under 0.001' : res.p.toFixed(3)]])}<small>${verdict} (${Math.round(s.n)} patients per group; simulated numbers.)</small>`;
      },
    });
  },
};
