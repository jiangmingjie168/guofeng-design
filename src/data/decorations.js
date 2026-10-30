/**
 * 国风装饰 SVG（自绘 path）
 * 每个返回 { id, name, viewBox, paths: [{d, fill?, stroke?, strokeWidth?}] }
 */
export const DECORATIONS = [
  {
    id: 'xiangyun',
    name: '祥云',
    viewBox: '0 0 200 100',
    paths: [
      { d: 'M20,70 C20,50 40,35 60,40 C70,20 100,15 120,35 C140,20 170,30 175,50 C190,50 195,70 175,75 C160,90 120,90 100,75 C80,95 40,90 25,75 C10,75 10,65 20,70 Z', fill: '#C23A2B', opacity: 0.9 },
      { d: 'M50,55 C55,45 70,42 80,50 C90,40 110,42 115,55 C105,62 90,60 80,55 C70,62 55,62 50,55 Z', fill: '#F5E6C8' },
    ],
  },
  {
    id: 'huiwen',
    name: '回纹',
    viewBox: '0 0 120 40',
    paths: [
      { d: 'M5,5 H115 V35 H5 Z M15,15 H105 V25 H15 Z', fill: 'none', stroke: '#8B4513', strokeWidth: 3 },
      { d: 'M20,10 V20 H30 V10 H40 V30 H20 V10 M80,10 V30 H100 V10 H90 V20 H80 V10', fill: 'none', stroke: '#8B4513', strokeWidth: 2.5 },
    ],
  },
  {
    id: 'denglong',
    name: '灯笼',
    viewBox: '0 0 80 120',
    paths: [
      { d: 'M30,8 H50 L48,18 H32 Z', fill: '#C23A2B' },
      { d: 'M20,20 Q40,10 60,20 Q70,50 60,85 Q40,100 20,85 Q10,50 20,20 Z', fill: '#E74C3C' },
      { d: 'M28,30 Q40,25 52,30 M28,50 Q40,45 52,50 M28,70 Q40,65 52,70', fill: 'none', stroke: '#F5E6C8', strokeWidth: 1.5 },
      { d: 'M35,85 Q40,95 45,85 L42,110 H38 Z', fill: '#C23A2B' },
      { d: 'M38,110 Q40,118 42,110', fill: 'none', stroke: '#8B0000', strokeWidth: 1 },
    ],
  },
  {
    id: 'yinzhang',
    name: '印章框',
    viewBox: '0 0 100 100',
    paths: [
      { d: 'M8,8 H92 V92 H8 Z', fill: 'none', stroke: '#C23A2B', strokeWidth: 6 },
      { d: 'M16,16 H84 V84 H16 Z', fill: 'none', stroke: '#C23A2B', strokeWidth: 2 },
      { d: 'M8,8 L16,16 M92,8 L84,16 M8,92 L16,84 M92,92 L84,84', fill: 'none', stroke: '#C23A2B', strokeWidth: 2 },
    ],
  },
  {
    id: 'shanxing',
    name: '扇形',
    viewBox: '0 0 160 100',
    paths: [
      { d: 'M80,95 L10,25 Q80,-10 150,25 Z', fill: '#F5E6C8', stroke: '#8B4513', strokeWidth: 2 },
      { d: 'M80,95 L30,30 M80,95 L50,22 M80,95 L70,15 M80,95 L90,15 M80,95 L110,22 M80,95 L130,30', fill: 'none', stroke: '#8B4513', strokeWidth: 1 },
      { d: 'M40,40 Q80,20 120,40', fill: 'none', stroke: '#C23A2B', strokeWidth: 1.5 },
      { d: 'M50,55 Q80,40 110,55', fill: 'none', stroke: '#2E8B57', strokeWidth: 1 },
    ],
  },
  {
    id: 'chuanghua',
    name: '窗花',
    viewBox: '0 0 100 100',
    paths: [
      { d: 'M50,5 L58,35 L90,35 L65,55 L75,90 L50,70 L25,90 L35,55 L10,35 L42,35 Z', fill: '#C23A2B' },
      { d: 'M50,28 L54,42 L68,42 L57,50 L61,65 L50,56 L39,65 L43,50 L32,42 L46,42 Z', fill: '#F5E6C8' },
      { d: 'M50,5 L50,95 M5,50 L95,50 M20,20 L80,80 M80,20 L20,80', fill: 'none', stroke: '#9D2933', strokeWidth: 1.2 },
    ],
  },
  {
    id: 'shanshui',
    name: '山水',
    viewBox: '0 0 200 100',
    paths: [
      { d: 'M0,90 L30,50 L55,70 L90,25 L130,60 L160,35 L200,80 L200,100 L0,100 Z', fill: '#425066' },
      { d: 'M0,95 L40,65 L70,80 L110,45 L150,70 L200,90 L200,100 L0,100 Z', fill: '#2C3E50' },
      { d: 'M120,40 Q130,30 140,40', fill: 'none', stroke: '#FFFBF0', strokeWidth: 1.5, opacity: 0.6 },
    ],
  },
  {
    id: 'meihua',
    name: '梅花',
    viewBox: '0 0 100 100',
    paths: [
      { d: 'M50,50 m0,-28 a14,14 0 1,0 0.1,0 Z M50,50 m20,-20 a14,14 0 1,0 0.1,0 Z M50,50 m20,20 a14,14 0 1,0 0.1,0 Z M50,50 m-20,20 a14,14 0 1,0 0.1,0 Z M50,50 m-20,-20 a14,14 0 1,0 0.1,0 Z', fill: '#DB5A6B' },
      { d: 'M50,50 m0,0 a8,8 0 1,0 0.1,0 Z', fill: '#F0C239' },
      { d: 'M20,80 Q35,60 50,50 Q40,70 30,90', fill: 'none', stroke: '#50616D', strokeWidth: 2 },
    ],
  },
  {
    id: 'zhuzi',
    name: '竹子',
    viewBox: '0 0 60 140',
    paths: [
      { d: 'M25,10 L35,10 L38,40 L22,40 Z M23,45 L37,45 L40,80 L20,80 Z M21,85 L39,85 L42,130 L18,130 Z', fill: '#057748' },
      { d: 'M22,40 H38 M20,80 H40', fill: 'none', stroke: '#0AA344', strokeWidth: 1.5 },
      { d: 'M35,25 Q55,20 58,35 Q45,30 35,35 M25,55 Q5,50 8,70 Q18,60 25,65 M38,95 Q55,90 58,110 Q48,100 38,105', fill: '#789262' },
    ],
  },
  {
    id: 'lianhua',
    name: '莲花',
    viewBox: '0 0 100 100',
    paths: [
      { d: 'M50,85 Q30,60 20,40 Q35,45 50,55 Q65,45 80,40 Q70,60 50,85', fill: '#EDD1D8' },
      { d: 'M50,80 Q35,55 30,30 Q45,40 50,50 Q55,40 70,30 Q65,55 50,80', fill: '#DB5A6B' },
      { d: 'M50,75 Q42,50 50,20 Q58,50 50,75', fill: '#C23A2B' },
      { d: 'M40,85 Q50,95 60,85', fill: 'none', stroke: '#057748', strokeWidth: 2 },
      { d: 'M25,70 Q15,80 10,90 M75,70 Q85,80 90,90', fill: 'none', stroke: '#789262', strokeWidth: 2 },
    ],
  },
  {
    id: 'ruyi',
    name: '如意',
    viewBox: '0 0 160 60',
    paths: [
      { d: 'M10,30 Q20,10 40,20 Q50,5 70,20 L140,25 Q155,30 140,35 L70,40 Q50,55 40,40 Q20,50 10,30 Z', fill: '#F0C239', stroke: '#CA6924', strokeWidth: 1.5 },
      { d: 'M25,28 Q35,22 40,30 Q35,38 25,32 Z', fill: '#C23A2B' },
    ],
  },
  {
    id: 'biankuang',
    name: '云纹边框',
    viewBox: '0 0 200 200',
    paths: [
      { d: 'M20,20 H180 V180 H20 Z', fill: 'none', stroke: '#C23A2B', strokeWidth: 3 },
      { d: 'M30,30 H170 V170 H30 Z', fill: 'none', stroke: '#C23A2B', strokeWidth: 1 },
      { d: 'M20,40 C30,30 40,30 40,20 M160,20 C160,30 170,30 180,40 M180,160 C170,160 170,170 160,180 M40,180 C40,170 30,170 20,160', fill: 'none', stroke: '#C23A2B', strokeWidth: 2 },
    ],
  },
];

export function decorationToSvgString(dec, size = 120) {
  const parts = dec.paths.map((p) => {
    const attrs = [];
    if (p.fill && p.fill !== 'none') attrs.push(`fill="${p.fill}"`);
    else if (p.fill === 'none') attrs.push('fill="none"');
    else attrs.push('fill="#333"');
    if (p.stroke) attrs.push(`stroke="${p.stroke}"`);
    if (p.strokeWidth) attrs.push(`stroke-width="${p.strokeWidth}"`);
    if (p.opacity != null) attrs.push(`opacity="${p.opacity}"`);
    return `<path d="${p.d}" ${attrs.join(' ')} />`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${dec.viewBox}" width="${size}" height="${size}">${parts}</svg>`;
}
