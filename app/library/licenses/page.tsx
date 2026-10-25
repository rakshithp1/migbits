import Link from "next/link";
import { GalleryHeader, GalleryFooter } from "../gallery";
export const metadata = { title: "Licenses & resale — Migbits" };
export default function Licenses() {
  return (
    <div className="mb-site">
      <GalleryHeader />
      <main className="mb-main mb-license-page">
        <Link href="/library">← Back to the library</Link>
        <p className="mb-eyebrow">USE IT WITH CONFIDENCE</p>
        <h1>Clear source. Clear terms.</h1>
        <p>
          Every resource has its own license. Free access and commercial use do
          not always mean permission to sell the original files.
        </p>
        <section>
          <h2>MIT: commercial use and selling copies</h2>
          <p>
            Resources labeled MIT permit use, modification, redistribution and
            selling copies. Keep the original copyright and permission notice
            with copies or substantial portions. Our original templates, SVG
            illustrations and Figma generator kits include their MIT notice in
            every ZIP.
          </p>
          <a
            href="https://opensource.org/license/mit"
            target="_blank"
            rel="noreferrer"
          >
            Read the MIT license ↗
          </a>
        </section>
        <section>
          <h2>OFL fonts: commercial use, with a bundling condition</h2>
          <p>
            Fonts can be used in commercial designs and bundled with software.
            The font files cannot be sold by themselves. Keep each family&apos;s
            copyright and OFL notice; modified fonts must comply with reserved
            font names and remain under OFL. These fonts are excluded by the
            “Sale of copies allowed” filter.
          </p>
          <a
            href="https://openfontlicense.org/open-font-license-official-text/"
            target="_blank"
            rel="noreferrer"
          >
            Read the SIL Open Font License ↗
          </a>
        </section>
        <section>
          <h2>Original code and dependencies</h2>
          <p>
            Original upstream files stay distinguishable from Migbits preview
            adaptations. The component download is the complete attributed
            source pack with shared utilities and separate dependency notices.
            Framework and dependency requirements remain in the source viewer
            and README. Preserve those notices too when redistributing a
            complete product.
          </p>
        </section>
        <section>
          <h2>Figma resources</h2>
          <p>
            Our kits are original editable SVG boards, tokens and native
            component-generator source. They are not rehosted third-party
            Community files or .fig exports. Generator source is checked;
            execution inside a Figma account is not yet verified. The README
            explains quick SVG import and how to run the development plugin.
          </p>
        </section>
        <section>
          <h2>Attribution records</h2>
          <p>
            Each detail page links to its author and original source when
            applicable. Upstream revisions, exact notices and dependency records
            are preserved in the downloads and source archive.
          </p>
          <Link href="/open-source/imports">Browse upstream provenance →</Link>{" "}
          ·{" "}
          <a href="https://github.com/rakshithp1/migbits/blob/main/THIRD_PARTY_NOTICES.md">
            Project notices ↗
          </a>
        </section>
      </main>
      <GalleryFooter />
    </div>
  );
}
