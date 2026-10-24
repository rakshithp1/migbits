import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
const candidates=JSON.parse(readFileSync('catalog/community/candidates.json','utf8').replace(/^\uFEFF/,''));
let token='';try{token=execFileSync('C:/Program Files/GitHub CLI/gh.exe',['auth','token'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();}catch{}
const headers={'Accept':'application/vnd.github+json','User-Agent':'Migbits-license-research',...(token?{Authorization:`Bearer ${token}`}:{})};
async function api(path){const response=await fetch(`https://api.github.com/${path}`,{headers});if(!response.ok)throw new Error(`GitHub status ${response.status}`);return response.json();}
const manualReviews=JSON.parse(readFileSync('catalog/community/manual-reviews.json','utf8'));
const approved=[],excluded=[];mkdirSync('docs/licenses',{recursive:true});
let cursor=0;
await Promise.all(Array.from({length:4},async()=>{while(cursor<candidates.length){const [repo,name,category,stack,website,summary,tags]=candidates[cursor++];try{
 const metadata=await api(`repos/${repo}`);if(metadata.archived)throw new Error('Archived upstream repository');
 const commit=await api(`repos/${metadata.full_name}/commits/${metadata.default_branch}`);
 const license=await api(`repos/${metadata.full_name}/license?ref=${commit.sha}`);
 const text=Buffer.from(license.content,'base64').toString('utf8');let spdx=license.license?.spdx_id;
 const manual=manualReviews[metadata.full_name];if(manual && manual.licenseSha256===createHash("sha256").update(text).digest("hex"))spdx=manual.spdx;
 if(!['MIT','ISC','Apache-2.0','BSD-2-Clause','BSD-3-Clause','CC0-1.0','Unlicense','Zlib','ISC AND MIT'].includes(spdx)||/Commons Clause|NonCommercial|non-commercial|Hippocratic|PolyForm|BUSL|Business Source License/i.test(text)){
  excluded.push({name,repo:metadata.full_name,license:spdx||'unknown',licenseUrl:license.html_url,reason:/Commons Clause|Hippocratic|NonCommercial|non-commercial/i.test(text)?'Custom terms or redistribution restrictions; not included in the permissive collection.':'License classification unresolved; excluded until manual review.'});console.log('Excluded:',name,spdx);continue;
 }
 const id=name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');const licensePath=`docs/licenses/${id}.txt`;writeFileSync(licensePath,text);
 approved.push({id,name,category,stack,website,summary,tags,repository:`https://github.com/${metadata.full_name}`,revision:commit.sha,license:spdx,licenseUrl:`https://github.com/${metadata.full_name}/blob/${commit.sha}/${license.path}`,licensePath,licenseSha256:createHash('sha256').update(text).digest('hex'),reviewedAt:'2026-10-23',delivery:'upstream-link',scope:'Applies to this repository snapshot. Paid products, separate assets, trademarks and linked projects are not covered by this entry.'});console.log('Verified:',name,spdx);
 }catch(error){excluded.push({name,repo,reason:error.message});console.log('Needs review:',name,error.message);}}}));
approved.sort((a,b)=>a.name.localeCompare(b.name,'en'));excluded.sort((a,b)=>a.name.localeCompare(b.name,'en'));
writeFileSync('catalog/community/verified.json',JSON.stringify(approved,null,2)+'\n');writeFileSync('catalog/community/excluded.json',JSON.stringify(excluded,null,2)+'\n');
console.log(`Research complete: ${approved.length} verified; ${excluded.length} excluded or unresolved. No upstream component source was copied by this research script.`);
