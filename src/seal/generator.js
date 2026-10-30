/**
 * 印章生成器：将 2–4 个汉字转为红色方形印章 SVG / 数据 URL
 */
export function generateSealSvg(text, opts = {}) {
  const chars = Array.from((text || '').trim()).slice(0, 4);
  if (chars.length < 2) return null;

  const size = opts.size || 200;
  const pad = size * 0.1;
  const inner = size - pad * 2;
  const n = chars.length;
  // 布局：2字竖排或横排；3字上1下2或田字变体；4字田字格
  let positions = [];
  if (n === 2) {
    // 右→左、上→下 传统印风：右上、右下 或 右、左
    positions = [
      { ch: chars[0], x: size * 0.62, y: size * 0.42 },
      { ch: chars[1], x: size * 0.62, y: size * 0.72 },
    ];
    // 也可做成左右：更常见两字印是右字在上
  } else if (n === 3) {
    positions = [
      { ch: chars[0], x: size * 0.68, y: size * 0.38 },
      { ch: chars[1], x: size * 0.68, y: size * 0.68 },
      { ch: chars[2], x: size * 0.35, y: size * 0.55 },
    ];
  } else {
    // 4字：右上、右下、左上、左下（传统阅读顺序）
    positions = [
      { ch: chars[0], x: size * 0.68, y: size * 0.38 },
      { ch: chars[1], x: size * 0.68, y: size * 0.72 },
      { ch: chars[2], x: size * 0.35, y: size * 0.38 },
      { ch: chars[3], x: size * 0.35, y: size * 0.72 },
    ];
  }

  const fontSize = n <= 2 ? size * 0.32 : size * 0.26;
  const color = opts.color || '#C23A2B';

  const textEls = positions
    .map(
      (p) =>
        `<text x="${p.x}" y="${p.y}" text-anchor="middle" dominant-baseline="middle" font-size="${fontSize}" fill="${color}" font-family="KaiTi, STKaiti, 'Songti SC', SimSun, serif" font-weight="700">${escapeXml(p.ch)}</text>`
    )
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect x="${pad * 0.4}" y="${pad * 0.4}" width="${size - pad * 0.8}" height="${size - pad * 0.8}" fill="none" stroke="${color}" stroke-width="${size * 0.045}" rx="${size * 0.02}"/>
  <rect x="${pad}" y="${pad}" width="${inner}" height="${inner}" fill="none" stroke="${color}" stroke-width="${size * 0.012}"/>
  ${textEls}
</svg>`;

  return svg;
}

export function sealToDataUrl(text, opts) {
  const svg = generateSealSvg(text, opts);
  if (!svg) return null;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
