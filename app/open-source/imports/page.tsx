import type { Metadata } from "next";
import Link from "next/link";
import { ProductHeader } from "../../components/product-header";
import { findImports, importCategories, importedResources } from "../../../lib/import-catalog";
import { importReport as sourceReport } from "../../../lib/import-status";
import "./imports.css";

export const metadata: Metadata = { title: "Imported resources | Migbits", description: "Browse original open-source components, shaders, blocks, palettes and design guides with attributed source downloads." };
const pageSize = 36;
export default async function ImportedCatalog({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const param = (key: string) => typeof params[key] === "string" ? params[key].slice(0, 160) : "";
  const query = param("q"), source = param("source") || "all", category = param("category") || "all";
  const results = findImports(query, source, category);
  const pages = Math.max(1, Math.ceil(results.length / pageSize));
  const page = Math.min(pages, Math.max(1, Number.parseInt(param("page"), 10) || 1));
  const link = (next: number) => { const p = new URLSearchParams({ q: query, source, category, page: String(next) }); return `/open-source/imports?${p}`; };
  const sources = sourceReport.sources.filter(item => "imported" in item && Number(item.imported) > 0);
  return <div className="product-shell imported-shell"><ProductHeader /><main className="product-main imported-main">
    <div className="imported-intro"><span className="eyebrow">THE SOURCE COLLECTION</span><h1>More ways to<br /><em>make your mark.</em></h1><p>Original components, shader definitions, palettes and design references. Browse the source, keep the attribution, and make them your own.</p><div className="imported-stats"><strong>{importedResources.length.toLocaleString("en-US")}</strong><span>imported resources · {sources.length} collections</span></div></div>
    <p className="imported-note">Source files and licenses have been checked. Imported examples still need runtime and accessibility verification in their target environments. <Link href="#source-progress">View source progress ↓</Link></p>
    <form className="imported-filters" action="/open-source/imports"><label>Search<input name="q" type="search" defaultValue={query} placeholder="Try gradients, navigation, typography…" maxLength={160} /></label><label>Collection<select name="source" defaultValue={source}><option value="all">All collections</option>{sources.map(item => <option key={item.id} value={item.id}>{"repo" in item ? String(item.repo).split("/")[1] : item.id}</option>)}</select></label><label>Category<select name="category" defaultValue={category}><option value="all">All categories</option>{importCategories.map(value => <option key={value}>{value}</option>)}</select></label><button className="button primary" type="submit">Find resources</button><Link href="/open-source/imports">Reset</Link></form>
    <p role="status">{results.length.toLocaleString("en-US")} results · Page {page} of {pages}</p>
    <div className="imported-grid">{results.slice((page - 1) * pageSize, page * pageSize).map(item => <article className="imported-card" key={item.id}><div><span className="license-pill">{item.license}</span><span>{item.sourceName}</span></div><span className="eyebrow">{item.category}</span><h2><Link href={`/open-source/imports/${item.id}`}>{item.name}</Link></h2><p>{item.description}</p><small>{item.framework}</small><footer><span>{item.validation === "source-checked" ? "Source checked · runtime pending" : "Review needed"}</span><Link href={`/open-source/imports/${item.id}`}>View source ↗</Link></footer></article>)}</div>
    {!results.length && <div className="catalog-empty"><h2>No matching resources.</h2><p>Try a broader search or reset the filters.</p><Link href="/open-source/imports">Show all resources</Link></div>}
    <nav className="imported-pagination" aria-label="Resource pages">{page > 1 && <Link href={link(page - 1)} rel="prev">← Previous</Link>}<span>Page {page} of {pages}</span>{page < pages && <Link href={link(page + 1)} rel="next">Next →</Link>}</nav>
    <section id="source-progress" className="imported-progress"><span className="eyebrow">SOURCE BY SOURCE</span><h2>A collection with a clear trail.</h2><p>Counts apply to each pinned collection scope. Unknown totals remain unknown. A source check does not mean a working preview; the overall inventory is still in progress.</p><div className="imported-table-scroll"><table><caption>Import reconciliation · reviewed {sourceReport.reviewedAt}</caption><thead><tr><th scope="col">Requested source</th><th scope="col">Status</th><th scope="col">Discovered</th><th scope="col">Imported</th><th scope="col">Runtime validated</th><th scope="col">Reason / scope</th></tr></thead><tbody>{sourceReport.sources.map(item => <tr key={item.id}><th scope="row"><a href={item.website} target="_blank" rel="noreferrer">{item.requested} ↗</a></th><td>{item.status}</td><td>{item.discovered ?? "Unknown"}</td><td>{"imported" in item ? String(item.imported) : "0"}</td><td>0</td><td>{item.reason} <a href={item.evidence} target="_blank" rel="noreferrer">Evidence ↗</a></td></tr>)}</tbody></table></div></section>
  </main></div>;
}
