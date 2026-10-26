import { GalleryHeader, GalleryFooter, ResourceCard } from "../gallery";
import { findLibraryResources } from "../../../lib/resource-library";
import { SectionNavigation } from "../section-navigation";
import { BackgroundDemos } from "../background-demos";
import { MotionPlayground } from "../../open-source/motion/motion-playground";
import originalLicense from "../../../catalog/library/original-license.json";
import "../tools.css";
export const metadata = {
  title: "Motion & backgrounds — Migbits",
  description:
    "Explore official Motion example collections, six animation primitives and original decorative backgrounds. Isolated previews, source variants and attributed downloads.",
};
export default function MotionPage() {
  const license = originalLicense.text;
  const collections = findLibraryResources().filter(item => item.previewType === "motion-example");
  const examples = collections.reduce((count, item) => count + (item.variants?.length || 1), 0);
  return (
    <div className="mb-site">
      <GalleryHeader />
      <main className="mb-main mb-tools mb-motion-page">
        <section className="mb-intro">
          <p className="mb-eyebrow">LIVE DEMOS / REUSABLE SOURCE</p>
          <h1>Motion & backgrounds</h1>
          <p>
            Try two decorative backgrounds, six animation primitives and {examples} official Motion examples in {collections.length} collections. Explore variants, pause the previews and download attributed source.
          </p>
        </section>
        <SectionNavigation active="motion" />
        <section className="mb-tool-section" aria-labelledby="motion-collections-title">
          <h2 id="motion-collections-title">Motion collections</h2>
          <p>Presence, layout, drag, gestures, SVG and more. Each collection keeps related examples together, with selectable previews and source variants.</p>
          <div className="mb-grid mb-motion-collection-grid">
            {collections.map((item, index) => <ResourceCard key={item.id} item={item} index={index} />)}
          </div>
        </section>
        <section className="mb-tool-section">
          <h2>Decorative backgrounds</h2>
          <p>
            Original CSS backgrounds. Change the accent, pause the animation,
            and download the complete HTML with its MIT notice.
          </p>
          <BackgroundDemos license={license} />
        </section>
        <section className="mb-tool-section">
          <div className="mb-tool-section-heading">
            <div>
              <h2>Animation components</h2>
              <p>
                Text loop, animated selection, transition panel, border trail,
                magnetic interaction and staggered groups.
              </p>
            </div>
            <a className="mb-blue-button" href="/api/open-source/motion">
              Download 6 components ↓
            </a>
          </div>
          <MotionPlayground />
        </section>
      </main>
      <GalleryFooter />
    </div>
  );
}
