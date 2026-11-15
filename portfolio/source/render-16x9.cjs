const { chromium } = require('playwright');
(async () => {
  const [html, outDir, dpr, suffix] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: Number(dpr) });
  await p.goto('file://' + html, { waitUntil: 'networkidle' });
  for (const id of ['w1','w2']) await p.locator('#' + id).screenshot({ path: `${outDir}/${id}${suffix}.png` });
  await b.close();
})();
