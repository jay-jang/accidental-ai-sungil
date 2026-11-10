// Screenshot frames of the deck (1600×900, all build steps revealed) and print console errors.
// Setup once: npm i -D playwright && npx playwright install chromium
// Usage: node tools/shot.mjs <outdir> [frameId ...]     (ALL=1 for every frame, THEME=dark, OVERVIEW=1)
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = process.argv[2] || 'shots';
let ids = process.argv.slice(3);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, colorScheme: process.env.THEME === 'dark' ? 'dark' : 'light' });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
await page.waitForFunction(() => window.__deckReady, null, { timeout: 15000 });
await page.waitForTimeout(1500);
if (process.env.ALL) ids = await page.evaluate(() => Deck.frames.map((f) => f.id));
for (const id of ids) {
  await page.evaluate((id) => { const f = Deck.byId[id]; if (f) Deck.go(f.idx, { instant: true, step: 'end' }); }, id);
  await page.waitForTimeout(+process.env.WAIT || 800);
  await page.evaluate(() => document.querySelectorAll('.hud').forEach((h) => h.classList.add('idle')));
  const n = await page.evaluate(() => Deck.idx);
  await page.screenshot({ path: path.join(out, `${String(n).padStart(2, '0')}-${id}.png`) });
}
if (process.env.OVERVIEW) { await page.evaluate(() => Deck.toggleOverview()); await page.waitForTimeout(2500); await page.screenshot({ path: path.join(out, 'overview.png') }); }
console.log(errors.length ? errors.join('\n') : 'no errors');
await browser.close();
