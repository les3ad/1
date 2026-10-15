// Генератор эмоций фан-клуба TikTok: SVG -> PNG 512x512 с прозрачным фоном.
// Запуск: NODE_PATH=$(npm root -g) node emotes/generate.js
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const OUT = path.join(__dirname, 'png');
const SIZE = 512;

const heart = (x, y, s, fill, stroke = '#8a1030') =>
  `<path d="M ${x} ${y + s * 0.42} C ${x - s * 1.05} ${y - s * 0.2}, ${x - s * 0.55} ${y - s * 1.0}, ${x} ${y - s * 0.42}
   C ${x + s * 0.55} ${y - s * 1.0}, ${x + s * 1.05} ${y - s * 0.2}, ${x} ${y + s * 0.42} Z"
   fill="${fill}" stroke="${stroke}" stroke-width="${s * 0.12}" stroke-linejoin="round"/>`;

const star = (x, y, r, fill, stroke = '#b06a00', rot = -90) => {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.45 : r;
    const a = ((rot + i * 36) * Math.PI) / 180;
    pts.push(`${(x + rr * Math.cos(a)).toFixed(1)},${(y + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${r * 0.14}" stroke-linejoin="round"/>`;
};

const sparkle = (x, y, r, fill = '#fff6b0') =>
  `<path d="M ${x} ${y - r} Q ${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q ${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r}
   Q ${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q ${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r} Z"
   fill="${fill}" stroke="#d08a00" stroke-width="${r * 0.12}" stroke-linejoin="round"/>`;

// ---------- лицо ----------
const C = { x: 256, y: 284, r: 168 };
const INK = '#5a2a00';

const face = (theme) => `
  <circle cx="${C.x}" cy="${C.y}" r="${C.r}" fill="url(#face-${theme})" stroke="${INK}" stroke-width="9"/>
  <ellipse cx="${C.x - 70}" cy="${C.y - 105}" rx="52" ry="26" fill="#fff" opacity=".45" transform="rotate(-25 ${C.x - 70} ${C.y - 105})"/>
`;
const cheeks = (dy = 0) => `
  <ellipse cx="${C.x - 108}" cy="${C.y + 40 + dy}" rx="30" ry="18" fill="#ff6f8f" opacity=".55"/>
  <ellipse cx="${C.x + 108}" cy="${C.y + 40 + dy}" rx="30" ry="18" fill="#ff6f8f" opacity=".55"/>`;

const eye = (x, y, s = 1) => `
  <ellipse cx="${x}" cy="${y}" rx="${24 * s}" ry="${32 * s}" fill="#2b1400"/>
  <circle cx="${x + 8 * s}" cy="${y - 11 * s}" r="${9 * s}" fill="#fff"/>
  <circle cx="${x - 7 * s}" cy="${y + 12 * s}" r="${4 * s}" fill="#fff"/>`;
const eyes = {
  normal: () => eye(C.x - 62, C.y - 30) + eye(C.x + 62, C.y - 30),
  heart: () => heart(C.x - 64, C.y - 28, 52, '#ff2d55') + heart(C.x + 64, C.y - 28, 52, '#ff2d55'),
  star: () => star(C.x - 64, C.y - 32, 46, '#fff15a') + star(C.x + 64, C.y - 32, 46, '#fff15a'),
  laugh: () => `
    <path d="M ${C.x - 95} ${C.y - 60} L ${C.x - 45} ${C.y - 35} L ${C.x - 95} ${C.y - 10}" fill="none" stroke="#2b1400" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M ${C.x + 95} ${C.y - 60} L ${C.x + 45} ${C.y - 35} L ${C.x + 95} ${C.y - 10}" fill="none" stroke="#2b1400" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>`,
  happy: () => `
    <path d="M ${C.x - 95} ${C.y - 25} Q ${C.x - 62} ${C.y - 70} ${C.x - 29} ${C.y - 25}" fill="none" stroke="#2b1400" stroke-width="16" stroke-linecap="round"/>
    <path d="M ${C.x + 29} ${C.y - 25} Q ${C.x + 62} ${C.y - 70} ${C.x + 95} ${C.y - 25}" fill="none" stroke="#2b1400" stroke-width="16" stroke-linecap="round"/>`,
  wink: () => eye(C.x - 62, C.y - 30) + `
    <path d="M ${C.x + 30} ${C.y - 30} Q ${C.x + 62} ${C.y - 5} ${C.x + 95} ${C.y - 30}" fill="none" stroke="#2b1400" stroke-width="16" stroke-linecap="round"/>`,
  sad: () => eye(C.x - 62, C.y - 22, 0.9) + eye(C.x + 62, C.y - 22, 0.9) + `
    <path d="M ${C.x - 100} ${C.y - 75} L ${C.x - 40} ${C.y - 95}" stroke="#2b1400" stroke-width="12" stroke-linecap="round"/>
    <path d="M ${C.x + 100} ${C.y - 75} L ${C.x + 40} ${C.y - 95}" stroke="#2b1400" stroke-width="12" stroke-linecap="round"/>
    <path d="M ${C.x - 80} ${C.y + 8} q -16 40 0 58 q 16 -18 0 -58 Z" fill="#5fc8ff" stroke="#1d7ab8" stroke-width="5"/>
    <path d="M ${C.x + 82} ${C.y + 8} q -16 40 0 58 q 16 -18 0 -58 Z" fill="#5fc8ff" stroke="#1d7ab8" stroke-width="5"/>`,
  cool: () => `
    <path d="M ${C.x - 135} ${C.y - 62} H ${C.x + 135} V ${C.y - 45} H ${C.x + 120}
      C ${C.x + 118} ${C.y + 5}, ${C.x + 30} ${C.y + 5}, ${C.x + 20} ${C.y - 45} H ${C.x - 20}
      C ${C.x - 30} ${C.y + 5}, ${C.x - 118} ${C.y + 5}, ${C.x - 120} ${C.y - 45} H ${C.x - 135} Z"
      fill="#1a1a2e" stroke="#000" stroke-width="6" stroke-linejoin="round"/>
    <path d="M ${C.x - 105} ${C.y - 45} l 30 0 l -20 30 Z" fill="#fff" opacity=".6"/>
    <path d="M ${C.x + 40} ${C.y - 45} l 30 0 l -20 30 Z" fill="#fff" opacity=".6"/>`,
};

const mouths = {
  bigSmile: () => `
    <path d="M ${C.x - 80} ${C.y + 45} Q ${C.x} ${C.y + 60} ${C.x + 80} ${C.y + 45} Q ${C.x + 70} ${C.y + 135} ${C.x} ${C.y + 138} Q ${C.x - 70} ${C.y + 135} ${C.x - 80} ${C.y + 45} Z"
      fill="#7a0f1f" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
    <path d="M ${C.x - 40} ${C.y + 118} Q ${C.x} ${C.y + 92} ${C.x + 40} ${C.y + 118} Q ${C.x} ${C.y + 140} ${C.x - 40} ${C.y + 118} Z" fill="#ff5a78"/>
    <path d="M ${C.x - 62} ${C.y + 54} Q ${C.x} ${C.y + 66} ${C.x + 62} ${C.y + 54} L ${C.x + 58} ${C.y + 70} Q ${C.x} ${C.y + 80} ${C.x - 58} ${C.y + 70} Z" fill="#fff"/>`,
  smile: () => `<path d="M ${C.x - 55} ${C.y + 55} Q ${C.x} ${C.y + 105} ${C.x + 55} ${C.y + 55}" fill="none" stroke="#2b1400" stroke-width="14" stroke-linecap="round"/>`,
  oh: () => `
    <ellipse cx="${C.x}" cy="${C.y + 85}" rx="36" ry="46" fill="#7a0f1f" stroke="${INK}" stroke-width="8"/>
    <ellipse cx="${C.x}" cy="${C.y + 108}" rx="20" ry="14" fill="#ff5a78"/>`,
  frown: () => `<path d="M ${C.x - 45} ${C.y + 100} Q ${C.x} ${C.y + 60} ${C.x + 45} ${C.y + 100}" fill="none" stroke="#2b1400" stroke-width="14" stroke-linecap="round"/>`,
  smirk: () => `<path d="M ${C.x - 50} ${C.y + 80} Q ${C.x + 10} ${C.y + 100} ${C.x + 60} ${C.y + 55}" fill="none" stroke="#2b1400" stroke-width="14" stroke-linecap="round"/>`,
  kiss: () => heart(C.x + 10, C.y + 80, 30, '#ff2d55'),
};

// ---------- декор ----------
const hand = (x, y, rot) => `
  <g transform="rotate(${rot} ${x} ${y})">
    <rect x="${x - 38}" y="${y - 50}" width="76" height="96" rx="36" fill="url(#face-fan)" stroke="${INK}" stroke-width="8"/>
    <path d="M ${x - 14} ${y - 50} v 30 M ${x + 12} ${y - 50} v 30" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
  </g>
  <path d="M ${x + 55} ${y - 75} q 25 25 0 55 M ${x + 78} ${y - 92} q 38 40 0 88" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>`;

const crown = () => `
  <g transform="rotate(-12 256 110)">
    <path d="M 170 140 L 160 55 L 210 95 L 256 35 L 302 95 L 352 55 L 342 140 Z"
      fill="url(#gold)" stroke="#8a5200" stroke-width="9" stroke-linejoin="round"/>
    <rect x="166" y="128" width="180" height="26" rx="10" fill="url(#gold)" stroke="#8a5200" stroke-width="8"/>
    <circle cx="256" cy="98" r="15" fill="#ff2d75" stroke="#8a0030" stroke-width="5"/>
    <circle cx="205" cy="112" r="10" fill="#38d6ff" stroke="#0a6c8a" stroke-width="4"/>
    <circle cx="307" cy="112" r="10" fill="#38d6ff" stroke="#0a6c8a" stroke-width="4"/>
  </g>`;

const label = (text, theme) => {
  const fs = text.length > 7 ? 64 : text.length > 4 ? 82 : 100;
  const fill = theme === 'super' ? 'url(#label-super)' : 'url(#label-fan)';
  return `<text x="256" y="470" text-anchor="middle" font-family="Inter" font-weight="900" font-size="${fs}"
    fill="${fill}" stroke="#fff" stroke-width="22" stroke-linejoin="round" paint-order="stroke"
    transform="rotate(-4 256 450)" letter-spacing="-2">${text}</text>
    <text x="256" y="470" text-anchor="middle" font-family="Inter" font-weight="900" font-size="${fs}"
    fill="${fill}" stroke="${theme === 'super' ? '#3b0a6b' : '#7a1000'}" stroke-width="7" stroke-linejoin="round" paint-order="stroke"
    transform="rotate(-4 256 450)" letter-spacing="-2">${text}</text>`;
};

// ---------- набор ----------
const EMOTES = [
  { id: 'hi', label: 'ПРИВЕТ', eyes: 'happy', mouth: 'bigSmile', extra: () => hand(420, 300, 18) },
  { id: 'love', label: 'LOVE', eyes: 'heart', mouth: 'bigSmile', extra: () => heart(80, 140, 34, '#ff2d55') + heart(440, 120, 26, '#ff6f8f') },
  { id: 'lol', label: 'LOL', eyes: 'laugh', mouth: 'bigSmile', extra: () => `
      <path d="M 120 240 q -22 40 -4 60 q 18 -14 4 -60 Z" fill="#5fc8ff" stroke="#1d7ab8" stroke-width="5"/>
      <path d="M 392 240 q -18 46 4 60 q 22 -14 -4 -60 Z" fill="#5fc8ff" stroke="#1d7ab8" stroke-width="5"/>` },
  { id: 'wow', label: 'WOW', eyes: 'star', mouth: 'oh', extra: () => sparkle(78, 150, 30) + sparkle(440, 170, 22) },
  { id: 'gg', label: 'GG', eyes: 'cool', mouth: 'smirk', extra: () => sparkle(430, 140, 26) },
  { id: 'sad', label: 'НЕЕЕТ', eyes: 'sad', mouth: 'frown', extra: () => '' },
  { id: 'kiss', label: 'MWAH', eyes: 'wink', mouth: 'kiss', extra: () => heart(430, 170, 30, '#ff2d55') },
  { id: 'thanks', label: 'СПАСИБО', eyes: 'happy', mouth: 'smile', extra: () => heart(256, 380, 0, 'none') + heart(90, 170, 28, '#ff2d55') + heart(425, 160, 28, '#ff2d55') },
];

const defs = `
  <defs>
    <radialGradient id="face-fan" cx="40%" cy="30%" r="75%">
      <stop offset="0" stop-color="#fff27a"/><stop offset=".55" stop-color="#ffc93a"/><stop offset="1" stop-color="#ff9a1f"/>
    </radialGradient>
    <radialGradient id="face-super" cx="40%" cy="30%" r="75%">
      <stop offset="0" stop-color="#f6d9ff"/><stop offset=".5" stop-color="#c58cff"/><stop offset="1" stop-color="#7b3cff"/>
    </radialGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff59a"/><stop offset=".5" stop-color="#ffcc1f"/><stop offset="1" stop-color="#f08a00"/>
    </linearGradient>
    <linearGradient id="label-fan" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff7a3d"/><stop offset="1" stop-color="#e8132b"/>
    </linearGradient>
    <linearGradient id="label-super" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffe14a"/><stop offset="1" stop-color="#ff8a00"/>
    </linearGradient>
    <filter id="sticker" x="-10%" y="-10%" width="120%" height="120%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="12" result="d"/>
      <feFlood flood-color="#ffffff"/><feComposite in2="d" operator="in" result="white"/>
      <feOffset in="d" dy="6" result="off"/><feGaussianBlur in="off" stdDeviation="4" result="blur"/>
      <feFlood flood-color="#000" flood-opacity=".25"/><feComposite in2="blur" operator="in" result="shadow"/>
      <feMerge><feMergeNode in="shadow"/><feMergeNode in="white"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>`;

function svg(e, theme) {
  const superExtra = theme === 'super'
    ? crown() + sparkle(70, 250, 26) + sparkle(445, 330, 20)
    : '';
  // для суперфанатов лицо чуть ниже, чтобы поместилась корона
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 512 512">
    ${defs}
    <g filter="url(#sticker)" transform="translate(256 256) scale(.86) translate(-256 -256)">
      ${theme === 'super' ? '<g transform="translate(0 6)">' : '<g>'}
        ${face(theme)}
        ${e.eyes !== 'cool' ? cheeks() : cheeks(20)}
        ${eyes[e.eyes]()}
        ${mouths[e.mouth]()}
      </g>
      ${e.extra()}
      ${superExtra}
      ${label(e.label, theme)}
    </g>
  </svg>`;
}

(async () => {
  fs.mkdirSync(path.join(OUT, 'fans'), { recursive: true });
  fs.mkdirSync(path.join(OUT, 'superfans'), { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: SIZE, height: SIZE } });
  const done = [];
  for (const theme of ['fan', 'super']) {
    for (const e of EMOTES) {
      const markup = svg(e, theme);
      await page.setContent(`<html><body style="margin:0;background:transparent">${markup}</body></html>`);
      await page.evaluate(() => document.fonts.ready);
      const dir = theme === 'super' ? 'superfans' : 'fans';
      const file = path.join(OUT, dir, `${e.id}.png`);
      await page.locator('svg').screenshot({ path: file, omitBackground: true });
      done.push(file);
    }
  }
  await browser.close();
  console.log(done.join('\n'));
})();
