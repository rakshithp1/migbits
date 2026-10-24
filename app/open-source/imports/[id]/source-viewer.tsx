"use client";
import { useEffect, useState } from "react";
import type { ImportedPayload, ImportedResource } from "../../../../lib/import-catalog";

export function ImportedSourceViewer({ resource, previewUrl }: { resource: ImportedResource; previewUrl?: string }) {
  const [payload, setPayload] = useState<ImportedPayload | null>(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState("");
  const [copied, setCopied] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch(resource.dataUrl, { signal: controller.signal }).then(response => { if (!response.ok) throw new Error("Source download failed. Please reload or use the original source link."); return response.json(); }).then((data: ImportedPayload) => { setPayload(data); setSelected(data.files[0]?.path || ""); }).catch(error => { if (error.name !== "AbortError") setError(error.message); });
    return () => controller.abort();
  }, [resource.dataUrl]);
  if (error) return <p role="alert">{error}</p>;
  if (!payload) return <p role="status">Loading source files…</p>;
  const current = payload.files.find(file => file.path === selected);
  const colors = [...new Set(Object.values(payload.record || {}).join(" ").match(/#[0-9a-fA-F]{6}\b/g) || [])];
  return <section className="imported-viewer" aria-label="Source and usage"><h2>Source & usage</h2>{previewUrl && <section className="imported-preview"><h3>Isolated preview</h3><p>The original example runs in a sandbox. Network access and external media are disabled. Some controls use demonstration data.</p><button className="button ghost" type="button" onClick={() => setPreviewOpen(value => !value)}>{previewOpen ? "Close preview" : "Load preview"}</button>{previewOpen && <iframe title={`${resource.name} preview`} src={previewUrl} sandbox="allow-scripts" loading="lazy" referrerPolicy="no-referrer" />}</section>}{payload.installation.map(note => <p key={note}>{note}</p>)}{colors.length > 0 && <div className="imported-swatches" aria-label="Palette preview">{colors.map(color => <div key={color}><span style={{ backgroundColor: color }} /><code>{color}</code></div>)}</div>}{payload.record && <dl className="imported-record">{Object.entries(payload.record).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>}<div className="imported-code-tools"><label>File<select value={selected} onChange={event => { setSelected(event.target.value); setCopied(""); }}>{payload.files.map(file => <option key={file.path}>{file.path}</option>)}</select></label><button type="button" onClick={async () => { try { await navigator.clipboard.writeText(current?.content || ""); setCopied("Copied source"); } catch { setCopied("Copy unavailable. Select the source text or download the ZIP."); } }}>Copy source</button><span role="status">{copied}</span></div><pre tabIndex={0} aria-label={selected}><code>{current?.content || "Select a file to read its source."}</code></pre></section>;
}
