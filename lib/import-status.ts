import report from "../catalog/import-report.json";
import previews from "../catalog/import-previews.json";

export interface ImportSourceStatus {
  id: string; requested: string; website: string; status: string; reason: string; evidence: string;
  repo?: string; discovered: number | null; imported?: number; sourceChecked?: number;
  runtimeValidated?: number; duplicates?: number; removed?: number; inventoryComplete?: boolean; supportUrl?: string;
}
export interface ImportPreviewStatus { id: string; status: string; url?: string; reason?: string }
export const importReport = report as { schemaVersion: number; reviewedAt: string; complete: boolean; sources: ImportSourceStatus[] };
export const importPreviews = previews as ImportPreviewStatus[];
