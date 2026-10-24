import { createHash } from "node:crypto";
import { strToU8, zipSync, type Zippable } from "fflate";
import snapshots from "../catalog/source-snapshots.json";
import { getResource } from "../catalog/resources";
import { defaultPreset, parsePreset, type BrandPreset } from "../tokens/preset";

export class DeliveryError extends Error { constructor(public status:number,public code:string,message:string){super(message);} }
export interface ExportFile { path:string; content:string }
export interface ResourceExport {
  schemaVersion:1; resourceId:string; resourceVersion:string; sourceDigest:string; preset:BrandPreset;
  license:{status:string;identifier:string|null;notice:string}; dependencies:{name:string;testedVersion:string;kind:string}[];
  files:ExportFile[]; checksums:Record<string,string>; exportDigest:string;
}
const sha=(text:string)=>createHash("sha256").update(text).digest("hex");
export function canDeliverDrafts() { return process.env.NODE_ENV === "development"; }
export function createResourceExport({slug,version,preset=defaultPreset,allowDrafts=false}:{slug:string;version:string;preset?:unknown;allowDrafts?:boolean}):ResourceExport {
  const resource=getResource(slug);
  if(!resource || resource.accessClass!=="public" || resource.status==="withdrawn")throw new DeliveryError(404,"RESOURCE_NOT_FOUND","Resource unavailable.");
  if(version!==resource.version)throw new DeliveryError(404,"VERSION_NOT_FOUND","That exact resource version is unavailable.");
  if(resource.status!=="published" && !allowDrafts)throw new DeliveryError(404,"RESOURCE_NOT_RELEASED","This draft has not been released.");
  const parsed=parsePreset(preset);if(!parsed.ok)throw new DeliveryError(422,"INVALID_PRESET",parsed.error);
  if(parsed.value.resourceVersion!==version)throw new DeliveryError(422,"PRESET_VERSION_MISMATCH","Preset and resource versions must match.");
  const source=snapshots[resource.id as keyof typeof snapshots];
  if(!source || source.version!==version)throw new DeliveryError(503,"SNAPSHOT_UNAVAILABLE","Source snapshot unavailable. Regenerate the catalog.");
  const configured=JSON.stringify(parsed.value,null,2);
  const example=`"use client";\nimport { ProfileSettings } from "./resources/profile-settings/profile-settings";\nimport type { BrandPreset } from "./tokens/preset";\n\nexport const brandPreset = ${configured} as const satisfies BrandPreset;\n\nexport default function ProfileSettingsExample() {\n  return <ProfileSettings preset={brandPreset} onSave={async (profile) => {\n    // Replace with an authenticated request to your own backend.\n    // Do not log personal details or mistake this demo for persistence.\n    void profile;\n  }} />;\n}\n`;
  const instructions=`# Migbits profile settings ${version}\n\n${resource.license.notice}\n\n## Manual installation\n\nCopy this entire directory into your React application's source tree, preserving resources/ and tokens/. Import ProfileSettingsExample from example.tsx to start with your selected brand. The component imports its scoped stylesheet itself. Your bundler must support CSS imports. No Tailwind plugin or Next.js runtime is required.\n\nReact ${resource.dependencies[0].testedVersion} is the tested peer version. React DOM must match your installed React version. The website's development previews do not ship in this export.\n\n## Persistence\n\nThe example onSave callback is a no-op demonstration, not a backend. Replace it before production with an authenticated request that rejects on failure. The form validates fields, prevents duplicate submission while saving, and retains edits after failure.\n\n## Preset and fidelity\n\npreset.json is the validated brand preset from the preview. example.tsx passes exactly those values. Source files are copied without text rewriting; SHA-256 hashes in manifest.json identify every included file. A preview scenario such as loading/error is not an integration or server state and is not forced into the exported example.\n\n## Evidence and limits\n\nSee the resource page for current build evidence. Manual browser, keyboard, screen-reader and visual parity reviews are not established by the file checksums. Draft source has no approved redistribution license yet.\n`;
  const files:ExportFile[]=[...source.files,{path:"example.tsx",content:example},{path:"preset.json",content:configured+"\n"},{path:"INSTALL.md",content:instructions},{path:"NOTICE.txt",content:resource.license.notice+"\nOrigin: "+resource.provenance.origin+"\n"}].sort((a,b)=>a.path.localeCompare(b.path,"en"));
  const checksums=Object.fromEntries(files.map(file=>[file.path,sha(file.content)]));
  const manifest={schemaVersion:1 as const,resourceId:resource.id,resourceVersion:version,sourceDigest:source.sourceDigest,preset:parsed.value,license:resource.license,dependencies:resource.dependencies,checksums};
  const exportDigest=sha(JSON.stringify(manifest));
  return {...manifest,files,exportDigest};
}
function manifestText(bundle:ResourceExport) {
  const {files: omitted,...manifest}=bundle;void omitted;
  return JSON.stringify(manifest,null,2)+"\n";
}
export function archiveExport(bundle:ResourceExport):Uint8Array {
  const input:Zippable={};
  for(const file of bundle.files)input[file.path]=[strToU8(file.content),{mtime:new Date(1980,0,1,0,0,0)}];
  input["manifest.json"]=[strToU8(manifestText(bundle)),{mtime:new Date(1980,0,1,0,0,0)}];
  return zipSync(input,{level:6});
}
export function registryItem(bundle:ResourceExport) {
  return {$schema:"https://ui.shadcn.com/schema/registry-item.json",name:"migbits-profile-settings",type:"registry:block",title:"Migbits Profile settings",description:"Original profile settings with validated brand tokens. "+bundle.license.notice,
    files:[...bundle.files,{path:"manifest.json",content:manifestText(bundle)}].map(file=>({path:file.path,type:"registry:file",target:`@components/migbits/profile-settings/${file.path}`,content:file.content})),
    meta:{resourceId:bundle.resourceId,version:bundle.resourceVersion,sourceDigest:bundle.sourceDigest,exportDigest:bundle.exportDigest,preset:bundle.preset,checksums:bundle.checksums,peerDependencies:bundle.dependencies,license:bundle.license},
    docs:"All relative imports and scoped CSS are included. Import example.tsx from the installed directory. Replace its demonstration onSave callback with your backend integration. Draft: local development only."};
}
export async function readBoundedJson(request:Request,limit=8192):Promise<unknown> {
  if(!request.headers.get("content-type")?.toLowerCase().startsWith("application/json"))throw new DeliveryError(415,"JSON_REQUIRED","Send application/json.");
  if(Number(request.headers.get("content-length"))>limit)throw new DeliveryError(413,"INPUT_TOO_LARGE","Export request exceeds 8 KB.");
  const reader=request.body?.getReader();if(!reader)throw new DeliveryError(400,"INVALID_JSON","Request body is required.");
  const chunks:Uint8Array[]=[];let bytes=0;
  try{while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>limit){await reader.cancel();throw new DeliveryError(413,"INPUT_TOO_LARGE","Export request exceeds 8 KB.");}chunks.push(value);}}finally{reader.releaseLock();}
  const buffer=new Uint8Array(bytes);let offset=0;for(const chunk of chunks){buffer.set(chunk,offset);offset+=chunk.length;}
  try{return JSON.parse(new TextDecoder().decode(buffer));}catch{throw new DeliveryError(400,"INVALID_JSON","Could not parse the export settings.");}
}
export function deliveryError(error:unknown):Response {
  if(error instanceof DeliveryError)return Response.json({error:{code:error.code,message:error.message}},{status:error.status,headers:{"Cache-Control":"no-store"}});
  return Response.json({error:{code:"EXPORT_FAILED",message:"Export unavailable. Your preview settings are unchanged. Please retry."}},{status:500,headers:{"Cache-Control":"no-store"}});
}
