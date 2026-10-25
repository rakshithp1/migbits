import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { homedir } from "node:os";
const runtime = path.resolve(
  process.env.ARCHIVE_RUNTIME_DIR ||
    path.join(homedir(), ".codex/tmp/migbits-archive-runtime-20261025"),
);
const require = createRequire(path.join(runtime, "package.json"));
const { build } = require("esbuild");
const pluginModule = (
  await import(pathToFileURL(require.resolve("unplugin-typegpu/esbuild")).href)
).default;
const typegpu =
  typeof pluginModule === "function" ? pluginModule : pluginModule.default;
const entry = String.raw`
import {createRendererFromJSON} from "./packages/core/src/presetRenderer";
import {getAllShaders} from "./packages/core/src/shaderRegistry";
const registry=getAllShaders();
window.shaderDefinitions=registry.map(e=>({name:e.definition.name,role:e.definition.role,category:e.definition.category,props:Object.fromEntries(Object.entries(e.definition.props).map(([k,p])=>[k,p.default]))}));
window.runShader=async function(name,props={}){
 document.body.dataset.previewState="loading";
 try{
  if(name==='WebcamTexture')throw Error('Camera resources are not enabled in catalog previews');
  window.activeRenderer?.dispose();
  const definition=registry.find(e=>e.definition.name===name)?.definition;if(!definition)throw Error("Definition not found: "+name);
  const canvas=document.querySelector("canvas");canvas.width=640;canvas.height=440;
  const role=definition.role;
  const node={type:name,props};
  if(!["generator","shape","shapeEffect","scene","layout"].includes(role))node.children=[{type:"Checkerboard",props:{colorA:"#ce83dc",colorB:"#122856",cells:8}}];
  const renderer=createRendererFromJSON({components:[node]});
  window.activeRenderer=renderer;
  await renderer.initialize(canvas);
  if(renderer.getFailureReason())throw Error(renderer.getFailureReason());
  const context=renderer.getGPUContext();
  if(!context?.device)throw Error("No GPU device available");
  context.device.pushErrorScope("validation");
  for(let i=0;i<5;i++)await renderer.renderFrame({deltaSeconds:1/30});
  const gpuError=await context.device.popErrorScope();if(gpuError)throw Error(gpuError.message);
  window.shaderPreset={components:[node]};
  window.advanceShader=()=>renderer.renderFrame({deltaSeconds:1/30});
  document.body.dataset.previewState="rendered";
  return {name,role,preset:window.shaderPreset};
 }catch(error){document.body.dataset.previewState="error";document.querySelector("#error").textContent=error.message;throw error}
};
`;
writeFileSync(path.join(runtime, "preview-entry.ts"), entry);
mkdirSync("public/imported/shaders/previews", { recursive: true });
await build({
  entryPoints: [path.join(runtime, "preview-entry.ts")],
  bundle: true,
  write: true,
  outfile: "public/imported/shaders/previews/runtime.js",
  format: "iife",
  platform: "browser",
  target: "es2022",
  minify: true,
  plugins: [
    typegpu({}),
    {
      name: "pinned-core-aliases",
      setup(b) {
        b.onResolve({ filter: /^(@coreroot|shaders-core)(\/|$)/ }, (args) => {
          const suffix = args.path.replace(/^(@coreroot|shaders-core)\/?/, "");
          const base = path.join(
            runtime,
            "packages/core/src",
            suffix || "index",
          );
          return {
            path:
              [base + ".ts", path.join(base, "index.ts"), base].find((p) =>
                existsSync(p),
              ) || base,
          };
        });
      },
    },
  ],
  logLevel: "warning",
});
writeFileSync(
  "public/imported/shaders/previews/index.html",
  '<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#080b14;width:100%;height:100%;overflow:hidden}canvas{display:block;width:640px;height:440px}#error{color:white;font:12px monospace;white-space:pre-wrap}</style></head><body data-preview-state="loading"><canvas></canvas><div id="error"></div><script src="runtime.js"></script></body></html>',
);
console.log("Built pinned shader runtime.");
