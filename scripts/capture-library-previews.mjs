import {readFileSync,writeFileSync,mkdirSync,existsSync} from "node:fs";
import {chromium} from "@playwright/test";
const base=process.env.GALLERY_BASE_URL||"http://127.0.0.1:3210";
const entries=JSON.parse(readFileSync("catalog/library/resources.json","utf8")).filter(r=>r.image?.endsWith(".png"));
mkdirSync("public/library/thumbnails",{recursive:true});
const browser=await chromium.launch({channel:"chrome"});
const results=[];let cursor=0;
try{
 await Promise.all(Array.from({length:3},async()=>{
 const page=await browser.newPage({viewport:{width:960,height:660},reducedMotion:"reduce"});
 for(;;){const item=entries[cursor++];if(!item)break;if(existsSync("public"+item.image)&&!process.argv.includes("--all")){results.push({id:item.id,status:"cached"});continue}
 const errors=[];const collect=e=>errors.push(e.message);page.on("pageerror",collect);
 try{
 const url=item.previewType==="component"?"/library/preview/"+item.id:item.previewUrl;
 const response=await page.goto(new URL(url,base).href,{waitUntil:"networkidle",timeout:45000});if(response.status()!==200)throw Error("Preview returned "+response.status());
 if(item.previewType==="component"){await page.locator(".kit-preview-inner > *:visible").first().waitFor({state:"visible"});await page.locator(".kit-preview-loading").waitFor({state:"detached"});const content=await page.locator('.kit-preview-inner').innerText();if(content.includes('This example could not render.')||content.includes('Preview unavailable.'))throw Error(content)}
 if(item.previewType==="block")await page.waitForFunction(()=>document.body.dataset.previewState==="rendered",{timeout:15000});
 await page.evaluate(()=>document.fonts.ready);
 if(errors.length)throw Error(errors.join("; "));
 await page.screenshot({path:"public"+item.image,animations:"disabled"});
 results.push({id:item.id,status:"render-checked",url});
 }catch(error){results.push({id:item.id,status:"blocked",reason:error.message})}
 page.removeListener("pageerror",collect);
 if(results.length%20===0)console.log("Captured "+results.length+"/"+entries.length);
 }
 await page.close();
 }));
}finally{await browser.close()}
const prior=existsSync("catalog/library/preview-validation.json")?JSON.parse(readFileSync("catalog/library/preview-validation.json","utf8")):[];
writeFileSync("catalog/library/preview-validation.json",JSON.stringify(results.map(r=>r.status==="cached"?(prior.find(p=>p.id===r.id)||r):r),null,2)+"\n");
console.log("Preview results",results.reduce((a,r)=>(a[r.status]=(a[r.status]||0)+1,a),{}));
if(results.some(r=>r.status==="blocked")){console.log(results.filter(r=>r.status==="blocked"));process.exitCode=1}
