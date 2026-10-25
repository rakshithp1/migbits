import { existsSync } from "node:fs";
import { resolve, relative, isAbsolute } from "node:path";
import { resources } from "../catalog/resources";
import { validateCatalog } from "../catalog/validate";
import { libraryResources } from "../lib/resource-library";
import { validateLibrary } from "../lib/library-validation";
const errors=validateCatalog(resources),root=process.cwd();
errors.push(...validateLibrary(libraryResources));
for(const resource of resources)for(const file of resource.files){const path=resolve(root,file.path), rel=relative(root,path);if(rel.startsWith("..")||isAbsolute(rel)||!existsSync(path))errors.push(`Missing or out-of-workspace file: ${file.path}`);}
if(errors.length){for(const error of errors)console.error(error);process.exitCode=1;}else console.log(`Catalog valid: ${libraryResources.length} gallery entries and ${resources.length} structured export resource(s). Drafts are excluded from public metadata.`);
