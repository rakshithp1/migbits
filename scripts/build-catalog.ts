import "./build-motion-pack";
import "./build-community-pack";
﻿import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resources } from "../catalog/resources";
import { validateCatalog } from "../catalog/validate";
const errors=validateCatalog(resources);if(errors.length)throw new Error(errors.join("\n"));
const snapshot=Object.fromEntries(resources.filter(resource=>resource.accessClass==="public").map(resource=>{
  const files=resource.files.map(file=>({path:file.path,content:readFileSync(file.path,"utf8").replace(/^\uFEFF/,"").replace(/\r\n/g,"\n")})).sort((a,b)=>a.path.localeCompare(b.path,"en"));
  const sourceDigest=createHash("sha256").update(JSON.stringify(files)).digest("hex");
  return [resource.id,{version:resource.version,sourceDigest,files}];
}));
writeFileSync("catalog/source-snapshots.json",JSON.stringify(snapshot,null,2)+"\n");
console.log(`Generated source snapshots for ${Object.keys(snapshot).length} public-access resource(s). Draft release restrictions still apply.`);
