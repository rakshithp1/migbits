import { GalleryHeader, GalleryFooter, ResourceCard } from "../gallery";
import { libraryResources } from "../../../lib/resource-library";
import { SectionNavigation } from "../section-navigation";
import { IconExplorer } from "../../open-source/icons/icon-explorer";
import pack from "../../../catalog/community/component-pack.json";
import "../tools.css";
export const metadata = {
  title: "Icons — Migbits",
  description:
    "Search 36 Lucide icons, customize size, stroke and color, and copy or download SVGs with their original license notices.",
};
export default function IconsPage() {
  const notice = pack.files.find(
    (file) => file.path === "licenses/lucide-react.txt",
  )?.content;
  if (!notice) throw Error("Lucide license notice missing");
  return (
    <div className="mb-site">
      <GalleryHeader />
      <main className="mb-main mb-tools mb-icon-page">
        <section className="mb-intro">
          <p className="mb-eyebrow">36 LUCIDE ICONS / CUSTOMIZABLE SVG</p>
          <h1>Icons</h1>
          <p>
            A clear symbol for the small details. Search the collection,
            customize its weight and color, then take an attributed SVG into
            your project.
          </p>
        </section>
        <SectionNavigation active="icons" />
        {libraryResources.some(r => r.category === "icons") && <section aria-label="SVG icon collections" className="mb-grid">{libraryResources.filter(r => r.category === "icons").map(item => <ResourceCard key={item.id} item={item} />)}</section>}
        <IconExplorer
          licenseNotice={notice}
          version={pack.dependencies["lucide-react"]}
        />
      </main>
      <GalleryFooter />
    </div>
  );
}
