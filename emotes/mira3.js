// Набор 3 для @ai_mira.ai: 10 элитных эмоций только для суперфанатов.
// Мира в леопардовом образе со стримов (чёрные кошачьи ушки), ночной фон со звёздами,
// голографическое кольцо, золотые крылья, корона и чёрно-золотая лента.
// Запуск: NODE_PATH=$(npm root -g) node emotes/mira3.js
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const m = require('./mira');
const m2 = require('./mira2');

const { heart, star, sparkle, palm, sleeve, at, mirror, SKIN, LINE, EYE_Y, EL, ER, M } = m;
const { openHand, eyeShift } = m2;
const OUT = path.join(__dirname, 'mira', 'superfans-elite');
const SIZE = 512;
const DARK = '#3a2210';

// ---------- дополнительные градиенты и узоры ----------
const SPOTS = [[10, 12, 7], [40, 8, 6], [54, 36, 8], [22, 42, 6], [6, 58, 5], [44, 58, 5], [30, 24, 4]];
const defs3 = `
  <pattern id="sweater" patternUnits="userSpaceOnUse" width="64" height="64" patternTransform="rotate(12)">
    <rect width="64" height="64" fill="#eab36c"/>
    ${SPOTS.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#c98438" stroke="#2e1a0c" stroke-width="${(r * 0.55).toFixed(1)}"
      stroke-dasharray="${(r * 1.2).toFixed(1)} ${(r * 0.5).toFixed(1)} ${(r * 0.9).toFixed(1)} ${(r * 0.6).toFixed(1)}"/>`).join('')}
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
  <clipPath id="lensclip"><circle cx="${EL}" cy="${EYE_Y}" r="50"/></clipPath>
  <clipPath id="discclip"><circle cx="256" cy="250" r="222"/></clipPath>`;

// ---------- новые глаза и рты ----------
const shockEye = `<ellipse cx="0" cy="2" rx="27" ry="33" fill="#fff" stroke="#3b2418" stroke-width="5"/><circle cx="0" cy="4" r="6" fill="#14224d"/>`;
m.EYES.shock = () => at(EL, shockEye) + mirror(ER, shockEye);

Object.assign(m.MOUTHS, {
  grin: () => m.MOUTHS.open()
    + `<path d="M ${M.x - 29} ${M.y - 7} Q ${M.x} ${M.y + 1} ${M.x + 29} ${M.y - 7} L ${M.x + 26} ${M.y + 4} Q ${M.x} ${M.y + 12} ${M.x - 26} ${M.y + 4} Z" fill="#fff"/>`,
  scream: () => `<ellipse cx="${M.x}" cy="${M.y + 10}" rx="20" ry="26" fill="#a3263f" stroke="${LINE}" stroke-width="6"/>
    <ellipse cx="${M.x}" cy="${M.y + 25}" rx="12" ry="8" fill="#ff7f9a"/>`,
});

// ---------- детали ----------
const crownShape = () => `
  <path d="M -54 26 L -60 -24 L -30 0 L 0 -40 L 30 0 L 60 -24 L 54 26 Z" fill="url(#gold)" stroke="#7a4a00" stroke-width="7" stroke-linejoin="round"/>
  <rect x="-58" y="20" width="116" height="20" rx="8" fill="url(#gold)" stroke="#7a4a00" stroke-width="6"/>
  <circle cx="0" cy="-8" r="10" fill="#ff2d75" stroke="#8a0030" stroke-width="4"/>
  <circle cx="-34" cy="10" r="6" fill="#7fe3ff" stroke="#1d6fa8" stroke-width="3"/>
  <circle cx="34" cy="10" r="6" fill="#7fe3ff" stroke="#1d6fa8" stroke-width="3"/>
  <circle cx="-60" cy="-26" r="6" fill="#fff3a0" stroke="#7a4a00" stroke-width="3"/>
  <circle cx="0" cy="-42" r="6" fill="#fff3a0" stroke="#7a4a00" stroke-width="3"/>
  <circle cx="60" cy="-26" r="6" fill="#fff3a0" stroke="#7a4a00" stroke-width="3"/>
  <path d="M -40 30 H 40" stroke="#fff6c8" stroke-width="3" opacity=".8"/>`;

const gem = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M 0 -18 L 14 0 L 0 18 L -14 0 Z" fill="#7fe3ff" stroke="#1d6fa8" stroke-width="4" stroke-linejoin="round"/>
  <path d="M 0 -18 L 5 0 L 0 18 Z" fill="#e6fbff" opacity=".8"/></g>`;

const bolt = (x, y, s, rot) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
  <path d="M 6 -40 L -18 6 L 0 6 L -8 40 L 20 -8 L 2 -8 Z" fill="#ffe14a" stroke="#b36b00" stroke-width="5" stroke-linejoin="round"/></g>`;

const miniRose = (x, y, r) => `
  <ellipse cx="${x - r * 0.6}" cy="${y + r * 0.3}" rx="${r * 0.5}" ry="${r * 0.7}" fill="#ff2d55" stroke="#7a0018" stroke-width="3" transform="rotate(-30 ${x} ${y})"/>
  <ellipse cx="${x + r * 0.6}" cy="${y + r * 0.3}" rx="${r * 0.5}" ry="${r * 0.7}" fill="#ff2d55" stroke="#7a0018" stroke-width="3" transform="rotate(30 ${x} ${y})"/>
  <circle cx="${x}" cy="${y}" r="${r}" fill="#e8173f" stroke="#7a0018" stroke-width="4"/>
  <path d="M ${x} ${y} m -${r * 0.2} 0 a ${r * 0.2} ${r * 0.2} 0 1 1 ${r * 0.4} 0 a ${r * 0.45} ${r * 0.45} 0 1 1 -${r * 0.9} 0"
    fill="none" stroke="#9a0a28" stroke-width="3" stroke-linecap="round"/>`;

// ---------- реквизит ----------
Object.assign(m.PROPS, {
  heartBurst: () => [[64, 160, 24], [104, 96, 14], [446, 110, 20], [474, 210, 14], [52, 290, 16], [462, 318, 20], [400, 40, 12]]
    .map(([x, y, s], i) => heart(x, y, s, i % 2 ? '#ff9ac2' : '#ff4f8b')).join('') + sparkle(140, 60, 12, '#fff'),
  bigHeart: () => heart(256, 404, 72, 'url(#heartG)')
    + `<path d="M 214 372 q 10 -16 30 -14" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".75"/>`
    + palm(200, 410, 22) + palm(312, 410, 22),
  shades: () => `
    <path d="M 148 206 H 364" stroke="#111" stroke-width="10" stroke-linecap="round"/>
    <path d="M ${EL - 46} 204 H ${EL + 40} Q ${EL + 42} 258 ${EL} 260 Q ${EL - 44} 258 ${EL - 46} 204 Z" fill="url(#shade)" stroke="#111" stroke-width="7" stroke-linejoin="round"/>
    <path d="M ${ER + 46} 204 H ${ER - 40} Q ${ER - 42} 258 ${ER} 260 Q ${ER + 44} 258 ${ER + 46} 204 Z" fill="url(#shade)" stroke="#111" stroke-width="7" stroke-linejoin="round"/>
    <path d="M ${EL - 30} 214 l 24 0 l -28 32 Z" fill="#fff" opacity=".7"/>
    <path d="M ${ER - 22} 214 l 24 0 l -28 32 Z" fill="#fff" opacity=".7"/>`,
  thumb: () => sleeve(404, 384, 12) + `
    <rect x="380" y="268" width="26" height="62" rx="13" fill="${SKIN}" stroke="${LINE}" stroke-width="6" transform="rotate(-8 393 300)"/>
    <rect x="372" y="316" width="66" height="62" rx="20" fill="${SKIN}" stroke="${LINE}" stroke-width="6"/>
    <path d="M 406 334 H 432 M 406 350 H 432 M 406 366 H 430" stroke="${LINE}" stroke-width="4" stroke-linecap="round"/>`
    + sparkle(456, 262, 16, '#fff'),
  bolts: () => bolt(70, 170, 1.3, -12) + bolt(450, 150, 1.2, 14) + bolt(58, 304, 0.9, -20)
    + sparkle(110, 90, 12, '#fff') + sparkle(466, 262, 12, '#fff'),
  fistUp: () => sleeve(410, 300, 10) + `
    <rect x="380" y="232" width="62" height="70" rx="22" fill="${SKIN}" stroke="${LINE}" stroke-width="6"/>
    <path d="M 396 236 V 258 M 411 234 V 258 M 426 236 V 258" stroke="${LINE}" stroke-width="4" stroke-linecap="round"/>
    <rect x="384" y="264" width="44" height="22" rx="11" fill="${SKIN}" stroke="${LINE}" stroke-width="5"/>
    <path d="M 372 230 l -14 -12 M 412 214 v -20 M 450 230 l 14 -12" stroke="#ffe14a" stroke-width="7" stroke-linecap="round"/>`,
  spotlights: () => `<g clip-path="url(#discclip)">
      <path d="M 40 20 L 120 20 L 300 470 L 150 470 Z" fill="#fff6c8" opacity=".22"/>
      <path d="M 392 20 L 472 20 L 362 470 L 212 470 Z" fill="#fff6c8" opacity=".22"/></g>`
    + star(80, 160, 14, '#fff3a0', '#b07a00') + star(120, 86, 9, '#fff3a0', '#b07a00') + star(452, 118, 12, '#fff3a0', '#b07a00')
    + star(60, 300, 10, '#fff3a0', '#b07a00') + sparkle(470, 220, 10, '#fff'),
  goldStar: () => `<g transform="rotate(-8 424 300)">
      <polygon points="${m.starPts(424, 300, 62)}" fill="url(#gold)" stroke="#7a4a00" stroke-width="8" stroke-linejoin="round"/>
      <polygon points="${m.starPts(424, 304, 30)}" fill="#fff6c8" opacity=".7"/></g>`
    + palm(380, 350, 22) + sparkle(480, 240, 14, '#fff') + sparkle(470, 360, 10, '#fff'),
  magnifier: () => `
    <path d="M ${EL - 34} ${EYE_Y + 36} L 112 352" stroke="#7a4a00" stroke-width="24" stroke-linecap="round"/>
    <path d="M ${EL - 34} ${EYE_Y + 36} L 112 352" stroke="url(#gold)" stroke-width="13" stroke-linecap="round"/>
    <circle cx="${EL}" cy="${EYE_Y}" r="50" fill="${SKIN}"/>
    <g clip-path="url(#lensclip)"><g transform="translate(${EL} ${EYE_Y + 4}) scale(1.5)">${eyeShift(0, 0)}</g></g>
    <circle cx="${EL}" cy="${EYE_Y}" r="50" fill="url(#glass)"/>
    <circle cx="${EL}" cy="${EYE_Y}" r="50" fill="none" stroke="#7a4a00" stroke-width="17"/>
    <circle cx="${EL}" cy="${EYE_Y}" r="50" fill="none" stroke="url(#gold)" stroke-width="9"/>
    <path d="M ${EL - 30} ${EYE_Y - 20} q 12 -16 32 -18" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".9"/>`
    + heart(446, 120, 18) + heart(474, 210, 12, '#ff9ac2') + heart(420, 60, 10),
  headphones: () => `
    <path d="M 134 236 C 118 30, 394 30, 378 236" fill="none" stroke="#2a0b4a" stroke-width="22" stroke-linecap="round"/>
    <path d="M 134 236 C 118 30, 394 30, 378 236" fill="none" stroke="#ff4f8b" stroke-width="12" stroke-linecap="round"/>
    <rect x="110" y="198" width="48" height="86" rx="20" fill="#ff4f8b" stroke="#2a0b4a" stroke-width="7"/>
    <rect x="354" y="198" width="48" height="86" rx="20" fill="#ff4f8b" stroke="#2a0b4a" stroke-width="7"/>
    <rect x="122" y="214" width="22" height="54" rx="10" fill="#ffd1e6"/>
    <rect x="368" y="214" width="22" height="54" rx="10" fill="#ffd1e6"/>`,
  vinyl: () => `<circle cx="428" cy="334" r="58" fill="#151515" stroke="#000" stroke-width="5"/>
    <g fill="none" stroke="#3a3a3a" stroke-width="2"><circle cx="428" cy="334" r="48"/><circle cx="428" cy="334" r="40"/><circle cx="428" cy="334" r="32"/></g>
    <path d="M 392 306 A 46 46 0 0 1 430 288" fill="none" stroke="#fff" stroke-width="5" opacity=".35" stroke-linecap="round"/>
    <circle cx="428" cy="334" r="19" fill="#ff4f8b"/><circle cx="428" cy="334" r="4" fill="#fff"/>`
    + palm(380, 366, 20),
  flowers: () => miniRose(70, 160, 18) + miniRose(116, 84, 12) + miniRose(448, 112, 16) + miniRose(52, 292, 13)
    + sparkle(470, 210, 12, '#fff') + sparkle(150, 40, 10, '#fff'),
  clap: () => openHand(370, 340, 30) + openHand(426, 334, -30)
    + `<path d="M 372 258 l -12 -18 M 398 248 v -22 M 424 256 l 12 -18" stroke="#ffe14a" stroke-width="7" stroke-linecap="round"/>`,
  crownHold: () => `<g transform="translate(428 270) rotate(10) scale(1.1)">${crownShape()}</g>`
    + palm(378, 316, 21) + palm(478, 324, 21) + sparkle(474, 196, 14, '#fff') + sparkle(380, 200, 9, '#fff'),
  shockFx: () => `<g fill="none" stroke="#ffe14a" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 52 130 l 26 8 l -16 16 l 28 8"/><path d="M 40 230 l 30 -2 l -14 20 l 30 0"/>
      <path d="M 460 120 l -26 8 l 16 16 l -28 8"/><path d="M 472 230 l -30 -2 l 14 20 l -30 0"/></g>`,
  sweat: () => `<path d="M 372 150 q -18 30 0 44 q 18 -14 0 -44 Z" fill="#9fe2ff" stroke="#2a8fd6" stroke-width="5"/>
    <g stroke="#7b6cff" stroke-width="5" stroke-linecap="round" opacity=".55">
      <path d="M 214 168 V 192"/><path d="M 232 164 V 194"/><path d="M 250 162 V 196"/><path d="M 268 162 V 196"/><path d="M 286 164 V 194"/></g>`,
  respect: () => sleeve(414, 374, 12) + `
    <polygon points="${(() => {
      const p = [];
      for (let i = 0; i < 24; i++) {
        const r = i % 2 ? 52 : 84, a = ((i * 15 - 90) * Math.PI) / 180;
        p.push(`${(428 + r * Math.cos(a)).toFixed(1)},${(318 + r * Math.sin(a)).toFixed(1)}`);
      }
      return p.join(' ');
    })()}" fill="#ffe14a" stroke="#b36b00" stroke-width="5" stroke-linejoin="round"/>
    <rect x="382" y="278" width="92" height="84" rx="26" fill="${SKIN}" stroke="${LINE}" stroke-width="7"/>
    <path d="M 405 282 V 318 M 428 280 V 318 M 451 282 V 318" stroke="${LINE}" stroke-width="4" stroke-linecap="round"/>
    <rect x="386" y="318" width="72" height="28" rx="14" fill="${SKIN}" stroke="${LINE}" stroke-width="5"/>`,
});
['bigHeart', 'shades', 'thumb', 'fistUp', 'goldStar', 'magnifier', 'headphones', 'vinyl', 'clap', 'crownHold', 'sweat', 'respect']
  .forEach((p) => m.FRONT.add(p));

// ---------- элитное оформление ----------
const wing = () => [[-168, 118, 22], [-150, 150, 26], [-132, 168, 28], [-114, 160, 26], [-96, 132, 24]]
  .map(([ang, len, w]) => `<g transform="translate(104 196) rotate(${ang})">
    <path d="M 0 0 C ${len * 0.3} ${-w}, ${len * 0.8} ${-w * 0.8}, ${len} 0 C ${len * 0.8} ${w * 0.8}, ${len * 0.3} ${w}, 0 0 Z"
      fill="url(#feather)" stroke="#b8860b" stroke-width="5" stroke-linejoin="round"/>
    <path d="M 8 0 H ${len * 0.85}" stroke="#e0b44a" stroke-width="3" stroke-linecap="round"/></g>`).join('');

const disc = () => {
  const stars = [[120, 110, 2.5], [400, 90, 2], [90, 330, 2], [430, 360, 2.5], [200, 60, 1.8], [330, 50, 2],
    [60, 220, 1.5], [460, 240, 1.8], [150, 400, 2], [370, 410, 1.8], [96, 180, 1.4], [420, 300, 1.4]];
  return `<circle cx="256" cy="250" r="230" fill="url(#night)"/>
    ${stars.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".9"/>`).join('')}
    <circle cx="256" cy="232" r="190" fill="url(#pinkglow)"/>
    <circle cx="256" cy="250" r="240" fill="none" stroke="#2a0b4a" stroke-width="8"/>
    <circle cx="256" cy="250" r="230" fill="none" stroke="url(#holo)" stroke-width="20"/>
    <circle cx="256" cy="250" r="218" fill="none" stroke="#ffd84a" stroke-width="3"/>
    ${gem(26, 250, 1.1)}${gem(486, 250, 1.1)}`;
};

const leoBody = () => `
  <path d="M 120 480 C 112 420, 170 372, 256 368 C 342 372, 400 420, 392 480 Q 256 452 120 480 Z"
    fill="url(#sweater)" stroke="${DARK}" stroke-width="8" stroke-linejoin="round"/>
  <path d="M 234 318 V 380 Q 256 388 278 380 V 318 Z" fill="${SKIN}" stroke="${LINE}" stroke-width="6"/>
  <path d="M 214 372 Q 256 396 298 372" fill="none" stroke="${DARK}" stroke-width="16" stroke-linecap="round"/>
  <path d="M 214 372 Q 256 396 298 372" fill="none" stroke="#eab36c" stroke-width="8" stroke-linecap="round"/>`;

const leoEars = () => `
  <path d="M 146 140 L 150 34 L 232 98 Z" fill="#2a2a2a" stroke="#111" stroke-width="8" stroke-linejoin="round"/>
  <path d="M 162 118 L 164 64 L 208 98 Z" fill="#ff9fc8"/>
  <path d="M 366 140 L 362 34 L 280 98 Z" fill="#2a2a2a" stroke="#111" stroke-width="8" stroke-linejoin="round"/>
  <path d="M 350 118 L 348 64 L 304 98 Z" fill="#ff9fc8"/>`;

const ribbon3 = (text) => {
  const fsz = Math.min(74, Math.round(400 / (text.length * 0.66)));
  const o = Math.round(fsz * 0.35);
  return `
    <path d="M 70 448 L 8 446 L 34 474 L 8 504 L 84 502 Z" fill="#111" stroke="#c99a2e" stroke-width="6" stroke-linejoin="round"/>
    <path d="M 442 448 L 504 446 L 478 474 L 504 504 L 428 502 Z" fill="#111" stroke="#c99a2e" stroke-width="6" stroke-linejoin="round"/>
    <path d="M 40 432 Q 256 400 472 432 L 472 494 Q 256 462 40 494 Z" fill="url(#velvet)" stroke="#c99a2e" stroke-width="7" stroke-linejoin="round"/>
    <path d="M 52 442 Q 256 411 460 442" fill="none" stroke="#ffd84a" stroke-width="3"/>
    <path d="M 52 484 Q 256 453 460 484" fill="none" stroke="#ffd84a" stroke-width="3"/>
    ${gem(40, 463, 0.7)}${gem(472, 463, 0.7)}
    <path id="rb3" d="M 30 ${463 + o} Q 256 ${431 + o} 482 ${463 + o}" fill="none"/>
    <text font-family="Inter" font-weight="900" font-size="${fsz}" letter-spacing="-1" fill="url(#goldText)"
      stroke="#000" stroke-width="8" stroke-linejoin="round" paint-order="stroke">
      <textPath href="#rb3" startOffset="50%" text-anchor="middle">${text}</textPath></text>`;
};

function eliteMira(e) {
  const props = [].concat(e.props || []);
  const front = props.filter((p) => m.FRONT.has(p));
  const back = props.filter((p) => !m.FRONT.has(p));
  const defs = m.defs.replace('id="sweater"', 'id="sweater-blue"').replace('</defs>', `${m2.extraDefs}${defs3}</defs>`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 512 512">
    ${defs}
    <g filter="url(#sticker)" transform="translate(256 256) scale(.88) translate(-256 -252)">
      <g>${wing()}</g><g transform="translate(512 0) scale(-1 1)">${wing()}</g>
      ${disc()}
      ${back.map((p) => m.PROPS[p]()).join('')}
      ${m.hairBack()}
      ${leoBody()}
      ${m.braid(150, -1)}${m.braid(362, 1)}
      ${leoEars()}
      ${m.face()}
      ${m.cheeks(e.blush)}
      ${m.EYES[e.eyes]()}
      ${m.MOUTHS[e.mouth]()}
      ${m.bangs()}
      ${front.map((p) => m.PROPS[p]()).join('')}
      <g transform="translate(256 22)">${crownShape()}</g>
      ${ribbon3(e.label)}
    </g>
  </svg>`;
  // рукава леопардовые с тёмной обводкой
  return svg.replace(/#3a6d93/g, DARK);
}

const ELITE = [
  { id: '01-ya-tebya-lyublyu', label: 'Я ТЕБЯ ЛЮБЛЮ', eyes: 'heart', mouth: 'open', props: ['heartBurst', 'bigHeart'], blush: true },
  { id: '02-kruto', label: 'КРУТО!', eyes: 'happy', mouth: 'grin', props: ['sparkles', 'shades', 'thumb'] },
  { id: '03-imba', label: 'ИМБА!', eyes: 'star', mouth: 'grin', props: ['bolts', 'fistUp'] },
  { id: '04-legenda', label: 'ЛЕГЕНДА', eyes: 'star', mouth: 'open', props: ['spotlights', 'goldStar'] },
  { id: '05-vizhu-tebya', label: 'ВИЖУ ТЕБЯ', eyes: 'wink', mouth: 'cat', props: ['magnifier'] },
  { id: '06-hit', label: 'ХИТ!', eyes: 'happy', mouth: 'open', props: ['notesL', 'headphones', 'vinyl'] },
  { id: '07-bravo', label: 'БРАВО!', eyes: 'happy', mouth: 'open', props: ['flowers', 'clap'], blush: true },
  { id: '08-korol-chata', label: 'КОРОЛЬ ЧАТА', eyes: 'star', mouth: 'open', props: ['invite', 'crownHold'] },
  { id: '09-shok', label: 'ШОК!', eyes: 'shock', mouth: 'scream', props: ['shockFx', 'sweat'] },
  { id: '10-respekt', label: 'РЕСПЕКТ', eyes: 'wink', mouth: 'grin', props: ['respect'] },
];

module.exports = { eliteMira, ELITE };

if (require.main === module) (async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const only = process.argv[2];
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: SIZE, height: SIZE } });
  for (const e of ELITE) {
    if (only && !e.id.startsWith(only)) continue;
    await page.setContent(`<html><body style="margin:0;background:transparent">${eliteMira(e)}</body></html>`);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('svg').screenshot({ path: path.join(OUT, `${e.id}.png`), omitBackground: true });
  }
  await browser.close();
  console.log('ok');
})();
