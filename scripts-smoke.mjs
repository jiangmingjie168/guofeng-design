import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = process.env.MOHUA_URL || 'http://127.0.0.1:4173/guofeng-design/';
const OUT = process.env.SHOT_DIR || '/workspace/guofeng-design/shots';
fs.mkdirSync(OUT, { recursive: true });

async function exercise(page, label) {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForFunction(() => window.__mohua?.editor, { timeout: 15000 });
  await page.waitForTimeout(600);

  // Exercise via API (works on mobile where sidebar is off-canvas)
  const result = await page.evaluate(async () => {
    const { editor, TEMPLATES } = window.__mohua;
    editor.addText('杰哥你好');
    await editor.addDecoration('xiangyun');
    await editor.addSeal('墨画');
    const pngProbe = editor.exportPNG();
    const t = TEMPLATES.filter(Boolean).find((x) => x.id === 'chunjie');
    await editor.loadTemplate(t);
    return { pngLen: pngProbe?.length || 0, tpl: t.name };
  });

  await page.click('[data-action="zoom-fit"]');
  await page.waitForTimeout(500);
  const shot1 = path.join(OUT, `${label}-template.png`);
  await page.screenshot({ path: shot1, fullPage: false });

  await page.evaluate(async () => {
    const t = window.__mohua.TEMPLATES.filter(Boolean).find((x) => x.id === 'baoxian-kepu');
    await window.__mohua.editor.loadTemplate(t);
  });
  await page.click('[data-action="zoom-fit"]');
  await page.waitForTimeout(400);
  const shot2 = path.join(OUT, `${label}-insurance.png`);
  await page.screenshot({ path: shot2, fullPage: false });

  // On mobile, also open tools drawer for a UI shot
  if (label === 'mobile') {
    await page.click('.mobile-bar button[data-mobile="tpls"]');
    await page.waitForTimeout(400);
    const shot3 = path.join(OUT, `mobile-drawer.png`);
    await page.screenshot({ path: shot3, fullPage: false });
  }

  return { ...result, shot1, shot2 };
}

const browser = await chromium.launch({ headless: true });

fs.readdirSync(OUT).forEach((f) => {
  if (f.endsWith('.png')) fs.unlinkSync(path.join(OUT, f));
});

const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const d = await exercise(desktop, 'desktop');
await desktop.close();

const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
const m = await exercise(mobile, 'mobile');
await mobile.close();

await browser.close();
console.log(JSON.stringify({ desktop: d, mobile: m, files: fs.readdirSync(OUT) }, null, 2));
