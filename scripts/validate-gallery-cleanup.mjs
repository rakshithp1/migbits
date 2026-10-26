import { createHash } from "node:crypto";
import fs from 'node:fs';
import { chromium } from '@playwright/test';
import sharp from 'sharp';
const resources=JSON.parse(fs.readFileSync('catalog/library/resources.json'));
const browser=await chromium.launch({channel:'chrome'});
const selected=process.argv.find(a=>a.startsWith('--ids='))?.slice(6).split(',');
const templatesOnly=process.argv.includes('--templates');
const shadersOnly=process.argv.includes('--shaders');
const templateIds=new Set(resources.filter(r=>r.category==='templates').map(r=>r.id));
const results=shadersOnly?JSON.parse(fs.readFileSync('catalog/library/cleanup-preview-validation.json')).filter(r=>templateIds.has(r.id)):templatesOnly?JSON.parse(fs.readFileSync('catalog/library/cleanup-preview-validation.json')).filter(r=>!templateIds.has(r.id)):selected?JSON.parse(fs.readFileSync('catalog/library/cleanup-preview-validation.json')).filter(r=>!selected.includes(r.id)):[];
try {

 for(const item of resources.filter(r=>(r.category==='shaders'||r.category==='templates')&&(!selected||selected.includes(r.id))&&(!templatesOnly||r.category==='templates')&&(!shadersOnly||r.category==='shaders'))){
  const page=await browser.newPage({viewport:{width:1100,height:820},reducedMotion:'no-preference'});page.setDefaultTimeout(20000);
  const errors=[];const collect=e=>errors.push(e.message);page.on('pageerror',collect);
  try{
   await page.goto('http://127.0.0.1:3212/imported/shaders/previews/index.html');
   await page.setContent(`<iframe sandbox="allow-scripts" style="width:1000px;height:700px" src="http://127.0.0.1:3212${item.previewUrl}"></iframe>`);
   const frame=page.frames().find(f=>f.parentFrame());
   await frame.waitForFunction(()=>document.body.dataset.previewState==='rendered',undefined,{timeout:20000});
   if(item.category==='shaders'){
    await frame.waitForFunction(()=>document.body.dataset.motionState==='running');
    if(await frame.locator('button').count())throw Error('Manual activation button remains');
    const before=await frame.locator('canvas').screenshot();
    await page.waitForTimeout(1600);
    const after=await frame.locator('canvas').screenshot();
    const a=await sharp(before).raw().toBuffer(),b=await sharp(after).raw().toBuffer();
    let changed=0;for(let i=0;i<a.length;i++)if(Math.abs(a[i]-b[i])>3)changed++;
    const ratio=changed/a.length;if(ratio<.0002)throw Error('No measurable automatic motion: '+ratio);
    await page.emulateMedia({reducedMotion:'reduce'});
    await frame.waitForFunction(()=>document.body.dataset.motionState==='paused');
    await page.emulateMedia({reducedMotion:'no-preference'});
    results.push({id:item.id,status:'passed',automaticPixelChange:ratio});
   }else{
    await page.evaluate(()=>document.querySelector('iframe').contentWindow.postMessage({type:'migbits-template-color',color:'emerald'},'*'));
    await frame.waitForFunction(()=>document.documentElement.dataset.templateColor==='emerald');
    const changed=await frame.locator('style').allTextContents();
    await page.evaluate(()=>document.querySelector('iframe').contentWindow.postMessage({type:'migbits-template-color',color:'original'},'*'));
    await frame.waitForFunction(()=>document.documentElement.dataset.templateColor==='original');
    const original=await frame.locator('style').allTextContents();
    if(JSON.stringify(changed)===JSON.stringify(original))throw Error('Colour preset did not change CSS');
    await page.setViewportSize({width:375,height:812});
    await page.locator('iframe').evaluate(el=>el.style.width='350px');
    if(await frame.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('Mobile overflow');
    await page.setViewportSize({width:1100,height:820});
    results.push({id:item.id,status:'passed',checks:'Opaque sandbox render, automatic initial mount, colour switch/reset, mobile width'});
   }
   if(errors.length)throw Error(errors.join(';'));
  }catch(error){results.push({id:item.id,status:'held',reason:String(error)})}
  finally{Object.assign(results.at(-1),{previewUrl:item.previewUrl,previewDigest:createHash('sha256').update(fs.readFileSync('public'+item.previewUrl)).digest('hex')});page.off('pageerror',collect);await page.close();fs.writeFileSync('catalog/library/cleanup-preview-validation.json',JSON.stringify(results,null,2)+'\n');console.log(item.id,results.at(-1).status,results.at(-1).reason||'')}
 }
}finally{await browser.close()}
console.log(JSON.stringify({passed:results.filter(r=>r.status==='passed').length,held:results.filter(r=>r.status==='held')},null,2));
