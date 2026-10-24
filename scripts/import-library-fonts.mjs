import {execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync,readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {zipSync,strToU8} from 'fflate';
let token='';try{token=execFileSync('C:/Program Files/GitHub CLI/gh.exe',['auth','token'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim()}catch{}
const headers={'User-Agent':'Migbits-font-license-review',...(token?{Authorization:`Bearer ${token}`}:{})};
async function api(p){const r=await fetch('https://api.github.com/repos/google/fonts/'+p,{headers,signal:AbortSignal.timeout(30000)});if(!r.ok)throw new Error(`Font metadata HTTP ${r.status}`);return r.json()}
const families=[['inter','Inter','Sans serif'],['manrope','Manrope','Sans serif'],['dmsans','DM Sans','Sans serif'],['spacegrotesk','Space Grotesk','Sans serif'],['instrumentserif','Instrument Serif','Serif'],['lora','Lora','Serif'],['fraunces','Fraunces','Serif'],['sourceserif4','Source Serif 4','Serif'],['playfairdisplay','Playfair Display','Serif'],['geist','Geist','Sans serif'],['geistmono','Geist Mono','Monospace'],['jetbrainsmono','JetBrains Mono','Monospace']];
const existing=existsSync('catalog/library/fonts.json')?JSON.parse(readFileSync('catalog/library/fonts.json','utf8')):[];
if(existing.length===families.length&&!process.argv.includes('--refresh')){console.log('Using the pinned, reviewed font collection.');process.exit(0)}
const revision=(await api('commits/main')).sha;const fonts=[];mkdirSync('public/library/fonts',{recursive:true});mkdirSync('public/library/downloads',{recursive:true});mkdirSync('catalog/library',{recursive:true});
for(const [id,name,classification] of families){
 try{
  const listing=await api(`contents/ofl/${id}?ref=${revision}`);
  const source=listing.find(x=>/\.ttf$/.test(x.name)&&!(/italic/i.test(x.name))&&(/wght|Regular/.test(x.name)))||listing.find(x=>/\.ttf$/.test(x.name)&&!(/italic/i.test(x.name)));
  const notice=listing.find(x=>x.name==='OFL.txt');if(!source||!notice)throw new Error('Font file or per-family OFL notice unavailable');
  const [fontResponse,licenseResponse]=await Promise.all([fetch(source.download_url),fetch(notice.download_url)]);if(!fontResponse.ok||!licenseResponse.ok)throw new Error('Font download failed');
  const bytes=new Uint8Array(await fontResponse.arrayBuffer());const license=await licenseResponse.text();if(!/SIL OPEN FONT LICENSE/i.test(license)||!license.includes('1.1'))throw new Error('Font license not verified');
  const variable=source.name.includes('wght');const face=`@font-face{font-family:"${name}";src:url("./${id}.ttf") format("truetype");font-weight:${variable?'100 900':'400'};font-style:normal;font-display:swap;}`;
  writeFileSync(`public/library/fonts/${id}.ttf`,bytes);writeFileSync(`public/library/fonts/${id}-OFL.txt`,license);
  const record={id:`font-${id}`,name,classification,variable,asset:`/library/fonts/${id}.ttf`,license:'OFL-1.1',licenseUrl:`https://github.com/google/fonts/blob/${revision}/${notice.path}`,sourceUrl:`https://github.com/google/fonts/tree/${revision}/ofl/${id}`,author:license.split(/\r?\n/).find(x=>/^Copyright/i.test(x))||'Original type designers',revision,sha256:createHash('sha256').update(bytes).digest('hex'),download:`/library/downloads/font-${id}.zip`,css:face};
  const zip={[`${id}.ttf`]:bytes,'OFL.txt':strToU8(license),'font.css':strToU8(face),'ORIGIN.json':strToU8(JSON.stringify(record,null,2)),'README.txt':strToU8(`Use font.css to self-host ${name}. Preserve OFL.txt. The original font software and its names have not been modified.\n`)};
  writeFileSync('public'+record.download,zipSync(zip,{level:6,mtime:new Date('2026-01-01T00:00:00Z')}));fonts.push(record);console.log(`Verified font: ${name}`);
 }catch(error){console.error(`${name}: ${error.message}`)}
}
writeFileSync('catalog/library/fonts.json',JSON.stringify(fonts,null,2)+'\n');writeFileSync('public/library/fonts.css',fonts.map(font=>font.css.replaceAll(`./${font.id.replace('font-','')}.ttf`,font.asset)).join('\n')+'\n');
