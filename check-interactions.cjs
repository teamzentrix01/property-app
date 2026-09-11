const { chromium }=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 // Browser-only fixtures: no database writes or changes to production data.
 const user={id:'ui-review-user',name:'Review User',email:'review@example.test',phone:'9000000000',role:'OWNER',verificationStatus:'ACTIVE',createdAt:'2026-01-01'};
 const fixture=city=>({id:city.toLowerCase()+'-review',title:city+' review home',city:' '+city.toUpperCase()+' ',area:'Central',price:'12000',purpose:'RENT',propertyType:'FLAT',sizeValue:253,sizeUnit:'sqft',status:'APPROVED',photos:[{url:'/login-hero.jpg'}]});
 let saved=false;
 await page.route('**/api/**',async route=>{
  const url=new URL(route.request().url()); let body={};
  if(url.pathname==='/api/auth/me') body={user};
  else if(url.pathname==='/api/listings'&&url.searchParams.has('city')) {const city=url.searchParams.get('city');body={listings:[fixture(city),{...fixture(city),id:'pending',status:'PENDING'}]};}
  else if(url.pathname==='/api/saved') {if(route.request().method()==='POST')saved=true;body={ids:saved?['meerut-review']:[],listings:[]};}
  else if(url.pathname==='/api/profile') body={user,counts:{saved:1,posted:1,documents:0}};
  else if(url.pathname.includes('properties')) body={listings:[fixture('Meerut')]};
  else if(url.pathname.includes('documents')) body={documents:[]};
  else body={listings:[],inquiries:[]};
  await route.fulfill({json:body});
 });
 await page.goto('http://localhost:3000/',{waitUntil:'networkidle'});
 const trending=page.locator('section').filter({has:page.getByRole('heading',{name:/Trending Projects in/})});
 for(const city of ['Moradabad','Meerut','Rampur']) {
  await page.getByRole('button',{name:city,exact:true}).click();
  const card=trending.locator('.property-card');await card.getByText(city+' review home',{exact:true}).waitFor();
  assert.equal(await card.count(),1);
  assert.equal(await card.getByRole('link',{name:'View Details'}).getAttribute('href'),'/listings/'+city.toLowerCase()+'-review');
  if(city==='Meerut'){await card.getByRole('button',{name:'Save property',exact:true}).click();await card.getByRole('button',{name:'Remove saved property',exact:true}).waitFor();}
 }
 await trending.getByRole('button',{name:'Next city'}).click();await trending.getByRole('heading',{name:'Trending Projects in Moradabad'}).waitFor();
 await page.goto('http://localhost:3000/dashboard',{waitUntil:'networkidle'});
 await page.getByRole('heading',{name:'Welcome back, Review'}).waitFor();
 await page.screenshot({path:'ui-review/dashboard-desktop.png'});
 await page.setViewportSize({width:390,height:1000});
 await page.getByRole('button',{name:'Account menu'}).click();
 await page.locator('aside').getByRole('button',{name:'Saved Properties',exact:true}).click();
 await page.locator('.property-card').waitFor();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390);
 await page.screenshot({path:'ui-review/dashboard-mobile.png'});
 await page.goto('http://localhost:3000/post-property',{waitUntil:'networkidle'});
 await page.getByRole('heading',{name:'Post your property'}).waitFor();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390);
 await page.screenshot({path:'ui-review/post-property-mobile.png'});
 await browser.close();console.log('PASS: city-specific cards, pending exclusion, ID routes, saved heart state, arrow wrap, dashboard navigation, posting form and mobile widths (browser fixtures).');
})().catch(error=>{console.error(error);process.exitCode=1;});
