import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { zipSync,strToU8 } from "fflate";
import { scrollDesigns,scrollHtml } from "../resources/library/scroll-experiences";
import type { LibraryResource } from "../lib/resource-library";

export function buildScrollExperiences():LibraryResource[]{
 const license=readFileSync('resources/library/LICENSE','utf8').replace(/\r\n/g,'\n');
 const save=(url:string,data:string|Uint8Array)=>{mkdirSync(path.dirname('public'+url),{recursive:true});writeFileSync('public'+url,data)};
 return scrollDesigns.map((d,i)=>{
  const id='template-'+d.slug,asset=d.theme==='software'?undefined:readFileSync(`resources/library/scroll-experiences/${d.theme==='footwear'?'footwear':'citrus'}.webp`),image=asset?'data:image/webp;base64,'+asset.toString('base64'):undefined;
  const provenance='Original MigBits frontend design and code. Fictional brand concept. Code is MIT licensed; retain the full notice. '+(asset?'Product imagery was generated for this project with OpenAI image generation, not sourced from stock libraries or existing brand media. It is concept imagery, not a photographed real product. Generated output may not be unique. Included for reuse with this template to the extent rights are held; no exclusive trademark rights, real-product claim or third-party endorsement is granted. Image SHA-256: '+createHash('sha256').update(asset).digest('hex')+'.':'The workspace UI and chart are original illustrative interfaces; no third-party SDK or service is bundled.');
  const html=scrollHtml(d,license,image),usage=['Open index.html directly; HTML, CSS and vanilla JavaScript, with no build, framework, CDN or external font. Product images are embedded.','Scroll naturally through the sticky product story. Scroll position drives parallax, scale, rotation, progress and chapter changes. No scroll hijacking or video timeline.','Use Pause effects to freeze transforms. Reduced motion uses a static normal-flow section; all three chapters also remain readable in the details section.','Code: MIT; retain LICENSE and embedded notices. Preserve ASSET-PROVENANCE.md for AI-generated concept imagery.','Frontend concept only: replace fictional names, example.com contact and sample workspace content. No account service, commerce, payment or product backend is connected.'];
  const files={'index.html':html,LICENSE:license,'ASSET-PROVENANCE.md':provenance,'README.md':'# '+d.name+'\n\n'+usage.join('\n\n')};
  const previewUrl=`/library/previews/scroll/${d.slug}.html`,dataUrl=`/library/data/${id}.json`,downloadUrl=`/library/downloads/${id}.zip`,licenseUrl=`/library/notices/${id}.txt`;
  save(previewUrl,html);save(dataUrl,JSON.stringify({files:Object.entries(files).map(([path,content])=>({path,content})),installation:usage},null,2)+'\n');save(downloadUrl,zipSync(Object.fromEntries(Object.entries(files).map(([p,c])=>[p,strToU8(c)])),{level:6,mtime:new Date(2026,0,1)}));save(licenseUrl,license+'\n\nASSET PROVENANCE\n'+provenance);
  return {id,name:d.name+' — scroll experience',description:`${d.kind} with a full-screen introduction, sticky three-chapter product story, scroll-driven parallax and reveals. ${asset?'Realistic AI-generated product imagery.':'Interactive original workspace UI.'} Responsive frontend concept.`,category:'templates',author:'MigBits contributors',license:'MIT',licenseUrl,sourceUrl:'https://github.com/rakshithp1/migbits/tree/main/resources/library/scroll-experiences',tags:['Scroll driven','Sticky storytelling','Parallax','Full screen',d.sector,...(asset?['AI-generated concept imagery']:['Interactive workspace'])],format:'HTML · CSS · vanilla JavaScript',previewType:'template',previewUrl,image:`/library/thumbnails/${id}.png`,dataUrl,downloadUrl,revision:'migbits-scroll-1.0.0',template:{kind:d.kind,pages:1,motion:true,motionEngine:'Native scroll + CSS transforms',original:true},featured:i,usage};
 });
}
