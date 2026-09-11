const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  fs.mkdirSync('ui-review', { recursive: true });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for(const route of ['/', '/properties', '/login', '/signup', '/admin/login', '/listings/cmtl870go0004brqc95lg5or6']) {
      await page.goto('http://localhost:3000'+route, {waitUntil:'networkidle'});
      const dimensions = await page.evaluate(() => ({viewport: innerWidth, documentWidth: document.documentElement.scrollWidth}));
      if(dimensions.documentWidth > width) throw new Error('Horizontal overflow on '+route);
      console.log(JSON.stringify({width,route,...dimensions}));
      await page.screenshot({path:`ui-review/${width}-${route.replaceAll('/','_') || 'home'}.png`,fullPage:false});
    }
  }
  await page.goto('http://localhost:3000/', {waitUntil:'networkidle'});
  for(const city of ['Meerut','Rampur','Moradabad']) {
    await page.getByRole('button',{name:city,exact:true}).click();
    await page.getByRole('heading',{name:`Trending Projects in ${city}`}).waitFor();
    console.log('City tab passed: '+city);
  }
  console.log('Browser errors: '+JSON.stringify(errors));
  await browser.close();
})().catch(error=>{console.error(error);process.exitCode=1;});
