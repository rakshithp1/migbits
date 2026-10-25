/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Code2,
  Download,
  Eye,
  Check,
} from "lucide-react";
import { GalleryHeader, GalleryFooter, ResourceCard } from "./gallery";
import { HomeShowcase } from "./home-showcase";
import {
  findLibraryResources,
  libraryResources,
  resourceCategories,
} from "../../lib/resource-library";
import "./reference-layout.css";
export function LibraryHome() {
  const featured = findLibraryResources()
    .filter((r) => r.image)
    .slice(0, 8);
  return (
    <div className="mb-site mb-home">
      <GalleryHeader />
      <section className="mb-home-hero">
        <div className="mb-flow-background" aria-hidden="true">
          <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
            <defs>
              <filter id="mb-flow-blur">
                <feGaussianBlur stdDeviation="29" />
              </filter>
              <linearGradient id="mb-flow-blue">
                <stop stopColor="#001CFF" />
                <stop offset=".5" stopColor="#334DB3" />
                <stop offset="1" stopColor="#001057" />
              </linearGradient>
            </defs>
            <g fill="none" filter="url(#mb-flow-blur)">
              <path
                d="M-160 230C60-70 350 95 590 90S1000 345 1600 290"
                stroke="url(#mb-flow-blue)"
                strokeWidth="94"
              />
              <path
                d="M-100 140C100 410 330 445 610 730S1230 710 1510 1000"
                stroke="#051679"
                strokeWidth="160"
              />
              <path
                d="M430-140C410 90 750 130 920 300S1170 380 1510 530"
                stroke="#18245C"
                strokeWidth="110"
              />
            </g>
          </svg>
        </div>
        <div className="mb-home-hero-copy">
          <h1>
            Copy the details.
            <br />
            Make them yours.
          </h1>
          <p>
            Discover components, templates, and design resources for your next
            good idea.
          </p>
          <div className="mb-home-hero-actions">
            <Link className="mb-blue-button" href="/library">
              Explore the library <ArrowRight size={15} />
            </Link>
            <Link className="mb-dark-button" href="/library/components">
              Browse components
            </Link>
          </div>
        </div>
        <div className="mb-home-frame">
          <HomeShowcase
            cards={featured.map(({ id, name, image, category }) => ({
              id,
              name,
              image,
              category,
            }))}
          />
        </div>
      </section>
      <main className="mb-main mb-home-main">
        <section className="mb-home-section">
          <div className="mb-home-section-heading">
            <div>
              <h2>
                A little inspiration.
                <br />A real starting point.
              </h2>
              <p>
                Explore {libraryResources.length} free resources, with live
                previews and their source.
              </p>
            </div>
            <Link href="/library">
              View the library <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="mb-grid">
            {findLibraryResources()
              .slice(0, 8)
              .map((r) => (
                <ResourceCard key={r.id} item={r} />
              ))}
          </div>
        </section>
        <section className="mb-home-section mb-home-categories">
          <div className="mb-home-section-heading">
            <div>
              <h2>More than components.</h2>
              <p>Everything around the interface, thoughtfully organized.</p>
            </div>
            <Link href="/library">
              Explore all resources <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="mb-home-category-grid">
            {resourceCategories.map((c) => {
              const example =
                libraryResources.find((r) => r.category === c.id && r.image) ||
                libraryResources.find((r) => r.category === c.id);
              return (
                <Link key={c.id} href={"/library/" + c.id}>
                  <div
                    className={"mb-category-cover mb-category-cover-" + c.id}
                  >
                    {example?.image ? (
                      <img src={example.image} alt="" loading="lazy" />
                    ) : c.id === "typography" ? (
                      <span>Aa Bb Cc</span>
                    ) : (
                      <div className="mb-category-color-bars">
                        {[
                          "#90B4F7",
                          "#526CDD",
                          "#34418B",
                          "#A9BAFF",
                          "#E7EDFF",
                        ].map((color) => (
                          <i key={color} style={{ background: color }} />
                        ))}
                      </div>
                    )}
                  </div>
                  <h3>
                    {c.label}
                    <span>
                      {
                        libraryResources.filter((r) => r.category === c.id)
                          .length
                      }
                    </span>
                    <ArrowUpRight size={16} />
                  </h3>
                  <p>{c.description}</p>
                </Link>
              );
            })}
          </div>
        </section>
        <section className="mb-home-section">
          <div className="mb-home-section-heading">
            <div>
              <h2>Built for how you build.</h2>
              <p>
                Look closer. Open the source. Bring the details into your own
                project.
              </p>
            </div>
          </div>
          <div className="mb-home-workflow">
            <article>
              <div>
                <Eye size={22} />
                <span>01 / EXPLORE</span>
                <div className="mb-workflow-mini">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <h3>See the real thing</h3>
              <p>
                Open interactive examples and switch between desktop and mobile
                previews.
              </p>
            </article>
            <article>
              <div>
                <Code2 size={22} />
                <span>02 / MAKE IT YOURS</span>
                <pre>
                  <code>
                    {
                      "export function YourNextIdea() {\n  return (\n    <SomethingThoughtful />\n  )\n}"
                    }
                  </code>
                </pre>
              </div>
              <h3>Source you can work with</h3>
              <p>
                Copy real code, inspect the dependencies, and follow the setup
                instructions.
              </p>
            </article>
            <article>
              <div>
                <Download size={22} />
                <span>03 / BUILD</span>
                <ul>
                  <li>
                    <Check size={12} />
                    Original source
                  </li>
                  <li>
                    <Check size={12} />
                    Usage instructions
                  </li>
                  <li>
                    <Check size={12} />
                    License notices
                  </li>
                </ul>
              </div>
              <h3>Keep the useful details</h3>
              <p>
                Downloads preserve their notices. Each page explains commercial
                use and redistribution.
              </p>
            </article>
          </div>
        </section>
        <section className="mb-home-questions">
          <h2>A few things to know.</h2>
          {[
            [
              "What can I find here?",
              "Components, blocks, complete frontend templates, typography, color palettes, original illustrations, and original Figma resource kits.",
            ],
            [
              "Can I use the resources commercially?",
              "MIT resources allow commercial use and selling copies when copyright and license notices are preserved. OFL fonts have separate conditions and cannot be sold by themselves. Each resource links to its terms.",
            ],
            [
              "What is included in the Figma kits?",
              "Editable SVG boards, design tokens and original component-generator source. They are not .fig binaries. The README explains import and setup; native generator execution is not yet verified.",
            ],
            [
              "Are the templates connected to a backend?",
              "Templates are standalone frontend starting points. Forms, store carts and checkout are demonstrations. Connect your own production services before launching.",
            ],
          ].map(([title, body]) => (
            <details key={title}>
              <summary>
                {title}
                <span>+</span>
              </summary>
              <p>{body}</p>
            </details>
          ))}
        </section>
        <section className="mb-home-final">
          <h2>
            Your next good idea
            <br />
            starts with a detail.
          </h2>
          <Link className="mb-blue-button" href="/library">
            Explore Migbits <ArrowRight size={15} />
          </Link>
        </section>
      </main>
      <GalleryFooter />
    </div>
  );
}
