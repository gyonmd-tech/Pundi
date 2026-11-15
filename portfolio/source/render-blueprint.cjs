const { chromium } = require('playwright');
(async () => {
  const [html, out, dpr] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 2400, height: 1200 }, deviceScaleFactor: Number(dpr || 1) });
  await p.goto('file://' + html, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  console.log(await p.evaluate(() => [...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family).join(',')));
  await p.screenshot({ path: out, fullPage: true });
  console.log(await p.evaluate(() => document.body.scrollHeight));
  await b.close();
})();
