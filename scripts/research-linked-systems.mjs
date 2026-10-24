import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const entries=[
 ['Material Web','material-components/material-web'],['Atlassian','atlassian/atlassian-frontend-mirror'],['Polaris','Shopify/polaris'],['Ant Design','ant-design/ant-design'],['Fluent UI','microsoft/fluentui'],['Primer','primer/react'],['Garden','zendeskgarden/react-components'],['Spectrum','adobe/react-spectrum'],['Chakra UI','chakra-ui/chakra-ui'],['Carbon','carbon-design-system/carbon'],['Base Web','uber/baseweb'],['Elastic UI','elastic/eui'],['GitLab UI',null],['Vuetify','vuetifyjs/vuetify'],['Mantine','mantinedev/mantine'],['Material UI','mui/material-ui'],['Radix','radix-ui/primitives'],['Blueprint','palantir/blueprint'],['Angular Components','angular/components'],['Pluralsight','pluralsight/design-system']
];
let token='';try{token=execFileSync('C:/Program Files/GitHub CLI/gh.exe',['auth','token'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim()}catch{}
const headers={'User-Agent':'Migbits-source-inventory',...(token?{Authorization:`Bearer ${token}`}:{})};
const sources=JSON.parse(readFileSync('catalog/import-sources.json','utf8'));const inventory=[];
async function api(p){const r=await fetch(`https://api.github.com/${p}`,{headers});if(!r.ok)throw new Error(`Official repository API HTTP ${r.status}`);return r.json()}
for(const [name,repo] of entries){
 const id=`ui-guideline-${name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`;
 const item={id,name,requested:'uiguideline.com',website:'https://www.uiguideline.com/systems',status:'blocked',reason:'',evidence:repo?`https://github.com/${repo}`:'https://gitlab.com/gitlab-org/gitlab-ui'};
 try{
  if(!repo)throw new Error('GitLab upstream requires a separate archive adapter; rights and archive access not verified in this GitHub pass.');
  const meta=await api(`repos/${repo}`);const commit=await api(`repos/${repo}/commits/${meta.default_branch}`);const license=await api(`repos/${repo}/license?ref=${commit.sha}`);
  const text=Buffer.from(license.content,'base64').toString('utf8');let spdx=license.license?.spdx_id;
  if(spdx==='NOASSERTION'&&/^MIT License/m.test(text)&&!/(Commons Clause|non-commercial)/i.test(text))spdx='MIT';
  if(!['MIT','Apache-2.0','BSD-3-Clause','BSD-2-Clause','ISC'].includes(spdx))throw new Error(`Repository license ${spdx||'unknown'} requires individual rights review; no bulk redistribution approved.`);
  if(name==='Atlassian')throw new Error('Packages have individual licenses; root repository terms do not establish rights for all design-system packages.');
  Object.assign(item,{status:'ready',repo:meta.full_name,revision:commit.sha,license:spdx,adapter:'library-collection',reason:`Complete text source collection for ${name}, pinned to an official repository snapshot. Binary media, fonts, logos and marketing assets are outside this pack; dependencies retain their own terms.`,evidence:`https://github.com/${meta.full_name}/blob/${commit.sha}/${license.path}`});
 }catch(e){item.reason=e.message}
 inventory.push(item);const i=sources.findIndex(s=>s.id===id);if(i<0)sources.push(item);else sources[i]=item;console.log(name,item.status,item.reason.slice(0,100));
 mkdirSync('catalog/import-progress',{recursive:true});writeFileSync('catalog/import-progress/ui-guideline-systems.json',JSON.stringify(inventory,null,2)+'\n');
}
const parent=sources.find(s=>s.id==='ui-guideline');parent.status='directory-reviewed';parent.reason='All 20 benchmark systems are inventoried separately below. Eligible repository collections are imported with their own licenses; unresolved rights and unavailable repositories remain blocked. Directory artwork and proprietary kits are excluded.';
writeFileSync('catalog/import-sources.json',JSON.stringify(sources,null,2)+'\n');
