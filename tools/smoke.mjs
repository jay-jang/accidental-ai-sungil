// Visit every frame in light and dark themes, step through builds, press every button/chip,
// move every slider to min/max, and report runtime errors or unexpected navigation.
// Setup once: npm i -D playwright && npx playwright install chromium     Usage: node tools/smoke.mjs
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const browser = await chromium.launch();
let failed = 0;
for (const theme of ['light', 'dark']) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 810 }, colorScheme: theme });
  const errors = [];
  let cur = 'load';
  page.on('pageerror', (e) => errors.push(`pageerror @${cur}: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console @${cur}: ${m.text()}`); });
  await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
  await page.waitForFunction(() => window.__deckReady);
  await page.waitForTimeout(1500);
  const ids = await page.evaluate(() => Deck.frames.map((f) => f.id));
  let clicks = 0;
  for (const id of ids) {
    cur = id;
    await page.evaluate((id) => Deck.goId(id, { instant: true }), id);
    await page.waitForTimeout(250);
    const steps = await page.evaluate(() => Deck.frames[Deck.idx].steps || 0);
    for (let s = 0; s < steps; s++) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(80); }
    const sel = '.stage button, .stage .chip, .stage [role=button]';
    const n = await page.evaluate((sel) => { const el = Deck.frames[Deck.idx].el; return el ? el.querySelectorAll(sel).length : 0; }, sel);
    for (let i = 0; i < Math.min(n, 14); i++) {
      await page.evaluate(([sel, i]) => {
        const b = Deck.frames[Deck.idx].el.querySelectorAll(sel)[i];
        if (!b) return;
        b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        b.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
        b.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }, [sel, i]);
      clicks++;
      await page.waitForTimeout(60);
    }
    await page.evaluate(() => {
      const el = Deck.frames[Deck.idx].el; if (!el) return;
      el.querySelectorAll('input[type=range]').forEach((r) => { for (const v of [r.min, r.max, (+r.min + +r.max) / 2]) { r.value = v; r.dispatchEvent(new Event('input', { bubbles: true })); r.dispatchEvent(new Event('change', { bubbles: true })); } });
    });
    await page.waitForTimeout(400);
    if (await page.evaluate((id) => Deck.frames[Deck.idx].id !== id, id)) errors.push(`a control navigated away from ${id}`);
  }
  console.log(`${theme}: ${ids.length} frames, ${clicks} clicks, ${errors.length} problems`);
  errors.forEach((e) => console.log('  ' + e));
  failed += errors.length;
  await page.close();
}
await browser.close();
process.exit(failed ? 1 : 0);
