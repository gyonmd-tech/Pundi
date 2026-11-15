const { chromium } = require('playwright');
(async () => {
  const [html, outDir, dpr, suffix] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 1600 }, deviceScaleFactor: Number(dpr) });
  await p.goto('file://' + html, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  for (const id of ['s2','s3','s4','s5','s6','web']) {
    await p.locator('#' + id).screenshot({ path: `${outDir}/${id}${suffix}.png` });
  }
  await b.close();
})();
