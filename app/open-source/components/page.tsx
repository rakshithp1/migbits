import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { ProductHeader } from "../../components/product-header";
import { ComponentGallery } from "./component-gallery";
import "./component-library.css";

export const metadata: Metadata = {
  title: "All shadcn components | Migbits",
  description:
    "Explore 65 open-source shadcn/ui components and 3 composition recipes. Search, try live previews, inspect the source, and download the complete MIT-attributed collection.",
};
export default function ComponentsPage() {
  return (
    <div className="product-shell kit-page">
      <ProductHeader />
      <main className="product-main kit-main">
        <Link className="back-link kit-back" href="/open-source">
          ← Open-source collection
        </Link>
        <header className="kit-intro">
          <div className="kit-intro-copy">
            <div className="kit-intro-kicker">
              <span /> THE SHADCN COLLECTION{" "}
              <span className="kit-kicker-rule" />
            </div>
            <h1>
              Every little detail.
              <br />
              <em>All in one place.</em>
              <span className="kit-hero-star" aria-hidden="true">
                ✳
              </span>
            </h1>
            <p>
              From the first button to the final interaction.
              <br />A complete, open-source toolkit. Ready for your next idea.
            </p>
            <div className="kit-hero-links">
              <a className="button primary" href="/api/open-source/components">
                Get the complete collection <ArrowDown size={14} />
              </a>
              <a href="https://ui.shadcn.com" target="_blank" rel="noreferrer">
                Built on shadcn/ui <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
          <div className="kit-intro-aside">
            <div className="kit-count-card">
              <div>
                <span>THE COMPLETE COLLECTION</span>
                <span aria-hidden="true">↗</span>
              </div>
              <strong>
                65<span>+ 03</span>
              </strong>
              <p>
                components <span>composition recipes</span>
              </p>
              <div className="kit-count-line" />
              <small>Open source. Properly attributed. Yours to shape.</small>
            </div>
            <div className="kit-mini-stack">
              <span>React + TypeScript</span>
              <span>Tailwind v4</span>
              <span>MIT</span>
            </div>
          </div>
        </header>
        <ComponentGallery />
        <section className="kit-closing">
          <div>
            <span className="kit-small-label">
              A SOLID FOUNDATION. A LITTLE PERSONALITY.
            </span>
            <h2>
              Keep the good parts.
              <br />
              <em>Make the rest your own.</em>
            </h2>
          </div>
          <div>
            <p>
              The complete pack includes all 65 component modules, every preview
              example, three composition recipes, theme tokens, dependency
              versions, and original MIT notices. Preserve its folder structure
              and import the included stylesheet in a Tailwind v4 project.
            </p>
            <a href="/api/open-source/components">
              Take it from here <ArrowDown size={14} />
            </a>
          </div>
        </section>
      </main>
      <footer className="product-footer">
        Migbits / Small pieces. Proper credit.
        <Link href="/open-source">
          Explore the open-source directory <ArrowUpRight size={12} />
        </Link>
      </footer>
    </div>
  );
}
