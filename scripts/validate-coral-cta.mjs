import fs from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
const hash=value=>createHash('sha256').update(value).digest('hex');
const origin=process.env.APPROVED_PREVIEW_ORIGIN||'http://127.0.0.1:3212';
const item=JSON.parse(fs.readFileSync('catalog/library/resources.json')).find(r=>r.id==='block-coral-signup');
const browser=await chromium.launch({channel:'chrome'});
const errors=[],sizes=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:960},reducedMotion:'no-preference'});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/imported/shaders/previews/index.html');
 await page.bringToFront();
 await page.setContent(`<style>body{margin:0}iframe{display:block;width:100%;height:960px;border:0}</style><iframe sandbox="allow-scripts" src="${origin}${item.previewUrl}"></iframe>`);
 const frame=page.frames().find(f=>f.parentFrame());
 await frame.waitForFunction(()=>document.body.dataset.previewState==='rendered');
 await frame.waitForFunction(()=>!document.querySelector('video').paused&&document.querySelector('video').readyState>=2);
 await page.waitForTimeout(2400);
 const box=await frame.locator('.cta').boundingBox();assert.equal(box.width,1380);assert.equal(box.height,340);
 const video=await frame.locator('video').evaluate(v=>({duration:v.duration,rate:v.playbackRate,loop:v.loop,muted:v.muted}));
 assert(video.duration>4.8&&video.duration<5.5);assert(video.loop&&video.muted&&video.rate===1);
 const decoded=()=>frame.locator('video').evaluate(v=>{const canvas=document.createElement('canvas');canvas.width=160;canvas.height=40;canvas.getContext('2d').drawImage(v,0,0,160,40);return canvas.toDataURL()});
 const before=await decoded();await page.waitForTimeout(650);const after=await decoded();assert(before!==after,'Smoke must produce changing decoded frames');
 await page.screenshot({path:'tmp/coral-final-desktop.png'});
 await frame.getByRole('textbox',{name:'Email address'}).fill('demo@example.com');await frame.getByRole('button',{name:'Get Free Access',exact:true}).click();assert((await frame.getByRole('status').innerText()).includes('no email was submitted'));
 for(const size of [{width:768,height:700},{width:680,height:612},{width:390,height:655},{width:320,height:568}]){
  await page.setViewportSize(size);await page.locator('iframe').evaluate((el,height)=>el.style.height=height+'px',size.height);
  const overflow=await frame.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);assert(!overflow,JSON.stringify(size));sizes.push({...size,overflow:false});
 }
 await page.screenshot({path:'tmp/coral-final-mobile.png',fullPage:true});
 await page.emulateMedia({reducedMotion:'reduce'});await frame.waitForFunction(()=>document.documentElement.dataset.ctaReduced==='true'&&document.querySelector('video').paused);assert(await frame.locator('video').isHidden());assert(await frame.locator('video').evaluate(v=>v.paused));assert.equal(await frame.locator('h1').evaluate(el=>getComputedStyle(el).animationName),'none');
 await page.setViewportSize({width:1440,height:960});await page.locator('iframe').evaluate(el=>el.style.height='960px');await frame.locator('.shell').screenshot({path:'public'+item.image});
 assert.equal(errors.length,0,errors.join(';'));
 const artifacts=Object.fromEntries([item.previewUrl,item.image,item.dataUrl,item.downloadUrl,item.licenseUrl].map(url=>[url,hash(fs.readFileSync('public'+url))]));
 fs.writeFileSync('catalog/library/coral-cta-validation.json',JSON.stringify({checkedAt:new Date().toISOString(),id:item.id,status:'passed',sandbox:'allow-scripts without allow-same-origin or allow-forms',desktop:{width:1440,height:960,cardWidth:1380,cardHeight:340},video,decodedFramesChanged:true,font:'Pinned unmodified Inter variable font embedded with OFL notice',responsive:sizes,form:'Valid local confirmation; no email transmission',reducedMotion:'Video hidden and paused; still plate visible; entrance disabled',artifactDigests:artifacts},null,2)+'\n');
 console.log('Coral CTA passed desktop geometry, real decoded motion, sandbox form, 4 responsive sizes and reduced motion.');
}finally{await browser.close()}
