// Набор 3 для @ai_mira.ai: 10 элитных эмоций только для суперфанатов.
// Мира в леопардовом образе со стримов (чёрные кошачьи ушки), ночной фон со звёздами,
// голографическое кольцо с бликом, золотые крылья, корона и чёрно-золотая лента.
// Голова увеличена относительно рамки, чтобы эмоции читались в маленьком размере в чате.
// Запуск: NODE_PATH=$(npm root -g) node emotes/mira3.js [префикс-id]
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const m = require('./mira');
const m2 = require('./mira2');

const { heart, star, sparkle, note, finger, palm, sleeve, at, mirror, SKIN, LINE, EYE_Y, EL, ER, M } = m;
const { eyeShift } = m2;
const OUT = path.join(__dirname, 'mira', 'superfans-elite');
const SIZE = 512;
const DARK = '#3a2210';
const SLEEVE_STROKE = '#3a6d93'; // заменяется на DARK в готовом SVG
const LABEL_MAX = 380; // максимальная ширина подписи на ленте

// Голова (с ушками, косичками и предметами на лице) крупнее тела и рамки.
const HEAD = 'translate(256 236) scale(1.12) translate(-256 -236)';
const FACE_FX = new Set(['shades', 'magnifier', 'headphones', 'sweat']);

// Мягкая ресница вместо «нахмуренной»: почти ровная дуга по верху глаза.
const SOFT_LASH = '<path d="M 30 -20 Q 2 -46 -30 -24 L -40 -31" fill="none" stroke="#3b2418" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>';
const soft = (s) => s.split(m.lash).join(SOFT_LASH);

// ---------- дополнительные градиенты и узоры ----------
const SPOTS = [[16, 16, 11], [60, 14, 9], [80, 52, 12], [32, 60, 10], [10, 84, 8], [62, 82, 9], [44, 36, 7]];
const defs3 = `
  <pattern id="sweater" patternUnits="userSpaceOnUse" width="96" height="96" patternTransform="rotate(12)">
    <rect width="96" height="96" fill="#e3a54e"/>
    ${SPOTS.map(([x, y, r], i) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${(r * 0.78).toFixed(1)}" transform="rotate(${i * 37} ${x} ${y})"
      fill="#b8742f" stroke="#24140a" stroke-width="${(r * 0.7).toFixed(1)}" stroke-linecap="round"
      stroke-dasharray="${(r * 1.4).toFixed(1)} ${(r * 0.7).toFixed(1)} ${(r * 1.0).toFixed(1)} ${(r * 0.8).toFixed(1)}"/>`).join('')}
    <circle cx="88" cy="28" r="3.5" fill="#24140a"/><circle cx="26" cy="40" r="3" fill="#24140a"/>
    <circle cx="46" cy="76" r="3" fill="#24140a"/><circle cx="90" cy="70" r="2.5" fill="#24140a"/>
  </pattern>
  <linearGradient id="holo" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ffe27a"/><stop offset=".25" stop-color="#ff8fd0"/><stop offset=".5" stop-color="#b98aff"/>
    <stop offset=".75" stop-color="#7fe3ff"/><stop offset="1" stop-color="#ffe27a"/>
  </linearGradient>
  <radialGradient id="night" cx="50%" cy="42%" r="60%">
    <stop offset="0" stop-color="#6b2bb0"/><stop offset=".55" stop-color="#3a0f6e"/><stop offset="1" stop-color="#16052b"/>
  </radialGradient>
  <radialGradient id="pinkglow" cx="50%" cy="50%" r="50%">
    <stop offset="0" stop-color="#ff8fd0" stop-opacity=".75"/><stop offset="1" stop-color="#ff8fd0" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="velvet" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#3a3a3a"/><stop offset="1" stop-color="#0a0a0a"/>
  </linearGradient>
  <linearGradient id="feather" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#fff1c2"/><stop offset="1" stop-color="#f2c14b"/>
  </linearGradient>
  <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ffffff" stop-opacity=".5"/><stop offset="1" stop-color="#bfe9ff" stop-opacity=".2"/>
  </linearGradient>
  <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#2a0b4a"/><stop offset=".6" stop-color="#000"/><stop offset="1" stop-color="#ff4f8b"/>
  </linearGradient>
  <linearGradient id="heartG" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ff9ac2"/><stop offset="1" stop-color="#ff1f63"/>
  </linearGradient>
  <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff6c8" stop-opacity=".75"/><stop offset=".8" stop-color="#fff6c8" stop-opacity="0"/>
  </linearGradient>
  <filter id="soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="7"/></filter>
  <clipPath id="lensclip"><circle cx="${EL}" cy="${EYE_Y}" r="50"/></clipPath>
  <clipPath id="discclip"><circle cx="256" cy="250" r="222"/></clipPath>
  <clipPath id="headclip"><rect x="-200" y="-200" width="912" height="670"/></clipPath>`;

// ---------- новые глаза и рты ----------
const shockEye = `<ellipse cx="0" cy="2" rx="27" ry="33" fill="#fff" stroke="#3b2418" stroke-width="5"/><circle cx="0" cy="4" r="9" fill="#14224d"/>`;
m.EYES.shock = () => at(EL, shockEye) + mirror(ER, shockEye);

Object.assign(m.MOUTHS, {
  grin: () => m.MOUTHS.open()
    + `<path d="M ${M.x - 29} ${M.y - 7} Q ${M.x} ${M.y + 1} ${M.x + 29} ${M.y - 7} L ${M.x + 26} ${M.y + 4} Q ${M.x} ${M.y + 12} ${M.x - 26} ${M.y + 4} Z" fill="#fff"/>`,
  scream: () => `<ellipse cx="${M.x}" cy="${M.y + 10}" rx="24" ry="31" fill="#a3263f" stroke="${LINE}" stroke-width="6"/>
    <ellipse cx="${M.x}" cy="${M.y + 29}" rx="14" ry="8" fill="#ff7f9a"/>`,
});

// ---------- детали ----------
const RUBY = '<circle cx="0" cy="-8" r="10" fill="#ff2d75" stroke="#8a0030" stroke-width="4"/>';
const crownShape = () => `
  <path d="M -54 26 L -60 -24 L -30 0 L 0 -40 L 30 0 L 60 -24 L 54 26 Z" fill="url(#gold)" stroke="#7a4a00" stroke-width="7" stroke-linejoin="round"/>
  <rect x="-58" y="20" width="116" height="20" rx="8" fill="url(#gold)" stroke="#7a4a00" stroke-width="6"/>
  ${RUBY}
  <circle cx="-34" cy="10" r="6" fill="#7fe3ff" stroke="#1d6fa8" stroke-width="3"/>
  <circle cx="34" cy="10" r="6" fill="#7fe3ff" stroke="#1d6fa8" stroke-width="3"/>
  <circle cx="-60" cy="-26" r="6" fill="#fff3a0" stroke="#7a4a00" stroke-width="3"/>
  <circle cx="0" cy="-42" r="6" fill="#fff3a0" stroke="#7a4a00" stroke-width="3"/>
  <circle cx="60" cy="-26" r="6" fill="#fff3a0" stroke="#7a4a00" stroke-width="3"/>
  <path d="M -40 30 H 40" stroke="#fff6c8" stroke-width="3" opacity=".8"/>
  <path d="M -44 -6 L -36 18" stroke="#fff" stroke-width="4" opacity=".7" stroke-linecap="round"/>`;
// «корона чата»: вместо рубина белый пузырь сообщения
const chatCrown = () => crownShape().replace(RUBY, `<rect x="-17" y="-22" width="34" height="24" rx="9" fill="#fff" stroke="#ff4f8b" stroke-width="4"/>
  <circle cx="-8" cy="-10" r="3" fill="#ff4f8b"/><circle cx="0" cy="-10" r="3" fill="#ff4f8b"/><circle cx="8" cy="-10" r="3" fill="#ff4f8b"/>`);

const bolt = (x, y, s, rot) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
  <path d="M 6 -40 L -18 6 L 0 6 L -8 40 L 20 -8 L 2 -8 Z" fill="#ffe14a" stroke="#b36b00" stroke-width="5" stroke-linejoin="round"/></g>`;

// жёлтые штрихи движения с тёмной подложкой, чтобы читались на светлых волосах
const strokes = (d, w = 7) => `<g fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path d="${d}" stroke="#7a4a00" stroke-width="${w + 6}"/><path d="${d}" stroke="#ffe14a" stroke-width="${w}"/></g>`;

const cuff = (x, y, rot, w = 44, h = 120) =>
  `<rect x="${x - w / 2}" y="${y}" width="${w}" height="${h}" rx="16" fill="url(#sweater)" stroke="${SLEEVE_STROKE}" stroke-width="7" transform="rotate(${rot} ${x} ${y})"/>`;

const miniRose = (x, y, r) => `
  <path d="M ${x} ${y} q ${-r * 1.9} ${r * 0.1} ${-r * 1.7} ${r * 1.1} q ${r * 1.1} ${r * 0.4} ${r * 1.7} ${-r * 1.1} Z" fill="#3ccf7a" stroke="#1d7a3e" stroke-width="3" stroke-linejoin="round"/>
  <path d="M ${x} ${y} q ${r * 1.9} ${r * 0.1} ${r * 1.7} ${r * 1.1} q ${-r * 1.1} ${r * 0.4} ${-r * 1.7} ${-r * 1.1} Z" fill="#3ccf7a" stroke="#1d7a3e" stroke-width="3" stroke-linejoin="round"/>
  ${[0, 72, 144, 216, 288].map((a) => `<circle cx="${(x + r * 0.55 * Math.cos(((a - 90) * Math.PI) / 180)).toFixed(1)}" cy="${(y + r * 0.55 * Math.sin(((a - 90) * Math.PI) / 180)).toFixed(1)}"
    r="${(r * 0.62).toFixed(1)}" fill="#ff5c84" stroke="#fff" stroke-width="3"/>`).join('')}
  <circle cx="${x}" cy="${y}" r="${r * 0.6}" fill="#ff2d55" stroke="#fff" stroke-width="3"/>
  <path d="M ${x} ${y} m -${r * 0.2} 0 a ${r * 0.2} ${r * 0.2} 0 1 1 ${r * 0.4} 0 a ${r * 0.35} ${r * 0.35} 0 1 1 -${r * 0.7} 0"
    fill="none" stroke="#9a0a28" stroke-width="3" stroke-linecap="round"/>`;

const raysAround = (cx, cy, n, r1, r2, fill, opacity) => {
  let s = '';
  for (let i = 0; i < n * 2; i += 2) {
    const a1 = (i * Math.PI) / n, a2 = ((i + 1) * Math.PI) / n;
    s += `<path d="M ${cx} ${cy} L ${(cx + r2 * Math.cos(a1)).toFixed(1)} ${(cy + r2 * Math.sin(a1)).toFixed(1)}
      L ${(cx + r2 * Math.cos(a2)).toFixed(1)} ${(cy + r2 * Math.sin(a2)).toFixed(1)} Z" fill="${fill}"/>`;
  }
  return `<g clip-path="url(#discclip)" opacity="${opacity}">${s}</g>`;
};

// ---------- реквизит ----------
Object.assign(m.PROPS, {
  eliteSparkles: () => sparkle(86, 150, 24, '#fff') + sparkle(430, 140, 20, '#fff') + sparkle(72, 300, 14, '#fff') + sparkle(150, 70, 10, '#fff'),
  heartBurst: () => [[64, 160, 24], [104, 96, 14], [446, 110, 20], [474, 210, 14], [52, 290, 16], [462, 318, 20], [418, 384, 12]]
    .map(([x, y, s], i) => heart(x, y, s, i % 2 ? '#ff9ac2' : '#ff4f8b')).join('') + sparkle(140, 60, 12, '#fff'),
  bigHeart: () => sleeve(198, 392, -18) + sleeve(314, 392, 18) + heart(256, 392, 58, 'url(#heartG)')
    + `<path d="M 226 366 q 6 -12 20 -12" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".8"/>`
    + palm(206, 390, 21) + palm(306, 390, 21) + sparkle(296, 356, 9, '#fff'),
  shades: () => `
    <path d="M 148 206 H 364" stroke="#111" stroke-width="10" stroke-linecap="round"/>
    <path d="M ${EL - 46} 204 H ${EL + 40} Q ${EL + 42} 258 ${EL} 260 Q ${EL - 44} 258 ${EL - 46} 204 Z" fill="url(#shade)" stroke="#111" stroke-width="7" stroke-linejoin="round"/>
    <path d="M ${ER + 46} 204 H ${ER - 40} Q ${ER - 42} 258 ${ER} 260 Q ${ER + 44} 258 ${ER + 46} 204 Z" fill="url(#shade)" stroke="#111" stroke-width="7" stroke-linejoin="round"/>
    <path d="M ${EL - 30} 214 l 24 0 l -28 32 Z" fill="#fff" opacity=".7"/>
    <path d="M ${ER - 22} 214 l 24 0 l -28 32 Z" fill="#fff" opacity=".7"/>`,
  thumb: () => `<g transform="translate(405 330) scale(1.2) translate(-405 -330)">${sleeve(404, 384, 12)}
    <rect x="380" y="268" width="26" height="62" rx="13" fill="${SKIN}" stroke="${LINE}" stroke-width="6" transform="rotate(-8 393 300)"/>
    <rect x="372" y="316" width="66" height="62" rx="20" fill="${SKIN}" stroke="${LINE}" stroke-width="6"/>
    <path d="M 406 334 H 432 M 406 350 H 432 M 406 366 H 430" stroke="${LINE}" stroke-width="4" stroke-linecap="round"/></g>`,
  bolts: () => bolt(72, 170, 1.6, -12) + bolt(84, 300, 1.0, -20) + bolt(452, 150, 1.0, 18) + sparkle(120, 90, 12, '#fff'),
  fistUp: () => `<g transform="translate(410 300) scale(1.2) translate(-410 -300)">
      ${cuff(411, 290, 8, 62, 140)}
      <rect x="380" y="232" width="62" height="70" rx="22" fill="${SKIN}" stroke="${LINE}" stroke-width="6"/>
      <path d="M 383 252 q 7.4 -16 14.8 0 q 7.4 -16 14.8 0 q 7.4 -16 14.8 0 q 7.4 -16 14.8 0" fill="none" stroke="${LINE}" stroke-width="5" stroke-linecap="round"/>
      <rect x="384" y="266" width="46" height="22" rx="11" fill="${SKIN}" stroke="${LINE}" stroke-width="5"/></g>`
    + strokes('M 412 200 v -22 M 452 214 l 14 -12') + bolt(468, 248, 0.55, 25),
  spotlights: () => `<g clip-path="url(#discclip)">
      <path d="M 40 20 L 120 20 L 300 470 L 150 470 Z" fill="url(#beam)"/>
      <path d="M 392 20 L 472 20 L 362 470 L 212 470 Z" fill="url(#beam)"/></g>`
    + star(80, 160, 14, '#fff3a0', '#b07a00') + star(120, 86, 9, '#fff3a0', '#b07a00') + star(60, 300, 10, '#fff3a0', '#b07a00'),
  laurel: () => {
    let s = '';
    for (let i = 0; i < 7; i++) {
      const deg = 135 + i * 13, a = (deg * Math.PI) / 180;
      const x = 256 + 200 * Math.cos(a), y = 250 + 200 * Math.sin(a);
      const leaf = (lx, rot) => `<ellipse cx="${lx.toFixed(1)}" cy="${y.toFixed(1)}" rx="9" ry="20" fill="url(#gold)" stroke="#7a4a00" stroke-width="3" transform="rotate(${rot} ${lx.toFixed(1)} ${y.toFixed(1)})"/>`;
      s += leaf(x, deg + 60) + leaf(512 - x, -(deg + 60));
    }
    return s;
  },
  goldStar: () => sleeve(392, 366, 16) + `<g transform="rotate(-8 424 296)">
      <polygon points="${m.starPts(424, 296, 68)}" fill="url(#gold)" stroke="#7a4a00" stroke-width="8" stroke-linejoin="round"/>
      <polygon points="${m.starPts(424, 300, 32)}" fill="#fff6c8" opacity=".7"/></g>`
    + palm(380, 350, 22) + finger(396, 340, 26, 40) + sparkle(452, 206, 14, '#fff') + sparkle(470, 360, 10, '#fff'),
  likeHearts: () => heart(446, 130, 18) + heart(470, 214, 12, '#ff9ac2') + heart(424, 390, 12),
  magnifier: () => `
    <path d="M ${EL - 34} ${EYE_Y + 36} L 112 352" stroke="#7a4a00" stroke-width="24" stroke-linecap="round"/>
    <path d="M ${EL - 34} ${EYE_Y + 36} L 112 352" stroke="url(#gold)" stroke-width="13" stroke-linecap="round"/>
    ${sleeve(114, 356, -20)}${palm(114, 348, 20)}
    <circle cx="${EL}" cy="${EYE_Y}" r="50" fill="${SKIN}"/>
    <g clip-path="url(#lensclip)"><g transform="translate(${EL} ${EYE_Y + 4}) scale(1.5)">${soft(eyeShift(0, 0))}</g></g>
    <circle cx="${EL}" cy="${EYE_Y}" r="50" fill="url(#glass)"/>
    <circle cx="${EL}" cy="${EYE_Y}" r="50" fill="none" stroke="#7a4a00" stroke-width="17"/>
    <circle cx="${EL}" cy="${EYE_Y}" r="50" fill="none" stroke="url(#gold)" stroke-width="9"/>
    <path d="M ${EL - 30} ${EYE_Y - 20} q 12 -16 32 -18" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".9"/>`,
  notesElite: () => note(80, 150, 1.1) + note(66, 296, 0.8, '#3a9de0') + note(416, 168, 0.9, '#f3c14b') + sparkle(452, 226, 12, '#fff'),
  headphones: () => `
    <path d="M 134 236 C 118 30, 394 30, 378 236" fill="none" stroke="#2a0b4a" stroke-width="22" stroke-linecap="round"/>
    <path d="M 134 236 C 118 30, 394 30, 378 236" fill="none" stroke="#ff4f8b" stroke-width="12" stroke-linecap="round"/>
    <rect x="110" y="198" width="48" height="86" rx="20" fill="#ff4f8b" stroke="#2a0b4a" stroke-width="7"/>
    <rect x="354" y="198" width="48" height="86" rx="20" fill="#ff4f8b" stroke="#2a0b4a" stroke-width="7"/>
    <rect x="122" y="214" width="22" height="54" rx="10" fill="#ffd1e6"/>
    <rect x="368" y="214" width="22" height="54" rx="10" fill="#ffd1e6"/>`,
  vinyl: () => `<circle cx="428" cy="340" r="58" fill="#151515" stroke="#000" stroke-width="5"/>
    <g fill="none" stroke="#3a3a3a" stroke-width="2"><circle cx="428" cy="340" r="48"/><circle cx="428" cy="340" r="40"/><circle cx="428" cy="340" r="32"/></g>
    <path d="M 392 312 A 46 46 0 0 1 430 294" fill="none" stroke="#fff" stroke-width="5" opacity=".35" stroke-linecap="round"/>
    <circle cx="428" cy="340" r="19" fill="#ff4f8b"/><circle cx="428" cy="340" r="4" fill="#fff"/>`
    + sleeve(384, 384, 18) + palm(384, 374, 22) + finger(398, 362, 22, 52),
  flowers: () => miniRose(86, 176, 20) + miniRose(118, 106, 14) + miniRose(432, 150, 16) + miniRose(70, 292, 14)
    + sparkle(470, 220, 10, '#fff') + sparkle(160, 50, 10, '#fff'),
  clap: () => cuff(418, 322, 8) + cuff(458, 322, -8) + `
    <g transform="rotate(8 418 330)"><rect x="402" y="232" width="32" height="104" rx="16" fill="${SKIN}" stroke="${LINE}" stroke-width="6"/>
      <rect x="388" y="282" width="18" height="40" rx="9" fill="${SKIN}" stroke="${LINE}" stroke-width="5" transform="rotate(-25 397 302)"/></g>
    <g transform="rotate(-8 458 330)"><rect x="442" y="232" width="32" height="104" rx="16" fill="${SKIN}" stroke="${LINE}" stroke-width="6"/>
      <rect x="470" y="282" width="18" height="40" rx="9" fill="${SKIN}" stroke="${LINE}" stroke-width="5" transform="rotate(25 479 302)"/></g>`
    + strokes('M 418 212 l -10 -16 M 438 204 v -20 M 458 212 l 10 -16'),
  crownHold: () => cuff(418, 316, 6) + `<g transform="translate(418 256) rotate(8) scale(1.1)">${chatCrown()}</g>`
    + palm(418, 320, 24) + finger(398, 310, 18, -12) + finger(412, 306, 20, -4) + finger(426, 306, 20, 4) + finger(440, 310, 18, 12)
    + strokes('M 392 192 l -8 -16 M 418 184 v -20 M 444 192 l 8 -16', 6) + sparkle(474, 196, 12, '#fff'),
  flash: () => raysAround(256, 230, 16, 0, 320, '#fff', 0.16),
  shockFx: () => {
    const d = 'M 72 150 L 108 172 M 62 224 L 104 226 M 74 298 L 108 280 M 440 150 L 404 172 M 450 224 L 408 226 M 438 298 L 404 280';
    return `<g stroke-linecap="round" fill="none"><path d="${d}" stroke="#7a4a00" stroke-width="15"/><path d="${d}" stroke="#ffe14a" stroke-width="10"/></g>`;
  },
  sweat: () => `<path d="M 372 150 q -18 30 0 44 q 18 -14 0 -44 Z" fill="#9fe2ff" stroke="#2a8fd6" stroke-width="5"/>
    <g stroke="#7b6cff" stroke-width="6" stroke-linecap="round" opacity=".8">
      <path d="M 222 166 V 190"/><path d="M 238 160 V 192"/><path d="M 254 166 V 190"/></g>`,
  respect: () => `
    <polygon points="${(() => {
      const p = [];
      for (let i = 0; i < 24; i++) {
        const r = i % 2 ? 52 : 84, a = ((i * 15 - 90) * Math.PI) / 180;
        p.push(`${(428 + r * Math.cos(a)).toFixed(1)},${(318 + r * Math.sin(a)).toFixed(1)}`);
      }
      return p.join(' ');
    })()}" fill="#ffe14a" stroke="#b36b00" stroke-width="5" stroke-linejoin="round"/>
    ${sleeve(420, 340, 10)}
    <rect x="382" y="278" width="92" height="84" rx="26" fill="${SKIN}" stroke="${LINE}" stroke-width="7"/>
    <path d="M 405 282 V 318 M 428 280 V 318 M 451 282 V 318" stroke="${LINE}" stroke-width="4" stroke-linecap="round"/>
    <rect x="386" y="318" width="72" height="28" rx="14" fill="${SKIN}" stroke="${LINE}" stroke-width="5"/>`,
});
['bigHeart', 'thumb', 'fistUp', 'goldStar', 'vinyl', 'clap', 'crownHold', 'respect'].forEach((p) => m.FRONT.add(p));

// ---------- элитное оформление ----------
const WING = [[-168, 112, 22], [-150, 134, 26], [-132, 160, 28], [-114, 152, 26], [-96, 126, 24]];
const feather = (ang, len, w, fill) => `<g transform="translate(104 196) rotate(${ang})">
  <path d="M 0 0 C ${len * 0.3} ${-w}, ${len * 0.8} ${-w * 0.8}, ${len} 0 C ${len * 0.8} ${w * 0.8}, ${len * 0.3} ${w}, 0 0 Z"
    fill="${fill}" stroke="#7a4a00" stroke-width="6" stroke-linejoin="round"/>
  <path d="M 8 0 H ${len * 0.85}" stroke="#c9902a" stroke-width="3" stroke-linecap="round"/></g>`;
const wing = () => WING.map(([a, l, w], i) => feather(a, l, w, i % 2 ? 'url(#feather)' : 'url(#gold)')).join('')
  + WING.map(([a, l, w]) => feather(a, l * 0.62, w * 0.8, '#fff8e0')).join('');

const disc = () => {
  const dots = [[200, 60, 1.8], [330, 50, 2], [60, 220, 1.5], [460, 240, 1.8], [150, 400, 2], [370, 410, 1.8], [96, 180, 1.4], [420, 300, 1.4]];
  const twinkles = [[120, 110], [400, 90], [90, 330], [430, 360]];
  return `<circle cx="256" cy="250" r="230" fill="url(#night)"/>
    ${dots.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".9"/>`).join('')}
    ${twinkles.map(([x, y]) => sparkle(x, y, 7, '#fff')).join('')}
    <circle cx="256" cy="232" r="190" fill="url(#pinkglow)"/>
    <g clip-path="url(#discclip)"><circle cx="256" cy="250" r="224" fill="none" stroke="#ff8fd0" stroke-width="22" opacity=".55" filter="url(#soft)"/></g>
    <circle cx="256" cy="250" r="240" fill="none" stroke="#2a0b4a" stroke-width="8"/>
    <circle cx="256" cy="250" r="230" fill="none" stroke="url(#holo)" stroke-width="20"/>
    <circle cx="256" cy="250" r="218" fill="none" stroke="#ffd84a" stroke-width="3"/>
    <path d="M 56.8 135 A 230 230 0 0 1 177.3 33.9" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".85"/>
    ${sparkle(177, 34, 16, '#fff')}`;
};

const leoBody = () => `
  <path d="M 116 480 C 106 404, 168 354, 256 350 C 344 354, 406 404, 396 480 Q 256 452 116 480 Z"
    fill="url(#sweater)" stroke="${DARK}" stroke-width="8" stroke-linejoin="round"/>
  <path d="M 234 318 V 362 Q 256 370 278 362 V 318 Z" fill="${SKIN}" stroke="${LINE}" stroke-width="6"/>
  <path d="M 220 356 Q 256 378 292 356" fill="none" stroke="${DARK}" stroke-width="16" stroke-linecap="round"/>
  <path d="M 220 356 Q 256 378 292 356" fill="none" stroke="#e3a54e" stroke-width="8" stroke-linecap="round"/>`;

const leoEars = () => `
  <path d="M 146 140 L 150 34 L 232 98 Z" fill="#2a2a2a" stroke="#111" stroke-width="8" stroke-linejoin="round"/>
  <path d="M 162 118 L 164 64 L 208 98 Z" fill="#ff9fc8"/>
  <path d="M 366 140 L 362 34 L 280 98 Z" fill="#2a2a2a" stroke="#111" stroke-width="8" stroke-linejoin="round"/>
  <path d="M 350 118 L 348 64 L 304 98 Z" fill="#ff9fc8"/>`;

const defaultFsz = (text) => Math.min(60, Math.round(390 / (text.length * 0.68)));
const ribbon3 = (text, fsz) => {
  const o = Math.round(fsz * 0.35);
  return `
    <path d="M 70 448 L 8 446 L 34 474 L 8 504 L 84 502 Z" fill="#111" stroke="#c99a2e" stroke-width="6" stroke-linejoin="round"/>
    <path d="M 442 448 L 504 446 L 478 474 L 504 504 L 428 502 Z" fill="#111" stroke="#c99a2e" stroke-width="6" stroke-linejoin="round"/>
    <path d="M 40 432 Q 256 400 472 432 L 472 494 Q 256 462 40 494 Z" fill="url(#velvet)" stroke="#c99a2e" stroke-width="7" stroke-linejoin="round"/>
    <path d="M 52 442 Q 256 411 460 442" fill="none" stroke="#a07a1e" stroke-width="2.5" opacity=".8"/>
    <path d="M 52 484 Q 256 453 460 484" fill="none" stroke="#a07a1e" stroke-width="2.5" opacity=".8"/>
    <path id="rb3" d="M 30 ${463 + o} Q 256 ${431 + o} 482 ${463 + o}" fill="none"/>
    <text id="lbl" font-family="Inter" font-weight="900" font-size="${fsz}" letter-spacing="-1" fill="url(#gold)"
      stroke="#000" stroke-width="8" stroke-linejoin="round" paint-order="stroke">
      <textPath href="#rb3" startOffset="50%" text-anchor="middle">${text}</textPath></text>`;
};

function eliteMira(e, fsz = defaultFsz(e.label)) {
  const props = [].concat(e.props || []);
  const faceFx = props.filter((p) => FACE_FX.has(p));
  const front = props.filter((p) => m.FRONT.has(p) && !FACE_FX.has(p));
  const back = props.filter((p) => !m.FRONT.has(p) && !FACE_FX.has(p));
  const run = (list) => list.map((p) => m.PROPS[p]()).join('');
  const defs = m.defs.replace('id="sweater"', 'id="sweater-blue"').replace('</defs>', `${m2.extraDefs}${defs3}</defs>`);
  const crown = e.crown === false ? ''
    : `<g transform="${e.crownT || 'translate(256 28)'}">${crownShape()}</g>${e.crownFx || sparkle(306, 8, 10, '#fff')}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 512 512">
    ${defs}
    <g filter="url(#sticker)" transform="translate(256 258) scale(.86) translate(-256 -250)">
      <g>${wing()}</g><g transform="translate(512 0) scale(-1 1)">${wing()}</g>
      ${disc()}
      ${run(back)}
      <g clip-path="url(#headclip)"><g transform="${HEAD}">${m.hairBack()}</g></g>
      ${leoBody()}
      <g clip-path="url(#headclip)"><g transform="${HEAD}">
        ${m.braid(150, -1)}${m.braid(362, 1)}
        ${leoEars()}
        ${m.face()}
        ${m.cheeks(e.blush)}
        ${soft(m.EYES[e.eyes]())}
        ${m.MOUTHS[e.mouth]()}
        ${m.bangs()}
        ${run(faceFx)}
      </g></g>
      ${run(front)}
      ${crown}
      ${ribbon3(e.label, fsz)}
    </g>
  </svg>`;
  // рукава и манжеты леопардовые с тёмной обводкой
  return svg.replace(new RegExp(SLEEVE_STROKE, 'g'), DARK);
}

const ELITE = [
  { id: '01-ya-tebya-lyublyu', label: 'Я ТЕБЯ ЛЮБЛЮ', eyes: 'heart', mouth: 'open', props: ['heartBurst', 'bigHeart'], blush: true },
  { id: '02-kruto', label: 'КРУТО!', eyes: 'happy', mouth: 'grin', props: ['eliteSparkles', 'shades', 'thumb'] },
  { id: '03-imba', label: 'ИМБА!', eyes: 'laugh', mouth: 'grin', props: ['bolts', 'fistUp'] },
  { id: '04-legenda', label: 'ЛЕГЕНДА', eyes: 'star', mouth: 'open', props: ['spotlights', 'laurel', 'goldStar'] },
  { id: '05-vizhu-tebya', label: 'ВИЖУ ТЕБЯ', eyes: 'wink', mouth: 'cat', props: ['likeHearts', 'magnifier'] },
  { id: '06-hit', label: 'ХИТ!', eyes: 'happy', mouth: 'open', props: ['notesElite', 'headphones', 'vinyl'] },
  { id: '07-bravo', label: 'БРАВО!', eyes: 'happy', mouth: 'open', props: ['flowers', 'clap'], blush: true },
  { id: '08-korol-chata', label: 'КОРОЛЬ ЧАТА', eyes: 'sly', mouth: 'fang', props: ['invite', 'crownHold'], crown: false },
  { id: '09-shok', label: 'ШОК!', eyes: 'shock', mouth: 'scream', props: ['flash', 'shockFx', 'sweat'],
    crownT: 'translate(300 34) rotate(22)',
    crownFx: '<path d="M 226 14 q -10 14 -2 28 M 210 26 q -8 10 -2 20" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>' },
  { id: '10-respekt', label: 'РЕСПЕКТ', eyes: 'wink', mouth: 'grin', props: ['respect'] },
];

module.exports = { eliteMira, ELITE };

if (require.main === module) (async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const only = process.argv[2];
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: SIZE, height: SIZE } });
  const show = async (svg) => {
    await page.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
    await page.evaluate(() => document.fonts.ready);
  };
  for (const e of ELITE) {
    if (only && !e.id.startsWith(only)) continue;
    // подпись должна поместиться на ленте: меряем реальную ширину и уменьшаем шрифт при необходимости
    let fsz = defaultFsz(e.label);
    await show(eliteMira(e, fsz));
    const width = await page.evaluate(() => document.getElementById('lbl').getComputedTextLength());
    if (width > LABEL_MAX) {
      fsz = Math.floor((fsz * LABEL_MAX) / width);
      await show(eliteMira(e, fsz));
    }
    await page.locator('svg').screenshot({ path: path.join(OUT, `${e.id}.png`), omitBackground: true });
    console.log(`${e.id}: label ${Math.round(width)}px -> font ${fsz}`);
  }
  await browser.close();
})();
