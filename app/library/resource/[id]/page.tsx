import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Download } from "lucide-react";
import {
  libraryResources,
  categoryLabel,
} from "../../../../lib/resource-library";
import { GalleryHeader, GalleryFooter, ResourceCard } from "../../gallery";
import { ResourceStudio } from "../../resource-studio";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = libraryResources.find((r) => r.id === id);
  return { title: item ? item.name + " — Migbits" : "Resource not found" };
}
export default async function ResourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = libraryResources.find((r) => r.id === id);
  if (!item) notFound();
  return (
    <div className="mb-site">
      <GalleryHeader />
      <main className="mb-main mb-detail">
        <Link className="mb-back" href={`/library/${item.category}`}>
          ← {categoryLabel(item.category)}
        </Link>
        <div className="mb-detail-heading">
          <div>
            <p className="mb-eyebrow">
              {categoryLabel(item.category)} / {item.format}
            </p>
            <h1>{item.name}</h1>
            <p>{item.description}</p>
          </div>
          <a className="mb-button mb-button-primary" href={item.downloadUrl}>
            <Download size={15} />
            {item.previewType === "component"
              ? "Download complete source pack"
              : "Download resource"}
          </a>
        </div>
        <div className="mb-detail-layout">
          <ResourceStudio resource={item} />
          <aside className="mb-resource-aside">
            <div>
              <h2>Made by</h2>
              <p>{item.author}</p>
            </div>
            <div>
              <h2>License & usage</h2>
              <strong className="mb-license">{item.license}</strong>
              <p>
                {item.license === "OFL-1.1"
                  ? "Commercial design use. Font files cannot be sold by themselves; bundling requires the OFL notice."
                  : "Commercial use, modification and selling copies permitted. Preserve copyright and license notices."}
              </p>
              <Link href="/library/licenses">Read the usage guide ↗</Link>
            </div>
            <div>
              <h2>Good to know</h2>
              <p>
                {item.previewType === "figma"
                  ? "Editable SVG + component generator. Native Figma execution is not verified."
                  : item.previewType === "block"
                    ? "Sandbox render checked. Dependencies, keyboard behavior and production integration need review."
                    : item.previewType === "component"
                      ? "Live example. The download includes all shared source and separate dependency notices."
                      : item.previewType === "template"
                        ? "Standalone frontend. Forms, checkout and data are local demos; connect your production services."
                        : "Source and download files checked. Test contrast and accessibility in your final design."}
              </p>
            </div>
            <div>
              <h2>In the details</h2>
              <div className="mb-tags">
                {item.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
            {item.sourceUrl && (
              <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                Original source <ArrowUpRight size={12} />
              </a>
            )}
            {item.licenseUrl && (
              <a href={item.licenseUrl} target="_blank" rel="noreferrer">
                License evidence <ArrowUpRight size={12} />
              </a>
            )}
          </aside>
        </div>
        {libraryResources.some(
          (r) => r.category === item.category && r.id !== id,
        ) && (
          <section className="mb-related">
            <h2>A few more good starting points</h2>
            <div className="mb-grid">
              {libraryResources
                .filter((r) => r.category === item.category && r.id !== id)
                .slice(0, 4)
                .map((r) => (
                  <ResourceCard key={r.id} item={r} />
                ))}
            </div>
          </section>
        )}
      </main>
      <GalleryFooter />
    </div>
  );
}
