import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { chromium } from '@playwright/test';

const revision=process.argv.includes('--sectors')?'migbits-sector-1.0.0':'migbits-fullscreen-1.0.0';
const resources=JSON.parse(fs.readFileSync('catalog/library/resources.json')).filter(r=>r.revision===revision);
const browser=await chromium.launch({channel:'chrome'}),results=[];
try{for(const item of resources){
  const page=await browser.newPage({viewport:{width:1440,height:960}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:3212'+item.previewUrl);
  await page.waitForFunction(()=>Number(document.querySelector('canvas')?.dataset.elapsed)>.6);
  const before=await page.locator('canvas').screenshot();await page.waitForTimeout(950);
  if(Buffer.compare(before,await page.locator('canvas').screenshot())===0)throw Error('Static motion '+item.id);
  if((await page.locator('.hero').boundingBox()).height<960)throw Error('Hero not full screen');
  await page.screenshot({path:'tmp/'+item.id+'-desktop.png'});
  for(const width of [320,390,768]){await page.setViewportSize({width,height:800});if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Overflow '+item.id+' '+width)}
  await page.screenshot({path:'tmp/'+item.id+'-mobile.png'});
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.documentElement.dataset.motion==='paused');
  const frozen=await page.locator('canvas').getAttribute('data-elapsed');await page.waitForTimeout(150);if(frozen!==await page.locator('canvas').getAttribute('data-elapsed'))throw Error('Reduced motion still advances');
  await page.setViewportSize({width:1440,height:960});await page.screenshot({path:'public'+item.image});
  if(errors.length)throw Error(errors.join(';'));
  const artifacts=Object.fromEntries([item.previewUrl,item.image,item.dataUrl,item.downloadUrl,item.licenseUrl].map(url=>[url,createHash('sha256').update(fs.readFileSync('public'+url)).digest('hex')]));
  results.push({id:item.id,status:'passed',checks:['Full-viewport 1440x960 hero','Changing automatic Canvas pixels','320/390/768 responsive no overflow','Reduced motion frozen','No browser errors'],artifacts});await page.close();console.log(item.id+' passed');
}}finally{await browser.close()}
fs.writeFileSync('catalog/library/'+(process.argv.includes('--sectors')?'sector-template-validation.json':'fullscreen-template-validation.json'),JSON.stringify({checkedAt:new Date().toISOString(),resources:results},null,2)+'\n');
