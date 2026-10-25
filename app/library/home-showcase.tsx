"use client";
/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import Link from "next/link";
import {
  Search,
  X,
  ArrowUpRight,
  Component,
  PanelsTopLeft,
  Palette,
  Type,
  PenTool,
  Shapes,
  Layers,
  House,
} from "lucide-react";
type Card = { id: string; name: string; image?: string; category: string };
const sections = [
  ["components", "Components", Component],
  ["blocks", "Blocks", Layers],
  ["templates", "Templates", PanelsTopLeft],
  ["typography", "Typography", Type],
  ["colors", "Color theory", Palette],
  ["illustrations", "Illustrations", PenTool],
  ["figma", "Figma kits", Shapes],
] as const;
export function HomeShowcase({ cards }: { cards: Card[] }) {
  const [open, setOpen] = useState(true);
  const trigger = useRef<HTMLButtonElement>(null);
  const featured = cards.find((c) => c.id === "template-atlas") || cards[0];
  function close() {
    setOpen(false);
    trigger.current?.focus();
  }
  return (
    <div
      className="mb-home-showcase"
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          e.preventDefault();
          close();
        }
      }}
    >
      <div className="mb-showcase-app">
        <aside className="mb-showcase-sidebar">
          <Link className="mb-logo" href="/library">
            migbits
          </Link>
          <Link className="mb-showcase-search" href="/library#gallery-search">
            <Search size={13} />
            Search resources <kbd>⌘K</kbd>
          </Link>
          <Link className="mb-showcase-home" href="/library">
            <House size={14} />
            Home
          </Link>
          <p>Explore</p>
          {sections.map(([id, label, Icon]) => (
            <Link key={id} href={"/library/" + id}>
              <Icon size={14} />
              {label}
            </Link>
          ))}
        </aside>
        <div className="mb-showcase-content">
          <div className="mb-showcase-heading">
            <span>Made to make your own.</span>
            <button ref={trigger} onClick={() => setOpen(true)}>
              Preview a resource <ArrowUpRight size={13} />
            </button>
          </div>
          <h3>A few good starting points</h3>
          <div className="mb-showcase-grid">
            {cards.map((c) => (
              <Link href={"/library/resource/" + c.id} key={c.id}>
                <div>
                  {c.image ? (
                    <img src={c.image} alt={c.name} loading="lazy" />
                  ) : (
                    <span>Aa</span>
                  )}
                </div>
                <p>{c.name}</p>
              </Link>
            ))}
          </div>
          <h3>Explore the details</h3>
          <p>
            Real source. Useful patterns. A little inspiration for whatever
            comes next.
          </p>
        </div>
      </div>
      {open && (
        <section
          className="mb-showcase-preview"
          aria-label="Featured template preview"
        >
          <div className="mb-showcase-preview-head">
            <span className="mb-author-avatar">M</span>
            <div>
              <strong>Atlas</strong>
              <small>Original Migbits template</small>
            </div>
            <Link href={"/library/resource/" + featured.id}>
              View resource <ArrowUpRight size={13} />
            </Link>
            <button aria-label="Close featured preview" onClick={close}>
              <X size={17} />
            </button>
          </div>
          <Link
            className="mb-showcase-preview-image"
            href={"/library/resource/" + featured.id}
          >
            <img src={featured.image} alt="Atlas SaaS landing page preview" />
          </Link>
        </section>
      )}
    </div>
  );
}
