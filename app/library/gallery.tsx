/* eslint-disable @next/next/no-img-element */
/* eslint-disable @next/next/no-css-tags -- The generated public font-face manifest keeps font binaries separate from page bundles. React hoists this stylesheet using precedence. */
import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Search,
  Shapes,
  Grid2X2,
  Type,
  Palette,
  PenTool,
  PanelsTopLeft,
  Component,
  Layers,
} from "lucide-react";
import {
  categoryLabel,
  findLibraryResources,
  libraryResources,
  resourceCategories,
  type LibraryResource,
} from "../../lib/resource-library";
import "./gallery.css";
const icons = [
  Component,
  Layers,
  PanelsTopLeft,
  Type,
  Palette,
  PenTool,
  Shapes,
];
export const topics = [
  { id: "heroes", label: "Heroes", pattern: /hero/i },
  { id: "features", label: "Features", pattern: /feature/i },
  { id: "pricing", label: "Pricing", pattern: /pric/i },
  { id: "testimonials", label: "Testimonials", pattern: /testimonial/i },
  { id: "buttons", label: "Buttons", pattern: /button/i },
  { id: "cards", label: "Cards & grids", pattern: /card|grid|bento/i },
  {
    id: "navigation",
    label: "Navigation",
    pattern: /navigation|sidebar|breadcrumb|menu|pagination/i,
  },
  {
    id: "forms",
    label: "Forms & inputs",
    pattern: /form|input|field|select|checkbox|radio|switch|toggle|otp/i,
  },
  { id: "footers", label: "Footers", pattern: /footer/i },
  { id: "faq", label: "FAQs", pattern: /faq|accordion/i },
] as const;
export function GalleryHeader() {
  return (
    <>
      <link
        rel="stylesheet"
        href="/library/fonts.css"
        precedence="gallery-fonts"
      />
      <header className="mb-header">
        <Link href="/" className="mb-logo" aria-label="Migbits home">
          <span className="mb-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          migbits<span className="mb-beta">library</span>
        </Link>
        <nav aria-label="Library navigation">
          <Link href="/library">Explore</Link>
          <Link href="/library/templates">Templates</Link>
          <Link href="/library/figma">Figma kits</Link>
          <Link href="/playground">Playground</Link>
        </nav>
        <a
          className="mb-source-link"
          href="https://github.com/rakshithp1/migbits"
          target="_blank"
          rel="noreferrer"
        >
          Open source <ArrowUpRight size={13} />
        </a>
      </header>
    </>
  );
}
export function ResourceVisual({
  item,
  priority = false,
}: {
  item: LibraryResource;
  priority?: boolean;
}) {
  if (item.previewType === "font")
    return (
      <div
        className="mb-font-art"
        style={{ fontFamily: `"${item.family}",serif` }}
      >
        <span>{item.family}</span>
        <strong>
          Aa<span>g</span>
        </strong>
        <small>The quick brown fox jumps over the lazy dog.</small>
      </div>
    );
  if (item.previewType === "palette") {
    const colors = Object.entries(item.colors || {});
    const visible = [
      "Primary",
      "Secondary",
      "Accent",
      "Background",
      "Foreground",
    ]
      .map((k) => item.colors?.[k])
      .filter(Boolean);
    return (
      <div className="mb-palette-art">
        <div>
          {visible.map((color, i) => (
            <span key={i} style={{ background: color }} />
          ))}
        </div>
        <div
          className="mb-palette-sample"
          style={{
            background: item.colors?.Background,
            color: item.colors?.Foreground,
          }}
        >
          <span
            style={{
              background: item.colors?.Primary,
              color: item.colors?.["On Primary"],
            }}
          >
            Aa
          </span>
          <p>
            Color, considered.<small>{colors.length} semantic tokens</small>
          </p>
        </div>
      </div>
    );
  }
  return (
    <img
      src={item.image}
      alt={`${item.name} preview`}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      width={640}
      height={420}
    />
  );
}
export function ResourceCard({
  item,
  index = 99,
}: {
  item: LibraryResource;
  index?: number;
}) {
  return (
    <article className={`mb-card mb-card-${item.category}`}>
      <Link
        href={`/library/resource/${item.id}`}
        className="mb-card-preview"
        aria-label={`Explore ${item.name}`}
      >
        <ResourceVisual item={item} priority={index < 4} />
        <span className="mb-preview-open">
          Explore resource <ArrowUpRight size={13} />
        </span>
      </Link>
      <div className="mb-card-info">
        <Link href={`/library/resource/${item.id}`}>
          <h3>{item.name}</h3>
          <span className="mb-card-byline">
            <span className="mb-author-avatar">{item.author[0]}</span>
            {item.author === "Migbits"
              ? "Migbits originals"
              : item.previewType === "font"
                ? "Google Fonts"
                : item.author
                    .replace(" and contributors", "")
                    .replace(" contributors", "")}
          </span>
        </Link>
        <span
          className={`mb-license ${item.license === "OFL-1.1" ? "mb-license-font" : ""}`}
          title={
            item.license === "OFL-1.1"
              ? "Commercial use; no standalone font sales"
              : "Selling copies permitted with required notices"
          }
        >
          {item.license === "OFL-1.1" ? "OFL" : item.license}
        </span>
      </div>
      <div className="mb-card-foot">
        <span>{item.format}</span>
        <a
          href={item.downloadUrl}
          aria-label={`Download ${item.name}${item.previewType === "component" ? " complete source pack" : ""}`}
        >
          <ArrowDownToLine size={14} />
        </a>
      </div>
    </article>
  );
}
type SearchParams = Record<string, string | string[] | undefined>;
export async function ResourceGallery({
  category = "all",
  searchParams,
}: {
  category?: string;
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const get = (k: string) =>
    typeof params[k] === "string" ? (params[k] as string) : "";
  const query = get("q").slice(0, 200),
    topic = get("topic"),
    rights = get("rights"),
    sort = get("sort");
  const base = category === "all" ? "/library" : `/library/${category}`;
  const all = findLibraryResources({ category, query });
  const filtered = all.filter(
    (r) =>
      (rights !== "resale" || r.license === "MIT") &&
      (!topic ||
        !topics.some((t) => t.id === topic) ||
        topics
          .find((t) => t.id === topic)!
          .pattern.test([r.name, ...r.tags].join(" "))),
  );
  if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
  const pages = Math.max(1, Math.ceil(filtered.length / 24)),
    page = Math.min(pages, Math.max(1, Number.parseInt(get("page")) || 1)),
    shown = filtered.slice((page - 1) * 24, page * 24);
  function url(values: Record<string, string>) {
    const next = new URLSearchParams();
    for (const key of ["q", "topic", "rights", "sort"])
      if (get(key)) next.set(key, get(key));
    for (const [k, v] of Object.entries(values)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    return base + (next.size ? "?" + next : "");
  }
  return (
    <div className="mb-site">
      <GalleryHeader />
      <main className="mb-main">
        <section className="mb-intro">
          <p className="mb-eyebrow">THE MIGBITS RESOURCE LIBRARY</p>
          <h1>
            {category === "all"
              ? "Good design starts here."
              : categoryLabel(category)}
          </h1>
          <p>
            {resourceCategories.find((c) => c.id === category)?.description ||
              "Components, complete layouts and design essentials. Explore the details, make them your own, and build something worth sharing."}
          </p>
          <span className="mb-intro-note">
            <span />
            Free downloads. Clear licenses. Real source.
          </span>
        </section>
        <div className="mb-browser">
          <nav className="mb-category-tabs" aria-label="Resource categories">
            <Link
              href="/library"
              aria-current={category === "all" ? "page" : undefined}
            >
              <Grid2X2 size={14} />
              All<span>{libraryResources.length}</span>
            </Link>
            {resourceCategories.map((c, i) => {
              const Icon = icons[i];
              return (
                <Link
                  key={c.id}
                  href={`/library/${c.id}`}
                  aria-current={category === c.id ? "page" : undefined}
                >
                  <Icon size={14} />
                  {c.label}
                  <span>
                    {libraryResources.filter((r) => r.category === c.id).length}
                  </span>
                </Link>
              );
            })}
          </nav>
          <form className="mb-search-row" action={base}>
            <div className="mb-search">
              <Search size={16} />
              <input
                id="gallery-search"
                type="search"
                name="q"
                placeholder={`Search ${category === "all" ? "all resources" : categoryLabel(category).toLowerCase()}…`}
                defaultValue={query}
                aria-label="Search resources"
              />
              <button type="submit">Search</button>
            </div>
            {topic && <input type="hidden" name="topic" value={topic} />}
            <label className="mb-filter">
              <span>Usage</span>
              <select name="rights" defaultValue={rights}>
                <option value="">All licenses</option>
                <option value="resale">Sale of copies allowed</option>
              </select>
            </label>
            <label className="mb-filter">
              <span>Sort</span>
              <select name="sort" defaultValue={sort}>
                <option value="">Featured</option>
                <option value="name">Name A–Z</option>
              </select>
            </label>
            <button className="mb-filter-apply" type="submit">
              Apply filters
            </button>
          </form>
          {["all", "components", "blocks"].includes(category) && (
            <nav className="mb-topic-tabs" aria-label="Component types">
              <Link
                href={url({ topic: "", page: "" })}
                aria-current={!topic ? "page" : undefined}
              >
                All types<span>{all.length}</span>
              </Link>
              {topics.map((t) => {
                const count = all.filter((r) =>
                  t.pattern.test([r.name, ...r.tags].join(" ")),
                ).length;
                return count > 0 ? (
                  <Link
                    key={t.id}
                    href={url({ topic: t.id, page: "" })}
                    aria-current={topic === t.id ? "page" : undefined}
                  >
                    {t.label}
                    <span>{count}</span>
                  </Link>
                ) : null;
              })}
            </nav>
          )}
          <div className="mb-results-label">
            <h2>
              {query
                ? `Results for “${query}”`
                : topic
                  ? topics.find((t) => t.id === topic)?.label
                  : category === "all"
                    ? "Explore the collection"
                    : `All ${categoryLabel(category).toLowerCase()}`}
              <span>{filtered.length}</span>
            </h2>
            <Link href="/library/licenses">
              License & resale guide <ArrowUpRight size={12} />
            </Link>
          </div>
          {category === "figma" && (
            <p className="mb-inline-note">
              Original, MIT-licensed kits with editable SVG boards and native
              component-generator source. Setup instructions included; these are
              not .fig binaries.
            </p>
          )}
          {category === "typography" && (
            <p className="mb-inline-note">
              Commercial design use is allowed. OFL font files cannot be sold by
              themselves; keep their notices when bundling them with a product.
            </p>
          )}
          <div className="mb-grid">
            {shown.map((item, i) => (
              <ResourceCard key={item.id} item={item} index={i} />
            ))}
          </div>
          {shown.length === 0 && (
            <div className="mb-empty">
              <Search size={28} />
              <h2>No matching resources</h2>
              <p>Try another phrase, category or usage filter.</p>
              <Link href={base}>Clear filters →</Link>
            </div>
          )}
          <nav className="mb-pagination" aria-label="Gallery pages">
            {page > 1 ? (
              <Link href={url({ page: String(page - 1) })}>← Previous</Link>
            ) : (
              <span />
            )}
            <p>
              Page {page} of {pages}
            </p>
            {page < pages ? (
              <Link href={url({ page: String(page + 1) })}>Next →</Link>
            ) : (
              <span />
            )}
          </nav>
        </div>
        <section className="mb-collections">
          <div>
            <p className="mb-eyebrow">MORE TO MAKE YOUR OWN</p>
            <h2>Find your next starting point.</h2>
          </div>
          <div>
            {resourceCategories.map((c, i) => {
              const Icon = icons[i];
              return (
                <Link key={c.id} href={`/library/${c.id}`}>
                  <Icon size={19} />
                  <span>
                    {c.label}
                    <small>{c.description}</small>
                  </span>
                  <ArrowUpRight size={16} />
                </Link>
              );
            })}
          </div>
        </section>
      </main>
      <GalleryFooter />
    </div>
  );
}
export function GalleryFooter() {
  return (
    <footer className="mb-footer">
      <Link href="/" className="mb-logo">
        migbits<span className="mb-beta">library</span>
      </Link>
      <p>A considered collection. A better starting point.</p>
      <nav aria-label="Footer">
        <Link href="/library/licenses">Licenses & attribution</Link>
        <Link href="/open-source/icons">Icons</Link>
        <Link href="/open-source/imports">Source archive</Link>
        <a href="https://github.com/rakshithp1/migbits">GitHub ↗</a>
      </nav>
    </footer>
  );
}
