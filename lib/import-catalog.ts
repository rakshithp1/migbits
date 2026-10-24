import index from "../catalog/import-index.json";

export interface ImportedResource {
  id: string;
  name: string;
  description: string;
  source: string;
  sourceName: string;
  category: string;
  framework: string;
  license: string;
  revision: string;
  upstream: string;
  files: number;
  dependencies: string[];
  registryDependencies: string[];
  validation: "source-checked" | "needs-review";
  validationNotes: string[];
  digest: string;
  dataUrl: string;
  downloadUrl: string;
  supportUrls?: string[];
}

export interface ImportedFile { path: string; content: string; sha256: string }
export interface ImportedPayload {
  resource: ImportedResource;
  files: ImportedFile[];
  record?: Record<string, string>;
  installation: string[];
}

export const importedResources = index as ImportedResource[];
export const importCategories = [...new Set(importedResources.map(item => item.category))].sort();

export function findImports(query = "", source = "all", category = "all") {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return importedResources.filter(item =>
    (source === "all" || item.source === source) &&
    (category === "all" || item.category === category) &&
    words.every(word => `${item.name} ${item.description} ${item.category} ${item.sourceName} ${item.framework}`.toLowerCase().includes(word)),
  );
}
