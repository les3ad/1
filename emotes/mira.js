// Эмоции фан-клуба для @ai_mira.ai: чиби-Мира (блондинка с косичками, голубой свитер,
// белый воротник, жёлтая отделка, розовая тема). SVG -> PNG 512x512 с прозрачным фоном.
// Запуск: NODE_PATH=$(npm root -g) node emotes/mira.js
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const OUT = path.join(__dirname, 'mira');
const SIZE = 512;
const LINE = '#6b3f2a';
const SKIN = '#ffe6d8';
const HAIR_LINE = '#9a6a24';

// ---------- примитивы ----------
const heart = (x, y, s, fill = '#ff4f8b', stroke = '#a3134a') =>
  `<path d="M ${x} ${y + s * 0.42} C ${x - s * 1.05} ${y - s * 0.2}, ${x - s * 0.55} ${y - s * 1.0}, ${x} ${y - s * 0.42}
   C ${x + s * 0.55} ${y - s * 1.0}, ${x + s * 1.05} ${y - s * 0.2}, ${x} ${y + s * 0.42} Z"
   fill="${fill}" stroke="${stroke}" stroke-width="${Math.max(3, s * 0.12)}" stroke-linejoin="round"/>`;

const starPts = (x, y, r, inner = 0.45) => {
  const p = [];
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * inner : r;
    const a = ((-90 + i * 36) * Math.PI) / 180;
    p.push(`${(x + rr * Math.cos(a)).toFixed(1)},${(y + rr * Math.sin(a)).toFixed(1)}`);
  }
  return p.join(' ');
};
const star = (x, y, r, fill = '#fff3a0', stroke = '#d08a00') =>
  `<polygon points="${starPts(x, y, r)}" fill="${fill}" stroke="${stroke}" stroke-width="${r * 0.14}" stroke-linejoin="round"/>`;

const sparkle = (x, y, r, fill = '#fff') =>
  `<path d="M ${x} ${y - r} Q ${x + r * 0.15} ${y - r * 0.15} ${x + r} ${y} Q ${x + r * 0.15} ${y + r * 0.15} ${x} ${y + r}
   Q ${x - r * 0.15} ${y + r * 0.15} ${x - r} ${y} Q ${x - r * 0.15} ${y - r * 0.15} ${x} ${y - r} Z"
   fill="${fill}" stroke="#ff7fb0" stroke-width="${r * 0.14}" stroke-linejoin="round"/>`;

const note = (x, y, s = 1, fill = '#ff4f8b') => `
  <g transform="translate(${x} ${y}) scale(${s})" stroke="#7a1240" stroke-width="4" stroke-linejoin="round">
    <ellipse cx="0" cy="0" rx="14" ry="10" transform="rotate(-20)" fill="${fill}"/>
    <path d="M 11 -4 V -52 Q 30 -44 34 -26 Q 26 -36 15 -36 V -4" fill="${fill}"/>
  </g>`;

// ---------- голова и тело ----------
const hairBack = () => `
  <path d="M 112 230 C 95 110, 175 52, 256 52 C 337 52, 417 110, 400 230 C 395 285, 380 320, 362 330 L 150 330 C 132 320, 117 285, 112 230 Z"
    fill="url(#hair)" stroke="${HAIR_LINE}" stroke-width="8" stroke-linejoin="round"/>`;

const body = (tiara) => `
  <path d="M 118 500 C 112 420, 170 372, 256 368 C 342 372, 400 420, 394 500 Q 256 520 118 500 Z"
    fill="url(#sweater)" stroke="#3a6d93" stroke-width="8" stroke-linejoin="round"/>
  <path d="M 178 386 L 256 462 L 334 386" fill="none" stroke="#f3c14b" stroke-width="16" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M 178 386 L 256 462 L 334 386" fill="none" stroke="#fff6c8" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" opacity=".8"/>
  <rect x="236" y="318" width="40" height="34" fill="${SKIN}" stroke="${LINE}" stroke-width="6"/>
  <path d="M 210 352 Q 256 330 302 352 L 300 392 Q 256 412 212 392 Z" fill="#ffffff" stroke="#8aa8c0" stroke-width="7" stroke-linejoin="round"/>
  <path d="M 222 366 Q 256 352 290 366 M 222 380 Q 256 368 290 380" fill="none" stroke="#cfdbe6" stroke-width="5" stroke-linecap="round"/>
  ${tiara ? `<polygon points="${starPts(200, 440, 13)}" fill="#fff" stroke="#3a6d93" stroke-width="3"/>
             <polygon points="${starPts(312, 440, 13)}" fill="#fff" stroke="#3a6d93" stroke-width="3"/>` : ''}`;

const braid = (x, dir) => {
  let s = '';
  for (let i = 0; i < 5; i++) {
    const cx = x + dir * i * 3;
    const cy = 300 + i * 30;
    s += `<ellipse cx="${cx}" cy="${cy}" rx="${27 - i * 1.5}" ry="21" fill="url(#hair)" stroke="${HAIR_LINE}" stroke-width="6"
      transform="rotate(${dir * (i % 2 ? 18 : -18)} ${cx} ${cy})"/>`;
  }
  const ty = 300 + 5 * 30 - 8;
  const tx = x + dir * 15;
  return s + `
    <rect x="${tx - 15}" y="${ty - 12}" width="30" height="16" rx="7" fill="#ff7fb0" stroke="#a3134a" stroke-width="5"/>
    <path d="M ${tx - 14} ${ty + 4} Q ${tx} ${ty + 38} ${tx + 14} ${ty + 4} Z" fill="url(#hair)" stroke="${HAIR_LINE}" stroke-width="6" stroke-linejoin="round"/>`;
};

const face = () => `
  <path d="M 146 205 C 146 120, 366 120, 366 205 C 366 285, 312 338, 256 340 C 200 338, 146 285, 146 205 Z"
    fill="${SKIN}" stroke="${LINE}" stroke-width="8" stroke-linejoin="round"/>
  <path d="M 252 262 q 4 6 8 0" fill="none" stroke="#d99a86" stroke-width="4" stroke-linecap="round"/>`;

const cheeks = (strong) => `
  <ellipse cx="186" cy="275" rx="${strong ? 32 : 24}" ry="${strong ? 17 : 12}" fill="#ff8fb0" opacity="${strong ? 0.8 : 0.55}"/>
  <ellipse cx="326" cy="275" rx="${strong ? 32 : 24}" ry="${strong ? 17 : 12}" fill="#ff8fb0" opacity="${strong ? 0.8 : 0.55}"/>
  ${strong ? `<path d="M 170 270 l 8 -10 M 184 272 l 8 -10 M 310 270 l 8 -10 M 324 272 l 8 -10" stroke="#e0507a" stroke-width="4" stroke-linecap="round"/>` : ''}`;

const bangs = () => `
  <path d="M 128 222 C 118 120, 190 68, 262 70 C 340 72, 400 128, 384 226
    Q 372 190 356 178 Q 352 196 340 206 Q 330 162 300 146 Q 292 172 270 186
    Q 262 154 238 136 Q 220 168 190 180 Q 196 166 190 150 Q 160 176 150 230 Q 140 214 128 222 Z"
    fill="url(#hair)" stroke="${HAIR_LINE}" stroke-width="8" stroke-linejoin="round"/>
  <path d="M 196 100 Q 240 84 290 92" fill="none" stroke="#fffbe6" stroke-width="10" stroke-linecap="round" opacity=".8"/>`;

const tiara = () => `
  <g transform="rotate(-6 256 80)">
    <path d="M 178 104 Q 256 84 334 104 L 322 82 L 300 92 L 282 62 L 256 82 L 230 62 L 212 92 L 190 82 Z"
      fill="url(#silver)" stroke="#5b7fa8" stroke-width="6" stroke-linejoin="round"/>
    <path d="M 256 50 L 270 74 L 256 92 L 242 74 Z" fill="#7fd6ff" stroke="#2a6fd6" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="212" cy="90" r="7" fill="#ff7fb0" stroke="#a3134a" stroke-width="3"/>
    <circle cx="300" cy="90" r="7" fill="#ff7fb0" stroke="#a3134a" stroke-width="3"/>
  </g>`;

// ---------- глаза ----------
const EYE_Y = 228;
const EL = 204, ER = 308;
const mirror = (x, inner) => `<g transform="translate(${x} ${EYE_Y}) scale(-1 1)">${inner}</g>`;
const at = (x, inner) => `<g transform="translate(${x} ${EYE_Y})">${inner}</g>`;
const lash = `<path d="M 32 -16 Q 4 -46 -32 -28 L -42 -36" fill="none" stroke="#3b2418" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`;
const animeEye = (iris = 'url(#iris)', pupil = true) => `
  <ellipse cx="0" cy="2" rx="29" ry="35" fill="#fff" stroke="#3b2418" stroke-width="4"/>
  <ellipse cx="0" cy="6" rx="23" ry="30" fill="${iris}" stroke="#1b3a8a" stroke-width="3"/>
  ${pupil ? '<ellipse cx="0" cy="8" rx="10" ry="14" fill="#14224d"/>' : ''}
  <circle cx="8" cy="-8" r="9" fill="#fff"/><circle cx="-8" cy="18" r="4" fill="#fff"/>
  ${lash}`;
const brow = (x, tilt = 0) => `<path d="M ${x - 22} ${EYE_Y - 66 - tilt / 2} Q ${x} ${EYE_Y - 78 - tilt} ${x + 22} ${EYE_Y - 66 - tilt / 2}" fill="none" stroke="#c9974a" stroke-width="5" stroke-linecap="round"/>`;
const browsSad = () => `
  <path d="M 178 ${EYE_Y - 52} L 226 ${EYE_Y - 66}" stroke="#b8862f" stroke-width="6" stroke-linecap="round"/>
  <path d="M 334 ${EYE_Y - 52} L 286 ${EYE_Y - 66}" stroke="#b8862f" stroke-width="6" stroke-linecap="round"/>`;
const closedHappy = `<path d="M -30 8 Q 0 -30 30 8" fill="none" stroke="#3b2418" stroke-width="10" stroke-linecap="round"/>
  <path d="M -28 4 l -12 -6" stroke="#3b2418" stroke-width="7" stroke-linecap="round"/>`;
const closedWink = `<path d="M -30 0 Q 0 22 30 0" fill="none" stroke="#3b2418" stroke-width="10" stroke-linecap="round"/>
  <path d="M -26 2 l -14 -4" stroke="#3b2418" stroke-width="7" stroke-linecap="round"/>`;
const spiral = `<path d="M 0 0 m -4 0 a 4 4 0 1 1 8 0 a 9 9 0 1 1 -18 0 a 14 14 0 1 1 28 0 a 19 19 0 1 1 -38 0 a 24 24 0 1 1 48 0"
  fill="none" stroke="#3b2418" stroke-width="5" stroke-linecap="round"/>`;

const EYES = {
  normal: () => at(EL, animeEye()) + mirror(ER, animeEye()) + brow(EL) + brow(ER),
  wink: () => at(EL, animeEye()) + mirror(ER, closedWink) + brow(EL) + brow(ER, -4),
  happy: () => at(EL, closedHappy) + mirror(ER, closedHappy) + brow(EL, 4) + brow(ER, 4),
  laugh: () => `
    <path d="M ${EL - 28} ${EYE_Y - 22} L ${EL + 22} ${EYE_Y} L ${EL - 28} ${EYE_Y + 22}" fill="none" stroke="#3b2418" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M ${ER + 28} ${EYE_Y - 22} L ${ER - 22} ${EYE_Y} L ${ER + 28} ${EYE_Y + 22}" fill="none" stroke="#3b2418" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>`
    + brow(EL, 6) + brow(ER, 6),
  star: () => at(EL, animeEye('url(#iris)', false) + star(0, 6, 20, '#fff6a8', '#e0a000'))
    + mirror(ER, animeEye('url(#iris)', false) + star(0, 6, 20, '#fff6a8', '#e0a000')) + brow(EL, 6) + brow(ER, 6),
  heart: () => at(EL, animeEye('#ffd1e1', false) + heart(0, 10, 24)) + mirror(ER, animeEye('#ffd1e1', false) + heart(0, 10, 24))
    + brow(EL, 6) + brow(ER, 6),
  spiral: () => at(EL, spiral) + mirror(ER, spiral) + brow(EL, 8) + brow(ER, -8),
  teary: () => at(EL, animeEye() + '<path d="M -22 30 Q 0 40 22 30" fill="none" stroke="#7fd6ff" stroke-width="8" stroke-linecap="round"/>')
    + mirror(ER, animeEye() + '<path d="M -22 30 Q 0 40 22 30" fill="none" stroke="#7fd6ff" stroke-width="8" stroke-linecap="round"/>')
    + browsSad() + `
    <path d="M 176 262 q -14 36 0 52 q 14 -16 0 -52 Z" fill="#9fe2ff" stroke="#2a8fd6" stroke-width="4"/>
    <path d="M 336 262 q -14 36 0 52 q 14 -16 0 -52 Z" fill="#9fe2ff" stroke="#2a8fd6" stroke-width="4"/>`,
  shy: () => at(EL, animeEye()) + mirror(ER, animeEye()) + browsSad(),
};

// ---------- рты ----------
const M = { x: 256, y: 296 };
const MOUTHS = {
  smile: () => `<path d="M ${M.x - 22} ${M.y - 4} Q ${M.x} ${M.y + 16} ${M.x + 22} ${M.y - 4}" fill="none" stroke="${LINE}" stroke-width="7" stroke-linecap="round"/>`,
  open: () => `
    <path d="M ${M.x - 32} ${M.y - 10} Q ${M.x} ${M.y - 2} ${M.x + 32} ${M.y - 10} Q ${M.x + 26} ${M.y + 34} ${M.x} ${M.y + 36} Q ${M.x - 26} ${M.y + 34} ${M.x - 32} ${M.y - 10} Z"
      fill="#a3263f" stroke="${LINE}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M ${M.x - 16} ${M.y + 26} Q ${M.x} ${M.y + 12} ${M.x + 16} ${M.y + 26} Q ${M.x} ${M.y + 38} ${M.x - 16} ${M.y + 26} Z" fill="#ff7f9a"/>`,
  o: () => `<ellipse cx="${M.x}" cy="${M.y + 8}" rx="16" ry="20" fill="#a3263f" stroke="${LINE}" stroke-width="6"/>`,
  cat: () => `<path d="M ${M.x - 26} ${M.y} Q ${M.x - 13} ${M.y + 16} ${M.x} ${M.y} Q ${M.x + 13} ${M.y + 16} ${M.x + 26} ${M.y}" fill="none" stroke="${LINE}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`,
  kiss: () => `<path d="M ${M.x - 4} ${M.y - 12} Q ${M.x + 16} ${M.y - 6} ${M.x + 2} ${M.y + 4} Q ${M.x + 18} ${M.y + 12} ${M.x - 2} ${M.y + 18}" fill="none" stroke="#d33a6a" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`
    + heart(M.x + 48, M.y - 10, 16),
  wobble: () => `<path d="M ${M.x - 26} ${M.y + 8} q 6.5 -10 13 0 t 13 0 t 13 0 t 13 0" fill="none" stroke="${LINE}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`,
  small: () => `<path d="M ${M.x - 12} ${M.y + 2} Q ${M.x} ${M.y + 10} ${M.x + 12} ${M.y + 2}" fill="none" stroke="${LINE}" stroke-width="6" stroke-linecap="round"/>`,
};

// ---------- руки и предметы ----------
const finger = (x, y, len, rot) =>
  `<rect x="${x - 10}" y="${y - len}" width="20" height="${len + 10}" rx="10" fill="${SKIN}" stroke="${LINE}" stroke-width="6" transform="rotate(${rot} ${x} ${y})"/>`;
const palm = (x, y, r = 30) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${SKIN}" stroke="${LINE}" stroke-width="6"/>`;
const sleeve = (x, y, rot) =>
  `<rect x="${x - 34}" y="${y}" width="68" height="70" rx="22" fill="url(#sweater)" stroke="#3a6d93" stroke-width="7" transform="rotate(${rot} ${x} ${y})"/>`;

const PROPS = {
  wave: () => sleeve(408, 360, 20) + finger(392, 312, 48, -22) + finger(410, 306, 54, -6) + finger(428, 310, 50, 10) + finger(442, 322, 42, 26)
    + palm(414, 336) + `<path d="M 448 260 q 22 22 0 50 M 470 244 q 34 36 0 82" fill="none" stroke="${LINE}" stroke-width="7" stroke-linecap="round"/>`,
  peace: () => sleeve(392, 368, 15) + finger(380, 300, 62, -14) + finger(404, 302, 62, 14) + palm(392, 334)
    + `<path d="M 372 336 q 20 10 40 0" fill="none" stroke="${LINE}" stroke-width="5" stroke-linecap="round"/>`,
  heartHold: () => heart(256, 392, 58, '#ff4f8b') + `<path d="M 228 366 q 12 -14 28 -6" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".7"/>`
    + palm(204, 400, 22) + palm(308, 400, 22),
  question: () => `
    <path d="M 380 70 h 96 a 22 22 0 0 1 22 22 v 44 a 22 22 0 0 1 -22 22 h -54 l -22 20 v -20 h -20 a 22 22 0 0 1 -22 -22 v -44 a 22 22 0 0 1 22 -22 Z"
      fill="#fff" stroke="#ff4f8b" stroke-width="7" stroke-linejoin="round"/>
    <text x="428" y="132" text-anchor="middle" font-family="Inter" font-weight="900" font-size="58" fill="#ff4f8b">?</text>`,
  chat: () => `
    <g transform="rotate(-10 70 110)"><rect x="18" y="80" width="104" height="60" rx="22" fill="#fff" stroke="#ff4f8b" stroke-width="6"/>
      <circle cx="48" cy="110" r="7" fill="#ff4f8b"/><circle cx="70" cy="110" r="7" fill="#ff4f8b"/><circle cx="92" cy="110" r="7" fill="#ff4f8b"/></g>
    <g transform="rotate(12 440 90)"><rect x="392" y="60" width="96" height="60" rx="22" fill="#fff" stroke="#3a9de0" stroke-width="6"/>
      <text x="440" y="108" text-anchor="middle" font-family="Inter" font-weight="900" font-size="44" fill="#3a9de0">!!</text></g>`,
  palette: () => `
    <path d="M 360 350 C 330 310, 380 268, 440 282 C 500 296, 500 360, 462 380 C 440 392, 446 366, 424 372 C 404 378, 392 400, 360 350 Z"
      fill="#f6e0b8" stroke="#8a5a2a" stroke-width="6" stroke-linejoin="round"/>
    <circle cx="398" cy="314" r="11" fill="#ff4f8b"/><circle cx="432" cy="302" r="11" fill="#3a9de0"/>
    <circle cx="462" cy="322" r="11" fill="#f3c14b"/><circle cx="464" cy="352" r="10" fill="#57c27a"/>
    <g transform="rotate(-35 110 330)"><rect x="104" y="250" width="14" height="110" rx="6" fill="#c98a4a" stroke="#6b3f2a" stroke-width="5"/>
      <rect x="102" y="236" width="18" height="22" fill="#c0c8d0" stroke="#6b3f2a" stroke-width="5"/>
      <path d="M 102 236 Q 111 200 120 236 Z" fill="#ff4f8b" stroke="#6b3f2a" stroke-width="5" stroke-linejoin="round"/></g>`,
  piano: () => note(80, 140, 1.1) + note(436, 120, 0.9, '#3a9de0') + note(452, 300, 0.8, '#f3c14b') + note(66, 320, 0.8, '#ff7fb0'),
  hearts: () => heart(78, 130, 30) + heart(440, 110, 24, '#ff7fb0') + heart(452, 300, 18),
  sparkles: () => sparkle(70, 130, 30) + sparkle(448, 120, 24) + sparkle(456, 300, 16) + sparkle(60, 300, 14),
  tears: () => `<path d="M 120 250 q -22 40 -4 60 q 18 -14 4 -60 Z" fill="#9fe2ff" stroke="#2a8fd6" stroke-width="4"/>
    <path d="M 392 250 q -18 46 4 60 q 22 -14 -4 -60 Z" fill="#9fe2ff" stroke="#2a8fd6" stroke-width="4"/>`,
  none: () => '',
};

// ---------- подпись ----------
const label = (text, superfan) => {
  const fsz = Math.min(96, Math.round(480 / (text.length * 0.68)));
  const fill = superfan ? 'url(#label-super)' : 'url(#label-fan)';
  const edge = superfan ? '#6a1b9a' : '#a3134a';
  const common = `x="256" y="488" text-anchor="middle" font-family="Inter" font-weight="900" font-size="${fsz}" letter-spacing="-1"
    transform="rotate(-4 256 470)" stroke-linejoin="round" paint-order="stroke"`;
  return `<text ${common} fill="${fill}" stroke="#fff" stroke-width="22">${text}</text>
          <text ${common} fill="${fill}" stroke="${edge}" stroke-width="7">${text}</text>`;
};

const defs = `
  <defs>
    <linearGradient id="hair" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff4c4"/><stop offset=".55" stop-color="#f5d684"/><stop offset="1" stop-color="#e2b25a"/>
    </linearGradient>
    <linearGradient id="sweater" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#bfe9fb"/><stop offset="1" stop-color="#7cc4ea"/>
    </linearGradient>
    <radialGradient id="iris" cx="50%" cy="35%" r="70%">
      <stop offset="0" stop-color="#bfeaff"/><stop offset=".5" stop-color="#4aa3e8"/><stop offset="1" stop-color="#1f4fa8"/>
    </radialGradient>
    <linearGradient id="silver" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#d6e4f2"/><stop offset="1" stop-color="#9fb6cf"/>
    </linearGradient>
    <linearGradient id="label-fan" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff9ac2"/><stop offset="1" stop-color="#ff2f7a"/>
    </linearGradient>
    <linearGradient id="label-super" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffe680"/><stop offset="1" stop-color="#ff9a1f"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#ffd6ea"/><stop offset="1" stop-color="#ff8fc0"/>
    </radialGradient>
    <filter id="sticker" x="-10%" y="-10%" width="120%" height="120%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="11" result="d"/>
      <feFlood flood-color="#ffffff"/><feComposite in2="d" operator="in" result="white"/>
      <feOffset in="d" dy="6" result="off"/><feGaussianBlur in="off" stdDeviation="4" result="blur"/>
      <feFlood flood-color="#000" flood-opacity=".22"/><feComposite in2="blur" operator="in" result="shadow"/>
      <feMerge><feMergeNode in="shadow"/><feMergeNode in="white"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>`;

function mira(e, superfan) {
  const props = [].concat(e.props || []);
  const front = props.filter((p) => ['wave', 'peace', 'heartHold'].includes(p));
  const back = props.filter((p) => !front.includes(p));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 512 512">
    ${defs}
    <g filter="url(#sticker)" transform="translate(256 256) scale(.88) translate(-256 -262)">
      ${superfan ? `<circle cx="256" cy="250" r="230" fill="url(#glow)" stroke="#ff4f8b" stroke-width="8"/>
        ${heart(60, 80, 22, '#fff', '#ff4f8b')}${heart(456, 420, 18, '#fff', '#ff4f8b')}` : ''}
      ${back.map((p) => PROPS[p]()).join('')}
      ${hairBack()}
      ${body(superfan)}
      ${braid(150, -1)}${braid(362, 1)}
      ${face()}
      ${cheeks(e.blush)}
      ${EYES[e.eyes]()}
      ${MOUTHS[e.mouth]()}
      ${bangs()}
      ${superfan ? tiara() : ''}
      ${front.map((p) => PROPS[p]()).join('')}
      ${label(e.label, superfan)}
    </g>
  </svg>`;
}

const FANS = [
  { id: '01-privet', label: 'ПРИВЕТ!', eyes: 'happy', mouth: 'open', props: 'wave' },
  { id: '02-kak-dela', label: 'КАК ДЕЛА?', eyes: 'normal', mouth: 'cat', props: 'question' },
  { id: '03-mir', label: 'МИР!', eyes: 'wink', mouth: 'smile', props: 'peace' },
  { id: '04-chat-reshaet', label: 'ЧАТ РЕШАЕТ', eyes: 'spiral', mouth: 'wobble', props: 'chat' },
  { id: '05-lyublyu', label: 'ЛЮБЛЮ', eyes: 'heart', mouth: 'open', props: 'hearts' },
  { id: '06-haha', label: 'ХАХА', eyes: 'laugh', mouth: 'open', props: 'tears' },
  { id: '07-vau', label: 'ВАУ!', eyes: 'star', mouth: 'o', props: 'sparkles' },
  { id: '08-narisuyu', label: 'НАРИСУЮ!', eyes: 'happy', mouth: 'smile', props: 'palette' },
  { id: '09-igrayu', label: 'ИГРАЮ ♪', eyes: 'happy', mouth: 'cat', props: 'piano' },
  { id: '10-spasibo', label: 'СПАСИБО', eyes: 'happy', mouth: 'smile', props: 'heartHold', blush: true },
];
const SUPERFANS = [
  { id: '01-vip', label: 'VIP', eyes: 'wink', mouth: 'smile', props: 'peace' },
  { id: '02-chmok', label: 'ЧМОК', eyes: 'wink', mouth: 'kiss', props: 'hearts', blush: true },
  { id: '03-obnimashki', label: 'ОБНИМАШКИ', eyes: 'happy', mouth: 'open', props: 'heartHold', blush: true },
  { id: '04-ty-luchshiy', label: 'ТЫ ЛУЧШИЙ', eyes: 'star', mouth: 'open', props: 'sparkles' },
  { id: '05-moy-fanat', label: 'МОЙ ФАНАТ', eyes: 'heart', mouth: 'cat', props: 'hearts' },
  { id: '06-ne-uhodi', label: 'НЕ УХОДИ', eyes: 'teary', mouth: 'wobble', props: 'none' },
  { id: '07-oy', label: 'ОЙ…', eyes: 'shy', mouth: 'small', props: 'none', blush: true },
  { id: '08-lyublyu-vas', label: 'ЛЮБЛЮ ВАС', eyes: 'happy', mouth: 'open', props: 'hearts', blush: true },
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: SIZE, height: SIZE } });
  for (const [dir, list, sup] of [['fans', FANS, false], ['superfans', SUPERFANS, true]]) {
    fs.mkdirSync(path.join(OUT, dir), { recursive: true });
    for (const e of list) {
      await page.setContent(`<html><body style="margin:0;background:transparent">${mira(e, sup)}</body></html>`);
      await page.evaluate(() => document.fonts.ready);
      await page.locator('svg').screenshot({ path: path.join(OUT, dir, `${e.id}.png`), omitBackground: true });
    }
  }
  await browser.close();
  console.log('ok');
})();
