// Chapter 6: using it wisely. A person on a round platform, ringed by the six essential factors.
// Pick a factor to see what Unani says about it next to today's evidence-based advice, with Indian
// sources first. A board lists the safety rules for using any system of medicine.
// Sources:
//  - Air: CPCB National Ambient Air Quality Standards (2009): PM2.5 40 µg/m³ yearly, 60 µg/m³ daily;
//    WHO Global Air Quality Guidelines (2021): 5 µg/m³ yearly. India State-Level Disease Burden
//    Initiative (ICMR, PHFI, IHME), Lancet Planet Health 3:e26 (2019): 1.24 million deaths in India in
//    2017 attributable to air pollution, 12.5% of all deaths.
//  - Food: ICMR-NIN, "Dietary Guidelines for Indians" (2024): added salt at most 5 g a day; limit
//    added sugar to about 25 g a day; an estimated 56.4% of India's disease burden is linked to
//    unhealthy diets; half the plate vegetables and fruits.
//  - Movement: ICMR-NIN (2024): at least 30–45 minutes of moderate activity a day for adults, and 60
//    minutes a day for children; WHO Guidelines on physical activity (2020): 150–300 minutes a week
//    for adults, an average of 60 minutes a day for ages 5–17.
//  - Emotions: NIMHANS, National Mental Health Survey of India 2015–16: 10.6% of adults had a mental
//    disorder; Tele-MANAS national helpline 14416 (Ministry of Health and Family Welfare, 2022).
//  - Sleep: American Academy of Sleep Medicine consensus: 8–10 hours for ages 13–18 (Paruthi et al.,
//    J Clin Sleep Med 12:785, 2016) and 7 or more for adults (Watson et al., Sleep 38:843, 2015).
//  - Retention and elimination: fewer than three bowel movements a week counts as constipation
//    (NIDDK); adequate total water about 2.0 L a day for women and 2.5 L for men, from food and drink
//    (EFSA, 2010); fibre from whole grains, pulses, vegetables and fruit (ICMR-NIN 2024).
//  - India emergency numbers 112 and 108; practitioner registration: NCISM Act 2020 and state boards.
import { THREE, M, canvasTexture, torus } from '../kit.js';
import { SIX, board, tint, fitNarrow, compactReadout, inReel, rows, rrect, wrap, person } from '../unani.js';

const INFO = {
  air: { unani: 'Fresh, clean air keeps the humours healthy; foul air brings disease.', modern: 'Polluted air harms the lungs, heart and brain.', num: [['India limit, PM2.5 (CPCB)', '40 µg/m³ a year'], ['WHO guideline, PM2.5', '5 µg/m³ a year'], ['Deaths in India linked to air pollution (2017)', 'about 1 in 8']], note: 'On high-smog days, limit hard exercise outdoors. People with asthma should follow their doctor’s plan.' },
  food: { unani: 'Eat in moderation, suited to your mizaj and the season.', modern: 'Plenty of vegetables, fruit, pulses and whole grains; little salt and sugar.', num: [['Added salt (ICMR-NIN 2024)', 'at most 5 g a day'], ['Added sugar (ICMR-NIN 2024)', 'about 25 g a day at most'], ['Disease burden linked to diet, India', 'about 56%']], note: 'Half the plate as vegetables and fruit is NIN’s simple rule of thumb.' },
  move: { unani: 'Riyazat (exercise) and rest in the right amounts keep the body balanced.', modern: 'Regular activity protects the heart, bones, mood and blood sugar.', num: [['Adults (ICMR-NIN 2024)', '30–45 min a day'], ['Children (ICMR-NIN, WHO)', '60 min a day'], ['Adults (WHO)', '150–300 min a week']], note: 'Walking, cycling, sports, dance and yoga all count.' },
  mind: { unani: 'Anger, grief, fear and joy all move the humours; calm is healthy.', modern: 'Mental health is health. Stress, anxiety and depression are common and treatable.', num: [['Adults with a mental disorder, India (NMHS 2016)', 'about 1 in 10'], ['Free national helpline', 'Tele-MANAS 14416'], ['First step', 'talk to someone you trust']], note: 'If you or a friend feel unsafe, call 112 or Tele-MANAS 14416 now.' },
  sleep: { unani: 'Enough sleep at the right time; too much or too little upsets balance.', modern: 'Sleep repairs the body and fixes memories. Teens need more than adults.', num: [['Ages 13–18', '8–10 hours'], ['Adults', '7 hours or more'], ['Helps', 'regular times, no screens in bed']], note: 'Long-lasting snoring or daytime sleepiness is worth a doctor’s visit.' },
  out: { unani: 'The body must keep what it needs and let out waste: urine, stool, sweat.', modern: 'Water and fibre keep the kidneys and gut working well.', num: [['Water, women (EFSA)', 'about 2.0 L a day'], ['Water, men (EFSA)', 'about 2.5 L a day'], ['Constipation (NIDDK)', 'under 3 times a week']], note: 'Blood in urine or stool, or a lasting change, needs a doctor.' },
};
const RULES = [
  'Never stop or change a prescribed medicine on your own.',
  'Tell every doctor and hakim everything you take, herbs included.',
  'Serious or sudden illness: see a qualified doctor at once. Emergency: 112 or 108.',
  'Choose registered practitioners: a hakim should hold a BUMS degree and state registration.',
  'Buy licensed products. Be wary of “miracle cure” ads and report side effects.',
  'Take extra care for children, pregnancy and older people.',
];

export default {
  id: 'wisely',
  short: 'Using it wisely',
  title: 'Where old advice and new science meet',
  subtitle: 'The six factors, today’s evidence, and rules for staying safe.',
  view: { pos: [0.4, 5.0, 11.2], target: [0.0, 1.3, -0.4] },
  learn: `<p>Many Indian families use Unani, Ayurveda, homeopathy and modern medicine side by side. That is a personal choice, and it can be made safely if you follow a few rules.</p>
    <p><b>Never stop a prescribed medicine</b> on your own, for example for diabetes, blood pressure, epilepsy, asthma or tuberculosis. <b>Tell every doctor and hakim everything you take</b>, including herbal medicines, because they can interact. For a <b>serious or sudden illness</b>, such as chest pain, high fever in a baby, trouble breathing or signs of stroke, go to a qualified doctor or hospital straight away (in India call <b>112</b> or <b>108</b>). Choose <b>registered practitioners</b> and <b>licensed products</b>, and be wary of anyone promising a cure for everything.</p>
    <p>There is real common ground, too. Unani's <b>six essential factors</b> (air, food and drink, movement and rest, emotions, sleep and waking, and what the body keeps and lets out) match much of today's advice on healthy living. The reasons differ: Unani talks of humours, modern science of cells, germs and chemistry. But clean air, good food, exercise, sleep and a calm mind are backed by strong evidence. Indian bodies such as <b>ICMR-NIN</b>, which writes India's dietary guidelines, and <b>NIMHANS</b> give practical targets. Modern medicine has its own limits, like side effects, antibiotic resistance and cost: see MedicineClear.</p>
    <p class="tip"><b>Try it:</b> pick each of the six factors. Compare what Unani says with the modern advice and its numbers. Which ones could you change this week?</p>`,
  terms: [
    { t: 'Prescribed medicine', d: 'A medicine a registered doctor has chosen for you. Never stop it without asking them.' },
    { t: 'Interaction', d: 'When one medicine or herb changes how another works, sometimes dangerously.' },
    { t: 'Registered practitioner', d: 'Someone with a recognised degree (MBBS, BUMS, BAMS, BHMS and so on) and a licence to practise.' },
    { t: 'ICMR-NIN', d: 'The National Institute of Nutrition in Hyderabad, which writes India’s dietary guidelines.' },
    { t: 'Tele-MANAS', d: 'India’s free national mental-health helpline, 14416.' },
  ],
  defaults: { factor: 'food', labels: true },
  controls: [
    { key: 'factor', type: 'seg', label: 'Factor', options: SIX.map((f) => ({ v: f.key, label: f.name.split(' ')[0] })), fmt: (v) => SIX.find((f) => f.key === v).name },
    { key: 'labels', type: 'toggle', label: 'Labels' },
  ],
  quiz: [
    { q: 'You are taking a doctor’s medicine for diabetes and want to try a Unani remedy. What should you do?', options: ['Stop the doctor’s medicine first', 'Keep taking it and tell both your doctor and hakim everything you take', 'Take double of both', 'Keep it secret'], answer: 1, why: 'Never stop a prescribed medicine on your own, and always tell every practitioner what you take, because herbs can interact.' },
    { q: 'Which is one of Unani’s six essential factors that modern advice also stresses?', options: ['Sleep and waking', 'The colour of your clothes', 'Your star sign', 'The shape of your nose'], answer: 0, why: 'Air, food, movement, emotions, sleep and elimination all match areas where modern evidence gives clear advice.' },
    { q: 'How much added salt a day do India’s ICMR-NIN guidelines allow at most?', options: ['1 g', '5 g', '15 g', '30 g'], answer: 1, why: 'The 2024 Dietary Guidelines for Indians say at most 5 g of added salt a day.' },
  ],
  reel: [
    { ms: 5600, caption: 'Clean air, good food, exercise, sleep and calm: here old advice and new science agree.', set: { factor: 'move', labels: false }, view: { pos: [0, 3.6, 7], target: [0, 1, 0] }, spin: 0.6 },
    { ms: 5000, caption: 'Never stop prescribed medicine, tell every doctor what you take, and see one when seriously ill.', set: { factor: 'mind', labels: false }, view: { pos: [2.5, 2.4, 2.9], target: [5.3, 2.1, -1.6] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const plat = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.8, 0.16, 64), M.matte(0x262b36)); plat.position.y = -0.08; plat.receiveShadow = true; root.add(plat);
    const loop = torus(3.6, 0.025, M.glow(0x6ee7a8, { transparent: true, opacity: 0.35 }), 128); loop.rotation.x = Math.PI / 2; loop.position.y = 0.02; root.add(loop);
    const pm = new THREE.MeshStandardMaterial({ color: 0xd9c7b0, roughness: 0.6 });
    const who = person(pm, { h: 1.9 }); root.add(who);
    const halo = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.62, 48), M.glow(0x6ee7a8, { transparent: true, opacity: 0.6, side: THREE.DoubleSide })); halo.rotation.x = -Math.PI / 2; halo.position.y = 0.02; root.add(halo);
    const pil = SIX.map((f, i) => {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2 - Math.PI / 6, x = Math.cos(a) * 3.6, z = Math.sin(a) * 3.6;
      const col = new THREE.Color(f.col);
      const mat = new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.2, roughness: 0.5 });
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 1, 24), mat); p.position.set(x, 0.5, z); p.castShadow = true;
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 12), M.glow(col)); orb.position.set(x, 1.2, z);
      const beamM = M.glow(col, { transparent: true, opacity: 0.0 });
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1, 8), beamM);
      const A = new THREE.Vector3(x, 1.2, z), B = new THREE.Vector3(0, 1.2, 0);
      beam.position.copy(A).add(B).multiplyScalar(0.5); beam.scale.y = A.distanceTo(B); beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
      root.add(p, orb, beam);
      const l = tint(stage.label(f.name, [x, 1.75, z], root), f.col);
      return { f, p, mat, orb, beam, l, x, z };
    });
    const rb = canvasTexture(900, 900, (g, w, h) => {
      g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(12,20,18,0.92)'; rrect(g, 0, 0, w, h, 28); g.fill();
      g.strokeStyle = '#6ee7a8'; g.lineWidth = 4; rrect(g, 12, 12, w - 24, h - 24, 20); g.stroke();
      g.fillStyle = '#6ee7a8'; g.font = '600 48px system-ui'; g.fillText('Using any medicine wisely', 40, 84);
      let y = 160;
      RULES.forEach((r, i) => { g.fillStyle = '#6ee7a8'; g.font = '600 34px system-ui'; g.fillText(`${i + 1}`, 44, y); g.fillStyle = '#eef6f2'; g.font = '31px system-ui'; y = wrap(g, r, 90, y, w - 130, 40) + 26; });
    });
    const rbM = board(rb, 3.4, 3.4); rbM.position.set(5.3, 2.1, -1.6); rbM.rotation.y = -0.6; root.add(rbM);

    let t = 0;
    const fit = fitNarrow(stage, { pos: [0.9, 7.2, 7.8], target: [0.9, 0.6, -1.8] });
    return compactReadout(stage, {
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        pil.forEach((p) => {
          const on = p.f.key === s.factor;
          p.mat.emissiveIntensity = on ? 0.9 : 0.15;
          p.p.scale.y += ((on ? 1.5 : 1) - p.p.scale.y) * Math.min(1, dt * 5); p.p.position.y = 0.5 * p.p.scale.y;
          p.orb.position.y = 0.2 + p.p.scale.y + 0.08 * Math.sin(t * 2);
          p.beam.material.opacity = on ? 0.55 + 0.25 * Math.sin(t * 4) : 0.08;
        });
        const sel = pil.find((p) => p.f.key === s.factor);
        halo.material.color.set(sel.f.col);
        who.rotation.y = Math.atan2(sel.x, sel.z);
        const narrow = fit(), on = s.labels && !inReel();
        pil.forEach((p) => { p.l.visible = on && (!narrow || p.f.key === s.factor); p.l.element.style.fontWeight = p.f.key === s.factor ? '700' : '500'; });
      },
      readout: (s) => {
        const f = SIX.find((x) => x.key === s.factor), I = INFO[s.factor];
        return `<div class="big">${f.name}</div>${rows(I.num)}<small><b>Unani (${f.urdu}):</b> ${I.unani} <b>Today:</b> ${I.note}</small>`;
      },
    });
  },
};
