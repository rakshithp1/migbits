import {readFileSync,writeFileSync,existsSync,statSync,readdirSync,unlinkSync} from 'node:fs';
import path from 'node:path';
import {zipSync,strToU8} from 'fflate';
const workspace=process.cwd();
if(existsSync('catalog/rights-cleanup.json')){
 console.log('Rights cleanup already recorded. Preserving the original removal audit; import regeneration remains paused.');
 process.exit(0);
}
const publicRoot=path.resolve(workspace,'public/imported');
const previous=JSON.parse(readFileSync('catalog/import-index.json','utf8'));
const sources=JSON.parse(readFileSync('catalog/import-sources.json','utf8'));
const permittedSources=new Set(['inspo','magic-ui','shaders','ui-ux-pro-max']);
const retained=[],removed=[];
for(const item of previous){
 let reason='';
 if(!permittedSources.has(item.source))reason='Removed: broad repository, scene/runtime, design-guidance or per-item asset rights were not independently verified for this resource library.';
 else if(item.source==='ui-ux-pro-max'&&item.category!=='Colors & palettes')reason='Removed from public delivery: reference-only records are not reusable library assets.';
 else if(item.source==='magic-ui'){
  const payload=JSON.parse(readFileSync('public'+item.dataUrl,'utf8'));
  const file=payload.files.find(f=>/registry\/magicui\/.*\.tsx$/.test(f.path));
  if(!file||item.category==='Examples'||item.category==='Utilities & styles')reason='Removed: upstream demo or site bundle is not part of the reviewed core components.';
  else if(/<img\b|<Image\b|<image\b|https?:\/\/(?!www\.w3\.org)|Google|Facebook|YouTube|Twitter|Apple|Android|iPhone|Safari/i.test(file.content))reason='Removed: component contains external media, device/brand artwork or references requiring separate asset review.';
 }
 if(reason)removed.push({id:item.id,source:item.source,dataUrl:item.dataUrl,downloadUrl:item.downloadUrl,reason});
 else retained.push(item);
}
// Delete only individual generated public files, after validating the absolute
// target remains beneath the explicitly named imported-assets directory.
const keepFiles=new Set();
for(const item of retained){keepFiles.add(path.resolve('public'+item.dataUrl));keepFiles.add(path.resolve('public'+item.downloadUrl));}
for(const id of ['inspo','magic-ui','shaders'])keepFiles.add(path.join(publicRoot,id,'support.zip'));
function filesUnder(folder){return readdirSync(folder,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?filesUnder(path.join(folder,entry.name)):[path.join(folder,entry.name)])}
for(const file of filesUnder(publicRoot)){
 if(!file.startsWith(publicRoot+path.sep)||!statSync(file).isFile())throw new Error('Unexpected asset deletion target');
 const relative=path.relative(publicRoot,file).replaceAll('\\','/');
 const isInspoPreview=relative.startsWith('inspo/previews/');
 if(!keepFiles.has(file)&&!isInspoPreview)unlinkSync(file);
}
const magic=retained.filter(item=>item.source==='magic-ui');
const magicLicense=readFileSync('docs/licenses/magic-ui.txt','utf8');
const coreFiles={'LICENSE':strToU8(magicLicense),'lib/utils.ts':strToU8('import {clsx} from "clsx";import {twMerge} from "tailwind-merge";export function cn(...inputs){return twMerge(clsx(inputs))}\n')};
for(const item of magic){const payload=JSON.parse(readFileSync('public'+item.dataUrl,'utf8'));for(const f of payload.files.filter(f=>/registry\/magicui\/.*\.tsx$/.test(f.path)))coreFiles[f.path]=strToU8(f.content)}
coreFiles['ORIGIN.json']=strToU8(JSON.stringify({scope:'Reviewed core component source only. Upstream examples, branding, external media and website code are not included.',resources:magic.map(item=>({id:item.id,revision:item.revision,digest:item.digest}))},null,2));
writeFileSync(path.join(publicRoot,'magic-ui/support.zip'),zipSync(coreFiles,{level:6,mtime:new Date('2026-01-01T00:00:00Z')}));
for(const item of retained){
 if(item.source==='ui-ux-pro-max')item.supportUrls=[];
 const payload=JSON.parse(readFileSync('public'+item.dataUrl,'utf8'));payload.resource=item;
 writeFileSync('public'+item.dataUrl,JSON.stringify(payload,null,2)+'\n');
}
for(const source of sources){
 if(source.adapter&&!permittedSources.has(source.id)){source.status='removed';source.reason='Removed from public delivery at the owner’s request; no bulk or separately licensed source/asset packs are distributed.';}
}
const report=JSON.parse(readFileSync('catalog/import-report.json','utf8'));
for(const source of report.sources){const items=retained.filter(item=>item.source===source.id);if(source.imported){source.removed=(source.imported||0)-items.length;source.imported=items.length;source.sourceChecked=items.length;source.status=items.length?'imported':'removed';source.reason=items.length?'Only the retained, reviewed source scope is distributed.': 'Removed from current public catalog and all generated public downloads.';}}
const previews=JSON.parse(readFileSync('catalog/import-previews.json','utf8')).filter(item=>item.id.startsWith('inspo--'));
writeFileSync('catalog/import-index.json',JSON.stringify(retained,null,2)+'\n');writeFileSync('catalog/import-sources.json',JSON.stringify(sources,null,2)+'\n');writeFileSync('catalog/import-report.json',JSON.stringify(report,null,2)+'\n');writeFileSync('catalog/import-previews.json',JSON.stringify(previews,null,2)+'\n');
writeFileSync('catalog/rights-cleanup.json',JSON.stringify({reviewedAt:'2026-10-24',policy:'Original assets or explicitly verified permissive source only. No Commons Clause effects, paid/pro kits, broad repository mirrors, separately licensed scene/runtime bundles, brand artwork or unverified third-party Figma files.',retained:retained.length,removed:removed.map(({id,source,reason})=>({id,source,reason})),removedEffects:['BlurText','SpotlightCard'],filesAreCurrentDeliveryOnly:true},null,2)+'\n');
console.log(`Retained ${retained.length} reviewed entries; removed ${removed.length} entries and their generated public files.`);
