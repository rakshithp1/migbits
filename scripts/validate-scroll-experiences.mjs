import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {chromium} from '@playwright/test';
const resources=JSON.parse(fs.readFileSync('catalog/library/resources.json')).filter(r=>r.revision==='migbits-scroll-1.0.0');
const browser=await chromium.launch({channel:'chrome'}),results=[];
try{for(const item of resources){
 const page=await browser.newPage({viewport:{width:1500,height:1050}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:3212/imported/shaders/previews/index.html');
 await page.setContent(`<iframe sandbox="allow-scripts" style="border:0;width:1440px;height:960px" src="http://127.0.0.1:3212${item.previewUrl}"></iframe>`);
 const frame=page.frames().find(f=>f.parentFrame());await frame.waitForFunction(()=>document.body.dataset.previewState==='rendered');
 await frame.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
 const duplicates=await frame.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);return ids.filter((v,i)=>ids.indexOf(v)!==i)});if(duplicates.length)throw Error('Duplicate IDs '+duplicates);
 await frame.locator('.hero').screenshot({path:'tmp/'+item.id+'-desktop.png'});
 await frame.locator('.hero').screenshot({path:'public'+item.image});
 const scroll=async p=>{await frame.evaluate(p=>{const s=document.querySelector('.scroll-story');scrollTo({top:s.offsetTop+(s.offsetHeight-innerHeight)*p,behavior:'instant'})},p);await page.waitForTimeout(200)};
 await scroll(.15);const before=await frame.locator('.story-art').evaluate(e=>e.style.transform);
 await scroll(.85);const after=await frame.locator('.story-art').evaluate(e=>e.style.transform);if(before===after)throw Error('Scroll does not drive transforms');
 if(await frame.locator('html').getAttribute('data-chapter')!=='3')throw Error('Final story chapter not reached');
 await page.screenshot({path:'tmp/'+item.id+'-story.png'});
 await frame.locator('.motion-toggle').evaluate(e=>e.click());const frozen=await frame.locator('.story-art').evaluate(e=>e.style.transform);await scroll(.3);if(frozen!==await frame.locator('.story-art').evaluate(e=>e.style.transform))throw Error('Pause did not freeze');
 await page.evaluate(()=>document.querySelector('iframe').contentWindow.postMessage({type:'migbits-template-color',color:'emerald'},'*'));await frame.waitForFunction(()=>document.documentElement.dataset.templateColor==='emerald');
 await page.emulateMedia({reducedMotion:'reduce'});await frame.evaluate(()=>scrollBy({top:1,behavior:'instant'}));await frame.waitForFunction(()=>document.documentElement.dataset.reduced==='true');
 if(await frame.locator('.story-stage').evaluate(e=>getComputedStyle(e).position)!=='relative')throw Error('Reduced motion remains pinned');
 await page.evaluate(()=>document.querySelector('iframe').contentWindow.postMessage({type:'migbits-template-color',color:'original'},'*'));await frame.waitForFunction(()=>document.documentElement.dataset.templateColor==='original');
 for(const width of [320,390,768]){await page.setViewportSize({width:width+40,height:920});await page.locator('iframe').evaluate((e,width)=>{e.style.width=width+'px';e.style.height='844px'},width);await frame.evaluate(()=>scrollTo({top:0,behavior:'instant'}));if(await frame.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('Overflow '+width);if(width===390)await frame.locator('.hero').screenshot({path:'tmp/'+item.id+'-phone.png'})}
 if(errors.length)throw Error(errors.join(';'));
 results.push({id:item.id,status:'passed',checks:['Opaque sandbox and loaded product images','Unique accessibility IDs','Scroll-driven transform and three chapters','Pause freezes effects','Reduced motion removes pinning','Colour controls','320/390/768 widths without overflow'],artifacts:Object.fromEntries([item.previewUrl,item.image,item.dataUrl,item.downloadUrl,item.licenseUrl].map(url=>[url,createHash('sha256').update(fs.readFileSync('public'+url)).digest('hex')]))});await page.close();console.log(item.id+' passed');
}}finally{await browser.close()}
fs.writeFileSync('catalog/library/scroll-experience-validation.json',JSON.stringify({checkedAt:new Date().toISOString(),resources:results},null,2)+'\n');
