import { createRequire } from "node:module";
import { writeFileSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { createResourceExport, archiveExport } from "../services/resource-export";
import { defaultPreset } from "../tokens/preset";
import { unzipSync, strFromU8 } from "fflate";
async function main(){
const root=process.cwd(),workspace=resolve(root,"tmp/consumer-validation");mkdirSync(workspace,{recursive:true});
for(const name of ["package.json","package-lock.json","tsconfig.json","main.tsx"])copyFileSync(resolve(root,"tests/consumer",name),resolve(workspace,name));
const preset={...defaultPreset,accent:"emerald" as const,radius:20 as const,density:"compact" as const,theme:"dark" as const};
const bundle=createResourceExport({slug:"profile-settings",version:defaultPreset.resourceVersion,preset,allowDrafts:true});
const archive=unzipSync(archiveExport(bundle));
for(const [path,content]of Object.entries(archive)){const target=resolve(workspace,"migbits",path);if(!target.startsWith(resolve(workspace,"migbits")+"\\")&&!target.startsWith(resolve(workspace,"migbits")+"/"))throw new Error("Unsafe export path");mkdirSync(dirname(target),{recursive:true});writeFileSync(target,content);}
if(JSON.parse(strFromU8(archive["preset.json"])).accent!=="emerald")throw new Error("Configured preset lost during archive extraction");
const npmCli=process.env.npm_execpath;if(!npmCli)throw new Error("Run this verifier with npm run test:consumer.");
for(const args of [["ci","--no-audit","--no-fund"],["run","typecheck"],["run","build"]]){const result=spawnSync(process.execPath,[npmCli,...args],{cwd:workspace,stdio:"inherit"});if(result.status!==0)process.exit(result.status||1);}
const require=createRequire(resolve(workspace,"package.json"));const esbuild=require("esbuild");
writeFileSync(resolve(workspace,"render-check.tsx"),`import {createElement} from 'react';\nimport {renderToStaticMarkup} from 'react-dom/server';\nimport {ProfileSettings} from './migbits/resources/profile-settings/profile-settings';\nimport {accents,defaultPreset} from './migbits/tokens/preset';\nlet count=0;\nfor(const [accent,color] of Object.entries(accents))for(const theme of ['light','dark'])for(const radius of [6,12,20])for(const density of ['comfortable','compact']) {\n const preset={...defaultPreset,accent,theme,radius,density};\n const html=renderToStaticMarkup(createElement(ProfileSettings,{preset}));\n for(const value of ['--resource-accent:'+color,'--resource-radius:'+radius+'px','data-theme="'+theme+'"','--resource-space:'+(density==='compact'?'14px':'22px')])if(!html.includes(value))throw new Error('Preset-render mismatch: '+value);\n count++;\n}\nconsole.log('Consumer render consistency:',count,'brand combinations passed. This is SSR markup evidence, not browser visual parity.');\n`);
await esbuild.build({entryPoints:[resolve(workspace,"render-check.tsx")],bundle:true,platform:"node",format:"esm",packages:"external",jsx:"automatic",loader:{".css":"empty"},outfile:resolve(workspace,"dist/render-check.mjs"),logLevel:"warning"});
const render=spawnSync(process.execPath,["dist/render-check.mjs"],{cwd:workspace,stdio:"inherit"});if(render.status!==0)process.exit(render.status||1);
if(!existsSync(resolve(workspace,"dist/app.css")))throw new Error("Consumer stylesheet not emitted");
const result={resourceId:bundle.resourceId,version:bundle.resourceVersion,sourceDigest:bundle.sourceDigest,exportDigest:bundle.exportDigest,checks:["Fresh locked dependency install","Standalone TypeScript check","Browser JS/CSS bundle","48 preset SSR markup combinations"],limitations:["No browser interaction or screenshot comparison performed","Registry CLI installation is checked separately from this ZIP consumer fixture"]};
writeFileSync(resolve(root,"tmp/consumer-validation-result.json"),JSON.stringify(result,null,2)+"\n");
console.log("Clean-consumer verification passed for source",bundle.sourceDigest);
}
main().catch(error=>{console.error(error);process.exitCode=1;});
