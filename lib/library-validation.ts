import type { LibraryResource } from "./resource-library";

/** Main-gallery checks, independent of the guarded legacy draft schema. */
export function validateLibrary(items: LibraryResource[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const item of items) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(item.id) || ids.has(item.id)) errors.push(`Unsafe/duplicate gallery ID: ${item.id}`);
    ids.add(item.id);
    if (!item.name || !item.author || !item.license || !item.revision || !item.downloadUrl) errors.push(`Incomplete gallery provenance: ${item.id}`);
    for (const url of [item.image, item.previewUrl, item.dataUrl, item.downloadUrl, ...(item.variants || []).flatMap(variant => [variant.previewUrl, variant.dataUrl, variant.downloadUrl])]) {
      if (url?.includes("..") || url?.includes("\\") || (url && !url.startsWith("/"))) errors.push(`Unsafe public artifact path: ${item.id}`);
    }
    if (item.id.startsWith("approved-") && (!item.review || item.review.status !== "APPROVED" || item.review.preview !== "passed" || !/^[a-f0-9]{64}$/.test(item.review.sourceDigest) || !item.review.evidence || !item.review.notices.length)) errors.push(`New resource has no complete source/preview gate: ${item.id}`);
    if (item.template && (item.category !== "templates" || !Number.isInteger(item.template.pages) || item.template.pages < 1 || !item.template.kind || !item.template.motionEngine)) errors.push(`Invalid template metadata: ${item.id}`);
  }
  return errors;
}
