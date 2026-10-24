import { existsSync } from "node:fs";
import { resolve, relative, isAbsolute } from "node:path";
import { resources } from "../catalog/resources";
import { validateCatalog } from "../catalog/validate";
const errors=validateCatalog(resources),root=process.cwd();
for(const resource of resources)for(const file of resource.files){const path=resolve(root,file.path), rel=relative(root,path);if(rel.startsWith("..")||isAbsolute(rel)||!existsSync(path))errors.push(`Missing or out-of-workspace file: ${file.path}`);}
if(errors.length){for(const error of errors)console.error(error);process.exitCode=1;}else console.log(`Catalog valid: ${resources.length} resource(s). Drafts are excluded from public metadata.`);
