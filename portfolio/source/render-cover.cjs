const { chromium } = require('playwright');
(async () => {
  const [html, out, dpr] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: Number(process.argv[5]||1600) }, deviceScaleFactor: Number(dpr || 1) });
  await p.goto('file://' + html, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  console.log(await p.evaluate(() => [...new Set([...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family))].join(',')));
  await p.screenshot({ path: out });
  await b.close();
})();
