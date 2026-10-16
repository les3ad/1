// Набор 2 для @ai_mira.ai: 5 дополнительных эмоций для фанатов и 15 премиум-эмоций для суперфанатов.
// Премиум: Мира в кошачьем наряде со стримов (ушки, белый свитер с сиреневыми лапками, хвост),
// золотая рамка с лучами и фиолетовая лента с золотой подписью.
// Запуск: NODE_PATH=$(npm root -g) node emotes/mira2.js
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const m = require('./mira');

const { heart, star, sparkle, note, finger, palm, sleeve, at, mirror, SKIN, LINE, EYE_Y, EL, ER, M } = m;
const OUT = path.join(__dirname, 'mira');
const SIZE = 512;
const CAT_LINE = '#8a7bb8';

const extraDefs = `
  <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff59a"/><stop offset=".5" stop-color="#ffcc1f"/><stop offset="1" stop-color="#f08a00"/>
  </linearGradient>
  <linearGradient id="goldText" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fffbd0"/><stop offset=".5" stop-color="#ffd84a"/><stop offset="1" stop-color="#ff9a1f"/>
  </linearGradient>
  <linearGradient id="ribbon" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#b46cff"/><stop offset="1" stop-color="#6a22c9"/>
  </linearGradient>
  <radialGradient id="burstbg" cx="50%" cy="45%" r="55%">
    <stop offset="0" stop-color="#fff0f8"/><stop offset=".6" stop-color="#ffb8de"/><stop offset="1" stop-color="#c79bff"/>
  </radialGradient>
  <radialGradient id="burstglow" cx="50%" cy="50%" r="50%">
    <stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="crystal" cx="38%" cy="32%" r="70%">
    <stop offset="0" stop-color="#f6ecff"/><stop offset=".5" stop-color="#b98aff"/><stop offset="1" stop-color="#5a2a9a"/>
  </radialGradient>
  <radialGradient id="disco" cx="38%" cy="32%" r="70%">
    <stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#c9d6e6"/><stop offset="1" stop-color="#7d93b3"/>
  </radialGradient>
  <linearGradient id="fire" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ffe14a"/><stop offset=".6" stop-color="#ff7a1f"/><stop offset="1" stop-color="#ff3a3a"/>
  </linearGradient>
  <clipPath id="eyeclip"><ellipse cx="0" cy="2" rx="29" ry="35"/></clipPath>`;
const withExtraDefs = (svg) => svg.replace('</defs>', `${extraDefs}</defs>`);

// ---------- новые глаза и рты ----------
const eyeShift = (dx, dy, lid = false) => `
  <ellipse cx="0" cy="2" rx="29" ry="35" fill="#fff" stroke="#3b2418" stroke-width="4"/>
  <g clip-path="url(#eyeclip)"><g transform="translate(${dx} ${dy})">
    <ellipse cx="0" cy="6" rx="23" ry="30" fill="url(#iris)" stroke="#1b3a8a" stroke-width="3"/>
    <ellipse cx="0" cy="8" rx="10" ry="14" fill="#14224d"/>
    <circle cx="8" cy="-8" r="9" fill="#fff"/><circle cx="-8" cy="18" r="4" fill="#fff"/>
  </g></g>
  ${lid
    ? `<path d="M -37 -44 H 37 V -4 Q 0 4 -37 -4 Z" fill="${SKIN}"/>
       <path d="M 33 -6 Q 0 4 -33 -4 L -42 -12" fill="none" stroke="#3b2418" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`
    : m.lash}`;

Object.assign(m.EYES, {
  up: () => at(EL, eyeShift(0, -9)) + mirror(ER, eyeShift(0, -9)) + m.brow(EL, 4) + m.brow(ER, 4),
  sly: () => at(EL, eyeShift(0, 5, true)) + mirror(ER, eyeShift(0, 5, true)),
  side: () => at(EL, eyeShift(-9, 5, true)) + mirror(ER, eyeShift(9, 5, true)),
  angry: () => at(EL, eyeShift(0, 2)) + mirror(ER, eyeShift(0, 2)),
});

Object.assign(m.MOUTHS, {
  fang: () => m.MOUTHS.cat()
    + `<path d="M ${M.x - 10} ${M.y + 6} L ${M.x - 5} ${M.y + 19} L ${M.x} ${M.y + 7}" fill="#fff" stroke="${LINE}" stroke-width="3" stroke-linejoin="round"/>`,
  pout: () => `<path d="M ${M.x - 14} ${M.y + 12} Q ${M.x} ${M.y} ${M.x + 14} ${M.y + 12}" fill="none" stroke="${LINE}" stroke-width="7" stroke-linecap="round"/>
    <path d="M 334 262 q 18 14 2 32" fill="none" stroke="#e0809a" stroke-width="5" stroke-linecap="round"/>`,
});

// ---------- детали ----------
const paw = (x, y, s = 1, c = '#b9a6ea') => `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}">
  <ellipse cx="0" cy="6" rx="11" ry="9"/><circle cx="-11" cy="-7" r="4.5"/><circle cx="-4" cy="-12" r="4.5"/>
  <circle cx="4" cy="-12" r="4.5"/><circle cx="11" cy="-7" r="4.5"/></g>`;

const coin = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#gold)" stroke="#8a5200" stroke-width="${r * 0.14}"/>
  <circle cx="${x}" cy="${y}" r="${r * 0.7}" fill="none" stroke="#fff3a0" stroke-width="${r * 0.1}"/>` + star(x, y, r * 0.42, '#fff3a0', '#c08a00');

const flame = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M 0 50 C -38 44, -40 0, -14 -30 C -12 -8, 0 -6, 4 -54 C 40 -24, 44 36, 0 50 Z" fill="url(#fire)" stroke="#b33a00" stroke-width="5" stroke-linejoin="round"/>
  <path d="M 0 42 C -16 38, -18 16, -4 0 C 0 12, 8 10, 8 -8 C 22 10, 20 36, 0 42 Z" fill="#fff3a0"/></g>`;

const openHand = (x, y, rot) => `<g transform="rotate(${rot} ${x} ${y})">${sleeve(x, y + 14, 0)}
  ${finger(x - 22, y - 12, 36, -18)}${finger(x - 8, y - 18, 44, -6)}${finger(x + 8, y - 18, 44, 6)}${finger(x + 22, y - 12, 36, 18)}
  ${palm(x, y, 28)}</g>`;

const pawHand = (x, y, rot) => `<g transform="rotate(${rot} ${x} ${y})">
  <rect x="${x - 30}" y="${y + 12}" width="60" height="74" rx="22" fill="url(#sweater)" stroke="${CAT_LINE}" stroke-width="7"/>
  <rect x="${x - 30}" y="${y + 12}" width="60" height="18" rx="9" fill="#cbbcf2" stroke="${CAT_LINE}" stroke-width="5"/>
  <circle cx="${x - 16}" cy="${y - 20}" r="11" fill="${SKIN}" stroke="${LINE}" stroke-width="5"/>
  <circle cx="${x}" cy="${y - 25}" r="11" fill="${SKIN}" stroke="${LINE}" stroke-width="5"/>
  <circle cx="${x + 16}" cy="${y - 20}" r="11" fill="${SKIN}" stroke="${LINE}" stroke-width="5"/>
  ${palm(x, y, 27)}
  <ellipse cx="${x}" cy="${y + 4}" rx="10" ry="8" fill="#ffb3d1"/>
  <circle cx="${x - 12}" cy="${y - 10}" r="4" fill="#ffb3d1"/><circle cx="${x}" cy="${y - 14}" r="4" fill="#ffb3d1"/><circle cx="${x + 12}" cy="${y - 10}" r="4" fill="#ffb3d1"/>
</g>`;

const confetti = () =>
  [[60, 130, '#ff4f8b', 20], [118, 64, '#ffd84a', -30], [432, 74, '#7fd6ff', 40], [474, 170, '#c9a7ff', -10],
   [46, 240, '#3ccf7a', 60], [396, 40, '#ff7fb0', -45], [84, 330, '#7fd6ff', -20], [160, 36, '#3ccf7a', 25]]
    .map(([x, y, c, r]) => `<rect x="${x - 10}" y="${y - 5}" width="20" height="11" rx="3" fill="${c}" stroke="#fff" stroke-width="2" transform="rotate(${r} ${x} ${y})"/>`).join('')
  + [[96, 190, '#ffd84a'], [440, 130, '#ff4f8b'], [30, 180, '#c9a7ff'], [470, 230, '#3ccf7a']]
    .map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="7" fill="${c}" stroke="#fff" stroke-width="2"/>`).join('');

const txt = (x, y, size, fill, t, extra = '') =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-family="Inter" font-weight="900" font-size="${size}" fill="${fill}" ${extra}>${t}</text>`;

// ---------- реквизит ----------
Object.assign(m.PROPS, {
  // для фанатов
  invite: () => `<g transform="rotate(-10 76 120)"><rect x="20" y="88" width="112" height="64" rx="24" fill="#fff" stroke="#ff4f8b" stroke-width="6"/>
    <circle cx="52" cy="120" r="8" fill="#ff4f8b"/><circle cx="76" cy="120" r="8" fill="#ff4f8b"/><circle cx="100" cy="120" r="8" fill="#ff4f8b"/></g>`
    + heart(70, 210, 18, '#ff7fb0'),
  think: () => sleeve(322, 356, 28) + palm(306, 340, 24)
    + `<circle cx="384" cy="190" r="9" fill="#fff" stroke="#c9a7ff" stroke-width="5"/>
    <circle cx="408" cy="158" r="14" fill="#fff" stroke="#c9a7ff" stroke-width="5"/>
    <ellipse cx="448" cy="98" rx="52" ry="42" fill="#fff" stroke="#c9a7ff" stroke-width="6"/>`
    + txt(448, 120, 60, '#8a5ad6', '?'),
  handsUp: () => openHand(92, 292, -22) + openHand(420, 292, 22),
  vote: () => sleeve(392, 382, 14) + `<g transform="rotate(8 420 290)">
    <rect x="364" y="226" width="112" height="118" rx="12" fill="#fff" stroke="#ff4f8b" stroke-width="7"/>
    <rect x="380" y="244" width="30" height="30" rx="6" fill="#ffe0ee" stroke="#ff4f8b" stroke-width="5"/>
    <path d="M 384 258 l 9 10 l 20 -24" fill="none" stroke="#3ccf7a" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M 420 259 H 460" stroke="#c9a7ff" stroke-width="6" stroke-linecap="round"/>
    <rect x="380" y="290" width="30" height="30" rx="6" fill="#fff" stroke="#c9a7ff" stroke-width="5"/>
    <path d="M 420 305 H 456" stroke="#c9a7ff" stroke-width="6" stroke-linecap="round"/></g>` + palm(374, 340, 22),
  confetti,
  anger: () => `<g stroke="#ff2d55" stroke-width="8" fill="none" stroke-linecap="round">
      <path d="M 404 136 q 12 6 10 18"/><path d="M 436 136 q -12 6 -10 18"/><path d="M 404 168 q 12 -6 10 -18"/><path d="M 436 168 q -12 -6 -10 -18"/></g>
    <path d="M 176 ${EYE_Y - 58} L 228 ${EYE_Y - 42}" stroke="#6b3f1a" stroke-width="9" stroke-linecap="round"/>
    <path d="M 336 ${EYE_Y - 58} L 284 ${EYE_Y - 42}" stroke="#6b3f1a" stroke-width="9" stroke-linecap="round"/>`,

  // для суперфанатов
  catPaws: () => pawHand(132, 298, -12) + pawHand(380, 298, 12),
  tail: () => `<path d="M 360 440 C 470 450, 486 386, 452 344 C 432 318, 452 286, 480 298" fill="none" stroke="${CAT_LINE}" stroke-width="40" stroke-linecap="round"/>
    <path d="M 360 440 C 470 450, 486 386, 452 344 C 432 318, 452 286, 480 298" fill="none" stroke="#fff" stroke-width="28" stroke-linecap="round"/>`,
  disco: () => `<path d="M 92 0 V 62" stroke="${CAT_LINE}" stroke-width="5"/>
    <path d="M 92 104 L 20 210 M 92 104 L 150 200 M 92 104 L 40 40" stroke="#fff" stroke-width="10" opacity=".55" stroke-linecap="round"/>
    <circle cx="92" cy="104" r="42" fill="url(#disco)" stroke="#5b6f8a" stroke-width="6"/>
    <g fill="none" stroke="#8fa3bf" stroke-width="3"><ellipse cx="92" cy="104" rx="42" ry="14"/><ellipse cx="92" cy="104" rx="42" ry="29"/>
      <ellipse cx="92" cy="104" rx="14" ry="42"/><ellipse cx="92" cy="104" rx="29" ry="42"/></g>
    <rect x="70" y="84" width="10" height="10" fill="#ff7fb0"/><rect x="100" y="112" width="10" height="10" fill="#7fd6ff"/><rect x="84" y="122" width="9" height="9" fill="#fff3a0"/>`
    + sparkle(150, 60, 16) + note(440, 132, 1, '#ff4f8b') + note(472, 236, 0.8, '#3a9de0'),
  tarot: () => `<g transform="rotate(-14 76 200)">
    <rect x="30" y="140" width="92" height="132" rx="10" fill="url(#ribbon)" stroke="#2e0a66" stroke-width="6"/>
    <rect x="40" y="150" width="72" height="112" rx="6" fill="none" stroke="#ffd84a" stroke-width="3"/>
    <path d="M 70 176 A 24 24 0 1 0 98 210 A 19 19 0 1 1 70 176 Z" fill="#ffd84a"/>
    ${star(76, 238, 11, '#fff3a0', '#ffd84a')}</g>` + sparkle(130, 110, 14),
  crystal: () => `<ellipse cx="416" cy="390" rx="46" ry="14" fill="url(#gold)" stroke="#8a5200" stroke-width="5"/>
    <path d="M 384 390 L 392 366 H 440 L 448 390 Z" fill="url(#gold)" stroke="#8a5200" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="416" cy="316" r="54" fill="url(#crystal)" stroke="#5a2a9a" stroke-width="6"/>
    <path d="M 388 294 q 10 -18 30 -20" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" opacity=".85"/>`
    + sparkle(432, 330, 13) + sparkle(404, 342, 7) + palm(366, 356, 20) + palm(466, 356, 20),
  notesL: () => note(80, 150, 1.1) + note(56, 300, 0.8, '#3a9de0') + note(440, 120, 0.9, '#f3c14b') + sparkle(470, 220, 14),
  mic: () => sleeve(370, 386, 14) + `<g transform="translate(-28 0) rotate(-35 370 340)">
    <rect x="360" y="320" width="22" height="92" rx="10" fill="#ff7fb0" stroke="#a3134a" stroke-width="6"/>
    <circle cx="371" cy="306" r="28" fill="url(#silver)" stroke="#5b7fa8" stroke-width="6"/>
    <path d="M 349 300 H 393 M 351 314 H 391 M 371 280 V 332 M 358 284 V 328 M 384 284 V 328" stroke="#9fb6cf" stroke-width="3"/></g>`
    + palm(360, 374, 24),
  quill: () => `<g transform="rotate(-28 90 240)">
    <path d="M 90 140 C 136 186, 126 262, 92 306 C 66 262, 58 196, 90 140 Z" fill="#fff" stroke="${CAT_LINE}" stroke-width="6"/>
    <path d="M 90 158 V 340" stroke="${CAT_LINE}" stroke-width="5" stroke-linecap="round"/>
    <path d="M 90 190 l 18 -14 M 90 220 l 22 -16 M 90 250 l 20 -14 M 90 205 l -16 -14 M 90 235 l -18 -14" stroke="#d8cdf5" stroke-width="4" stroke-linecap="round"/></g>`,
  scroll: () => `<g transform="rotate(8 420 290)">
    <rect x="366" y="214" width="108" height="150" fill="#fff6dc" stroke="#b07a3a" stroke-width="6"/>
    <rect x="356" y="200" width="128" height="24" rx="12" fill="#f0d9a8" stroke="#b07a3a" stroke-width="6"/>
    <rect x="356" y="354" width="128" height="24" rx="12" fill="#f0d9a8" stroke="#b07a3a" stroke-width="6"/>
    <path d="M 382 246 H 458 M 382 268 H 450 M 382 290 H 458 M 382 312 H 436" stroke="#c9a7ff" stroke-width="6" stroke-linecap="round"/>
    ${heart(452, 330, 11)}</g>` + palm(368, 342, 22),
  qmarks: () => txt(74, 176, 96, '#c9a7ff', '?', 'stroke="#fff" stroke-width="10" paint-order="stroke" transform="rotate(-15 74 150)"')
    + txt(120, 268, 54, '#ff7fb0', '?', 'stroke="#fff" stroke-width="8" paint-order="stroke" transform="rotate(12 120 250)"'),
  guess: () => `<g transform="rotate(6 420 270)">
    <rect x="350" y="214" width="140" height="112" rx="14" fill="#fff" stroke="#ff4f8b" stroke-width="7"/>
    ${[362, 402, 442].map((x, i) => `<rect x="${x}" y="232" width="34" height="38" rx="7" fill="${i === 2 ? '#ffe0ee' : '#fff'}" stroke="${i === 2 ? '#ff4f8b' : '#c9a7ff'}" stroke-width="4"/>`
      + txt(x + 17, 261, 26, i === 2 ? '#ff4f8b' : '#8a5ad6', i === 2 ? 'Ц' : '?')).join('')}
    <rect x="362" y="290" width="114" height="14" rx="7" fill="#ffd1e6"/><rect x="362" y="290" width="62" height="14" rx="7" fill="#ff4f8b"/></g>`,
  check: () => `<circle cx="424" cy="300" r="50" fill="#3ccf7a" stroke="#137a43" stroke-width="7"/>
    <path d="M 398 302 L 417 322 L 451 282" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>`
    + sparkle(470, 236, 14),
  trophy: () => `<g transform="translate(424 300)">
    <path d="M -40 -40 C -70 -40, -70 4, -30 10 M 40 -40 C 70 -40, 70 4, 30 10" fill="none" stroke="#8a5200" stroke-width="12" stroke-linecap="round"/>
    <path d="M -40 -40 C -70 -40, -70 4, -30 10 M 40 -40 C 70 -40, 70 4, 30 10" fill="none" stroke="#ffd84a" stroke-width="5" stroke-linecap="round"/>
    <path d="M -42 -52 H 42 V -20 C 42 12, 22 26, 0 28 C -22 26, -42 12, -42 -20 Z" fill="url(#gold)" stroke="#8a5200" stroke-width="6" stroke-linejoin="round"/>
    <rect x="-9" y="26" width="18" height="22" fill="url(#gold)" stroke="#8a5200" stroke-width="5"/>
    <rect x="-32" y="46" width="64" height="18" rx="5" fill="#8a5ad6" stroke="#2e0a66" stroke-width="5"/>
    ${txt(0, 2, 46, '#fff', '1', 'stroke="#8a5200" stroke-width="5" paint-order="stroke"')}</g>` + palm(372, 330, 20),
  plusOne: () => `<circle cx="84" cy="136" r="44" fill="#ff4f8b" stroke="#fff" stroke-width="7"/>` + txt(84, 153, 46, '#fff', '+1'),
  rose: () => sleeve(414, 376, 8) + `
    <path d="M 420 368 C 410 330, 430 298, 422 252" stroke="#2f9a4a" stroke-width="9" fill="none" stroke-linecap="round"/>
    <path d="M 418 322 q -38 -8 -44 -34 q 32 2 44 34 Z" fill="#3ccf7a" stroke="#1f7a3a" stroke-width="4" stroke-linejoin="round"/>
    <path d="M 424 300 q 38 -6 46 -32 q -32 0 -46 32 Z" fill="#3ccf7a" stroke="#1f7a3a" stroke-width="4" stroke-linejoin="round"/>
    <ellipse cx="398" cy="236" rx="18" ry="26" fill="#ff2d55" stroke="#7a0018" stroke-width="5" transform="rotate(-30 398 236)"/>
    <ellipse cx="446" cy="236" rx="18" ry="26" fill="#ff2d55" stroke="#7a0018" stroke-width="5" transform="rotate(30 446 236)"/>
    <circle cx="422" cy="226" r="34" fill="#e8173f" stroke="#7a0018" stroke-width="6"/>
    <path d="M 422 226 m -6 0 a 6 6 0 1 1 12 0 a 13 13 0 1 1 -26 0 a 20 20 0 1 1 40 0" fill="none" stroke="#9a0a28" stroke-width="5" stroke-linecap="round"/>`
    + palm(418, 352, 22),
  wheel: () => {
    const cx = 420, cy = 300, r = 62;
    const cols = ['#ff4f8b', '#ffd84a', '#7fd6ff', '#c9a7ff', '#3ccf7a', '#ff9a3d', '#ff7fb0', '#8c7bff'];
    let seg = '';
    for (let i = 0; i < 8; i++) {
      const a1 = ((i * 45 - 90) * Math.PI) / 180, a2 = (((i + 1) * 45 - 90) * Math.PI) / 180;
      seg += `<path d="M ${cx} ${cy} L ${(cx + r * Math.cos(a1)).toFixed(1)} ${(cy + r * Math.sin(a1)).toFixed(1)}
        A ${r} ${r} 0 0 1 ${(cx + r * Math.cos(a2)).toFixed(1)} ${(cy + r * Math.sin(a2)).toFixed(1)} Z" fill="${cols[i]}" stroke="#fff" stroke-width="3"/>`;
    }
    return sleeve(378, 386, 14) + seg + `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#8a5200" stroke-width="8"/>
      <circle cx="${cx}" cy="${cy}" r="12" fill="url(#gold)" stroke="#8a5200" stroke-width="4"/>
      <path d="M 406 226 H 434 L 420 252 Z" fill="#fff" stroke="#2e0a66" stroke-width="5" stroke-linejoin="round"/>
      <path d="M 346 262 A 84 84 0 0 1 384 226" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
      <path d="M 494 340 A 84 84 0 0 1 462 374" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`
      + palm(368, 346, 22);
  },
  coins: () => coin(80, 132, 30) + coin(126, 62, 20) + coin(440, 92, 26) + coin(474, 196, 18) + coin(56, 262, 20)
    + coin(432, 330, 36) + coin(470, 410, 22) + coin(138, 196, 14) + sparkle(380, 60, 14),
  flames: () => flame(64, 330, 1.2) + flame(448, 330, 1.2) + flame(92, 176, 0.8) + flame(430, 160, 0.8),
  kitty: () => sleeve(392, 384, 10) + `<g transform="translate(424 312) rotate(8)">
    <path d="M -40 -18 L -38 -64 L -6 -38 Z" fill="#fff" stroke="${CAT_LINE}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M 40 -18 L 38 -64 L 6 -38 Z" fill="#fff" stroke="${CAT_LINE}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M -32 -28 L -32 -52 L -16 -38 Z" fill="#ffb3d1"/><path d="M 32 -28 L 32 -52 L 16 -38 Z" fill="#ffb3d1"/>
    <ellipse cx="0" cy="0" rx="48" ry="42" fill="#fff" stroke="${CAT_LINE}" stroke-width="6"/>
    <ellipse cx="-17" cy="-4" rx="6" ry="8" fill="#3b2418"/><ellipse cx="17" cy="-4" rx="6" ry="8" fill="#3b2418"/>
    <circle cx="-15" cy="-7" r="2.5" fill="#fff"/><circle cx="19" cy="-7" r="2.5" fill="#fff"/>
    <path d="M -4 8 h 8 l -4 5 Z" fill="#ff7fb0"/>
    <path d="M -10 16 q 5 6 10 0 q 5 6 10 0" fill="none" stroke="#3b2418" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="-30" cy="12" rx="8" ry="5" fill="#ff9fc0" opacity=".7"/><ellipse cx="30" cy="12" rx="8" ry="5" fill="#ff9fc0" opacity=".7"/>
    <path d="M -48 6 h -16 M -48 14 h -14 M 48 6 h 16 M 48 14 h 14" stroke="${CAT_LINE}" stroke-width="3" stroke-linecap="round"/></g>`
    + palm(380, 348, 20) + palm(466, 354, 20) + heart(472, 232, 14) + heart(372, 242, 10, '#ff7fb0'),
});
['think', 'handsUp', 'vote', 'anger', 'catPaws', 'crystal', 'mic', 'scroll', 'guess', 'check', 'trophy', 'rose', 'wheel', 'kitty']
  .forEach((p) => m.FRONT.add(p));

// ---------- премиум-оформление ----------
const catBody = () => `
  <path d="M 120 480 C 112 420, 170 372, 256 368 C 342 372, 400 420, 392 480 Q 256 452 120 480 Z"
    fill="url(#sweater)" stroke="${CAT_LINE}" stroke-width="8" stroke-linejoin="round"/>
  ${paw(176, 420, 0.9)}${paw(338, 414, 0.9)}${paw(146, 466, 0.7)}${paw(366, 466, 0.7)}
  <path d="M 234 318 V 384 Q 256 394 278 384 V 318 Z" fill="${SKIN}" stroke="${LINE}" stroke-width="6"/>
  <path d="M 196 374 Q 256 412 316 374" fill="none" stroke="${CAT_LINE}" stroke-width="24" stroke-linecap="round"/>
  <path d="M 196 374 Q 256 412 316 374" fill="none" stroke="#cbbcf2" stroke-width="15" stroke-linecap="round"/>
  <path d="M 196 374 Q 256 412 316 374" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="3 9" stroke-linecap="round"/>`;

const catEars = () => `
  <path d="M 146 140 L 150 34 L 232 98 Z" fill="#fff" stroke="${CAT_LINE}" stroke-width="8" stroke-linejoin="round"/>
  <path d="M 162 118 L 164 64 L 208 98 Z" fill="#ffb3d1"/>
  <path d="M 366 140 L 362 34 L 280 98 Z" fill="#fff" stroke="${CAT_LINE}" stroke-width="8" stroke-linejoin="round"/>
  <path d="M 350 118 L 348 64 L 304 98 Z" fill="#ffb3d1"/>`;

const burst = () => {
  let rays = '';
  for (let i = 0; i < 32; i += 2) {
    const a1 = (i * 11.25 * Math.PI) / 180, a2 = ((i + 1) * 11.25 * Math.PI) / 180;
    rays += `<path d="M 256 250 L ${(256 + 260 * Math.cos(a1)).toFixed(1)} ${(250 + 260 * Math.sin(a1)).toFixed(1)}
      L ${(256 + 260 * Math.cos(a2)).toFixed(1)} ${(250 + 260 * Math.sin(a2)).toFixed(1)} Z" fill="#fff"/>`;
  }
  return `<clipPath id="bclip"><circle cx="256" cy="250" r="230"/></clipPath>
    <circle cx="256" cy="250" r="230" fill="url(#burstbg)"/>
    <g clip-path="url(#bclip)" opacity=".35">${rays}</g>
    <circle cx="256" cy="250" r="170" fill="url(#burstglow)"/>
    <circle cx="256" cy="250" r="230" fill="none" stroke="#8a5200" stroke-width="22"/>
    <circle cx="256" cy="250" r="230" fill="none" stroke="url(#gold)" stroke-width="14"/>
    <circle cx="256" cy="250" r="214" fill="none" stroke="#fff" stroke-width="4" opacity=".8"/>
    ${star(93, 87, 17, '#fff3a0', '#8a5200')}${star(419, 87, 17, '#fff3a0', '#8a5200')}`;
};

const ribbon = (text) => {
  const fsz = Math.min(74, Math.round(400 / (text.length * 0.66)));
  const o = Math.round(fsz * 0.35);
  return `
    <path d="M 70 448 L 8 446 L 34 474 L 8 504 L 84 502 Z" fill="#6a22c9" stroke="#2e0a66" stroke-width="7" stroke-linejoin="round"/>
    <path d="M 442 448 L 504 446 L 478 474 L 504 504 L 428 502 Z" fill="#6a22c9" stroke="#2e0a66" stroke-width="7" stroke-linejoin="round"/>
    <path d="M 40 432 Q 256 400 472 432 L 472 494 Q 256 462 40 494 Z" fill="url(#ribbon)" stroke="#2e0a66" stroke-width="8" stroke-linejoin="round"/>
    <path d="M 52 442 Q 256 411 460 442" fill="none" stroke="#ffd84a" stroke-width="4"/>
    <path d="M 52 484 Q 256 453 460 484" fill="none" stroke="#ffd84a" stroke-width="4"/>
    <path id="rb" d="M 30 ${463 + o} Q 256 ${431 + o} 482 ${463 + o}" fill="none"/>
    <text font-family="Inter" font-weight="900" font-size="${fsz}" letter-spacing="-1" fill="url(#goldText)"
      stroke="#2e0a66" stroke-width="8" stroke-linejoin="round" paint-order="stroke">
      <textPath href="#rb" startOffset="50%" text-anchor="middle">${text}</textPath></text>`;
};

function catMira(e) {
  const props = [].concat(e.props || []);
  const front = props.filter((p) => m.FRONT.has(p));
  const back = props.filter((p) => !m.FRONT.has(p));
  const defs = m.defs.replace('#bfe9fb', '#ffffff').replace('#7cc4ea', '#e6defa');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 512 512">
    ${defs}
    <g filter="url(#sticker)" transform="translate(256 256) scale(.9) translate(-256 -262)">
      ${burst()}
      ${back.map((p) => m.PROPS[p]()).join('')}
      ${m.hairBack()}
      ${catBody()}
      ${m.braid(150, -1)}${m.braid(362, 1)}
      ${catEars()}
      ${m.face()}
      ${m.cheeks(e.blush)}
      ${m.EYES[e.eyes]()}
      ${m.MOUTHS[e.mouth]()}
      ${m.bangs()}
      ${front.map((p) => m.PROPS[p]()).join('')}
      ${ribbon(e.label)}
    </g>
  </svg>`;
  // рукава в кошачьем наряде сиреневые, а не голубые
  return withExtraDefs(svg).replace(/#3a6d93/g, CAT_LINE);
}

const FANS_EXTRA = [
  { id: '16-zahodi', label: 'ЗАХОДИ!', eyes: 'happy', mouth: 'open', props: ['invite', 'wave'] },
  { id: '17-dumayu', label: 'ДУМАЮ…', eyes: 'up', mouth: 'small', props: ['think'] },
  { id: '18-ura', label: 'УРА!', eyes: 'happy', mouth: 'open', props: ['confetti', 'handsUp'] },
  { id: '19-golosuyu', label: 'ГОЛОСУЮ', eyes: 'wink', mouth: 'smile', props: ['vote'] },
  { id: '20-obidka', label: 'ОБИДКА', eyes: 'side', mouth: 'pout', props: ['anger'], blush: true },
];

const PREMIUM = [
  { id: '01-myau', label: 'МЯУ!', eyes: 'wink', mouth: 'fang', props: ['tail', 'catPaws'], blush: true },
  { id: '02-murr', label: 'МУРР', eyes: 'happy', mouth: 'cat', props: ['tail', 'hearts'], blush: true },
  { id: '03-fyr', label: 'ФЫР!', eyes: 'angry', mouth: 'fang', props: ['catPaws', 'anger'] },
  { id: '04-taynyy-tanets', label: 'ТАЙНЫЙ ТАНЕЦ', eyes: 'wink', mouth: 'open', props: ['disco', 'peace'] },
  { id: '05-taro', label: 'ТАРО', eyes: 'sly', mouth: 'smile', props: ['tarot', 'crystal'] },
  { id: '06-poyu-tebe', label: 'ПОЮ ТЕБЕ', eyes: 'happy', mouth: 'open', props: ['notesL', 'mic'] },
  { id: '07-stishok', label: 'СТИШОК', eyes: 'happy', mouth: 'smile', props: ['quill', 'scroll'], blush: true },
  { id: '08-ugaday', label: 'УГАДАЙ!', eyes: 'up', mouth: 'cat', props: ['qmarks', 'guess'] },
  { id: '09-verno', label: 'ВЕРНО!', eyes: 'star', mouth: 'open', props: ['confetti', 'check'] },
  { id: '10-lider-vechera', label: 'ЛИДЕР ВЕЧЕРА', eyes: 'star', mouth: 'open', props: ['confetti', 'trophy'] },
  { id: '11-eshche-raund', label: 'ЕЩЁ РАУНД!', eyes: 'wink', mouth: 'smile', props: ['plusOne', 'rose'] },
  { id: '12-ruletka', label: 'РУЛЕТКА', eyes: 'spiral', mouth: 'open', props: ['wheel'] },
  { id: '13-shchedro', label: 'ЩЕДРО!', eyes: 'heart', mouth: 'open', props: ['coins'] },
  { id: '14-ugar', label: 'УГАР!', eyes: 'laugh', mouth: 'open', props: ['flames', 'tears'] },
  { id: '15-ty-kotik', label: 'ТЫ КОТИК', eyes: 'heart', mouth: 'cat', props: ['kitty'], blush: true },
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: SIZE, height: SIZE } });
  const jobs = [
    ['fans-extra', FANS_EXTRA, (e) => withExtraDefs(m.mira(e, false))],
    ['superfans-premium', PREMIUM, catMira],
  ];
  for (const [dir, list, render] of jobs) {
    fs.mkdirSync(path.join(OUT, dir), { recursive: true });
    for (const e of list) {
      await page.setContent(`<html><body style="margin:0;background:transparent">${render(e)}</body></html>`);
      await page.evaluate(() => document.fonts.ready);
      await page.locator('svg').screenshot({ path: path.join(OUT, dir, `${e.id}.png`), omitBackground: true });
    }
  }
  await browser.close();
  console.log('ok');
})();
