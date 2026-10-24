import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {unzipSync,strFromU8} from 'fflate';
const require=createRequire(import.meta.url);
const archive=unzipSync(new Uint8Array(readFileSync('public/imported/magic-ui/support.zip')));
const registry=JSON.parse(strFromU8(archive['apps/www/registry.json']));
const upstream=JSON.parse(strFromU8(archive['apps/www/package.json']));
const dependencies={};
for(const spec of new Set(registry.items.flatMap(item=>item.dependencies||[]))){
 const match=/^(@[^/]+\/[^@]+|[^@]+)(?:@(.+))?$/.exec(spec);
 if(!match)throw new Error('Unrecognized dependency spec');
 const [,name,version]=match;
 try{require.resolve(name)}catch{dependencies[name]=version||upstream.dependencies[name]||'latest'}
}
// Icons appear in upstream examples but are not declared by every registry item.
for(const name of ['@radix-ui/react-icons','@shikijs/transformers'])try{require.resolve(name)}catch{dependencies[name]=upstream.dependencies[name]||'latest'}
mkdirSync('tmp/import-preview-runtime',{recursive:true});
writeFileSync('tmp/import-preview-runtime/package.json',JSON.stringify({name:'migbits-isolated-preview-dependencies',private:true,dependencies},null,2)+'\n');
console.log('Installing isolated preview dependencies:',Object.keys(dependencies).join(', '));
if(process.platform==='win32')execFileSync('cmd.exe',['/d','/c','npm install --ignore-scripts --no-audit --no-fund'],{cwd:'tmp/import-preview-runtime',stdio:'inherit'});
else execFileSync('npm',['install','--ignore-scripts','--no-audit','--no-fund'],{cwd:'tmp/import-preview-runtime',stdio:'inherit'});
