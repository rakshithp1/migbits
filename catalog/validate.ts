import type { Resource } from "./schema";
import { taxonomy } from "./schema";
export function validateCatalog(items: Resource[]): string[] {
  const errors: string[] = [], ids = new Set<string>(), slugs = new Set<string>();
  for (const resource of items) {
    if (ids.has(resource.id)) errors.push(`Duplicate resource ID: ${resource.id}`);
    if (slugs.has(resource.slug)) errors.push(`Duplicate slug: ${resource.slug}`);
    ids.add(resource.id); slugs.add(resource.slug);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(resource.slug)) errors.push(`Unsafe slug: ${resource.slug}`);
    if (!/^\d+\.\d+\.\d+(?:-[a-z0-9.]+)?$/.test(resource.version)) errors.push(`Invalid version: ${resource.id}`);
    if (resource.schemaVersion !== 1) errors.push(`Unsupported schema: ${resource.id}`);
    if (!taxonomy.some(c=>c.id===resource.category)) errors.push(`Unknown category: ${resource.id}`);
    if (!resource.title.trim() || !resource.summary.trim()) errors.push(`Missing public text: ${resource.id}`);
    if (!resource.files.length || !resource.formats.length) errors.push(`Missing delivery metadata: ${resource.id}`);
    const paths = new Set<string>();
    for(const file of resource.files) {
      if (!file.path || file.path.startsWith("/") || file.path.includes("\\") || file.path.split("/").some(p=>p===".."||p===""||p==="." ) || /^[a-z]:/i.test(file.path)) errors.push(`Unsafe source path: ${file.path}`);
      if(paths.has(file.path))errors.push(`Duplicate source path: ${file.path}`);paths.add(file.path);
    }
    for(const dependency of resource.dependencies)if(!dependency.name || !dependency.testedVersion)errors.push(`Incomplete dependency: ${resource.id}`);
    if(!resource.provenance.author || !resource.provenance.origin)errors.push(`Missing provenance: ${resource.id}`);
    if(resource.status==="published" && (resource.license.status!=="approved" || !resource.license.identifier))errors.push(`Published resource needs an approved license: ${resource.id}`);
    if(resource.status==="published" && resource.testEvidence.some(e=>e.status!=="passed"))errors.push(`Published resource has incomplete checks: ${resource.id}`);
  }
  const byId = new Map(items.map(item=>[item.id,item]));
  const visiting = new Set<string>(), visited = new Set<string>();
  function visit(id:string) {
    if(visiting.has(id)){errors.push(`Dependency cycle: ${id}`);return;}
    if(visited.has(id))return;
    visiting.add(id);
    for(const dependency of byId.get(id)?.resourceDependencies||[]) {
      if(!byId.has(dependency))errors.push(`Missing resource dependency: ${dependency}`);else visit(dependency);
    }
    visiting.delete(id);visited.add(id);
  }
  for(const resource of items)visit(resource.id);
  return errors;
}
