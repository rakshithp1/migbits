import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {chromium} from '@playwright/test';
import sharp from 'sharp';
const records=JSON.parse(fs.readFileSync('catalog/motionsites-resources.json'));
const browser=await chromium.launch({channel:'chrome'}),proofs=[];
const hash=data=>createHash('sha256').update(data).digest('hex');
try{for(const item of records){
 const page=await browser.newPage({viewport:{width:1120,height:820},reducedMotion:'no-preference'}),errors=[];page.setDefaultTimeout(25000);page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:3212/imported/shaders/previews/index.html');
  await page.setContent(`<iframe sandbox="allow-scripts" style="border:0;width:1050px;height:700px" src="http://127.0.0.1:3212${item.previewUrl}"></iframe>`);
  const frame=page.frames().find(f=>f.parentFrame());await frame.waitForFunction(()=>document.body.dataset.previewState==='rendered');
  const imgs=frame.locator('img');for(const img of await imgs.all())await img.evaluate(e=>e.complete&&e.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{e.onload=resolve;e.onerror=reject}));
  if(await frame.locator('[data-reference=video]').count())await frame.locator('[data-reference=video]').click();
  let moving=false;
  for(const video of await frame.locator('video:not([hidden])').all()){
   await video.evaluate(v=>v.play());await frame.waitForFunction(()=>[...document.querySelectorAll('video:not([hidden])')].every(v=>v.readyState>=2&&!v.paused));
   const before=await video.evaluate(v=>v.currentTime);await page.waitForTimeout(450);moving=(await video.evaluate(v=>v.currentTime))>before+.05;if(!moving)throw Error('No decoded playback progress');
  }
  if(item.prompt.previewMode==='live-adaptation'){
   await frame.locator('#root').getByText('MigBits Flow',{exact:false}).first().waitFor();
   await frame.locator('#root button').filter({hasText:'Try it Live'}).first().click();
   if(!(await frame.locator('[role=status]').textContent()).includes('Demo only'))throw Error('Demo action not disclosed');
  }
  if(!fs.existsSync('public'+item.image)||item.prompt.previewMode==='live-adaptation'){
   fs.mkdirSync(path.dirname('public'+item.image),{recursive:true});
   const target=item.prompt.previewMode==='live-adaptation'?frame.locator('#root'):frame.locator('.stage');
   await sharp(await target.screenshot()).resize(1000,700,{fit:'cover'}).webp({quality:82}).toFile('public'+item.image);
  }
  await frame.locator('[data-pause]').click();await frame.waitForFunction(()=>document.documentElement.dataset.motion==='paused');
  if(await frame.locator('video').evaluateAll(videos=>videos.some(v=>!v.paused)))throw Error('Pause did not stop playback');
  await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:430,height:820});await page.locator('iframe').evaluate(e=>e.style.width='390px');
  await frame.waitForFunction(()=>document.documentElement.dataset.reduced==='true');
  if(await frame.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('Mobile horizontal overflow');
  if(item.prompt.previewMode==='live-adaptation'){
   await frame.getByRole('button',{name:'Open menu'}).click();await frame.getByRole('button',{name:'Close menu'}).waitFor();await frame.getByRole('button',{name:'Close menu'}).click();
  }
  if(errors.length)throw Error(errors.join(';'));
  proofs.push({id:item.id,status:'passed',previewMode:item.prompt.previewMode,implementation:item.prompt.implementation,motionAssetDecoded:moving,checks:['Opaque iframe render','Loaded local reference assets or explicit unavailable state','Pause and reduced motion','390px no overflow',...(item.prompt.previewMode==='live-adaptation'?['React adaptation and honest local actions','Working mobile menu']:[])],artifacts:Object.fromEntries([item.previewUrl,item.image,item.dataUrl,item.downloadUrl,item.licenseUrl].map(url=>[url,hash(fs.readFileSync('public'+url))]))});
 }catch(error){proofs.push({id:item.id,status:'held',reason:String(error)});console.log('Held',item.id,String(error))}
 finally{await page.close();fs.writeFileSync('catalog/motionsites-preview-validation.json',JSON.stringify(proofs,null,2)+'\n');console.log(item.id,proofs.at(-1).status)}
}}finally{await browser.close()}
console.log(JSON.stringify({passed:proofs.filter(p=>p.status==='passed').length,held:proofs.filter(p=>p.status!=='passed')}));
if(proofs.some(p=>p.status!=='passed'))process.exitCode=1;
