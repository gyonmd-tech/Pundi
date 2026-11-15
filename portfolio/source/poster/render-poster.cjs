const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport:{width:1200,height:1900}, deviceScaleFactor:2 });
await p.goto('file://'+process.argv[2],{waitUntil:'networkidle'}); await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(500);
await p.screenshot({path:process.argv[3], clip:{x:0,y:0,width:1200,height:1900}}); await b.close(); })();
