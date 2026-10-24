import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductHeader } from "../../../components/product-header";
import { importedResources } from "../../../../lib/import-catalog";
import { ImportedSourceViewer } from "./source-viewer";
import { importPreviews } from "../../../../lib/import-status";
import "../imports.css";

export default async function ImportedDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = importedResources.find(resource => resource.id === id);
  if (!item) notFound();
  const preview = importPreviews.find(value => value.id === id && value.url && value.status !== "runtime-error") || importPreviews.find(value => value.id === `${id}-demo` && value.url && value.status !== "runtime-error");
  return <div className="product-shell imported-shell"><ProductHeader /><main className="product-main imported-detail"><Link href={`/open-source/imports?source=${item.source}`}>← {item.sourceName} collection</Link><span className="eyebrow">{item.category} / {item.license}</span><h1>{item.name}</h1><p>{item.description}</p><div className="imported-actions"><a className="button primary" href={item.downloadUrl} download>Download attributed source ↓</a>{(item.supportUrls || [`/imported/${item.source}/support.zip`]).map((url, i, all) => <a key={url} className="button ghost" href={url} download>Supporting files{all.length > 1 ? ` (${i + 1}/${all.length})` : ""} ↓</a>)}<a href={item.upstream} target="_blank" rel="noreferrer">Original source ↗</a></div><dl className="imported-metadata"><div><dt>Compatibility</dt><dd>{item.framework}</dd></div><div><dt>Validation</dt><dd>{item.validation === "source-checked" ? "Source checked; runtime pending" : "Needs review"}</dd></div><div><dt>Upstream revision</dt><dd><code>{item.revision.slice(0, 12)}</code></dd></div><div><dt>Dependencies</dt><dd>{item.dependencies.join(", ") || "See original source and supporting manifests"}</dd></div>{item.registryDependencies.length > 0 && <div><dt>Registry dependencies</dt><dd>{item.registryDependencies.join(", ")}</dd></div>}</dl><ImportedSourceViewer key={id} resource={item} previewUrl={preview?.url} /><aside className="imported-note"><strong>Validation notes</strong>{item.validationNotes.map(note => <p key={note}>{note}</p>)}<p>Original upstream files remain distinguishable from Migbits metadata. Downloads preserve license notices. Review keyboard behavior, contrast and reduced motion before using interactive code.</p></aside></main></div>;
}
