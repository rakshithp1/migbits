import { GalleryHeader, GalleryFooter } from "../gallery";
import { SectionNavigation } from "../section-navigation";
import { BackgroundDemos } from "../background-demos";
import { MotionPlayground } from "../../open-source/motion/motion-playground";
import originalLicense from "../../../catalog/library/original-license.json";
import "../tools.css";
export const metadata = {
  title: "Motion & backgrounds — Migbits",
  description:
    "Try two original decorative backgrounds and six Motion Primitives examples. Preview, customize, inspect source and download attributed code.",
};
export default function MotionPage() {
  const license = originalLicense.text;
  return (
    <div className="mb-site">
      <GalleryHeader />
      <main className="mb-main mb-tools mb-motion-page">
        <section className="mb-intro">
          <p className="mb-eyebrow">LIVE DEMOS / REUSABLE SOURCE</p>
          <h1>Motion & backgrounds</h1>
          <p>
            Actual examples, right here. Try two decorative backgrounds, then
            explore six animation primitives with pause controls and attributed
            source.
          </p>
        </section>
        <SectionNavigation active="motion" />
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
