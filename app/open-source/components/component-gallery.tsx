"use client";

import {
  Component,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  ArrowDown,
  ArrowRight,
  Check,
  Code2,
  Copy,
  ExternalLink,
  Moon,
  RotateCcw,
  Search,
  Sun,
  X,
} from "lucide-react";
import { shadcnCatalog, shadcnCategories } from "../../../catalog/shadcn";
import { componentPreviews } from "./preview-map";

type Pack = { files: { path: string; content: string }[] };
function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}
function selectedSnapshot() {
  const id = window.location.hash.slice(1);
  return shadcnCatalog.some((item) => item.id === id) ? id : "button";
}
const categoryNotes: Record<string, string> = {
  Foundations: "The pieces every interface starts with.",
  "Forms & inputs": "A little structure for every kind of answer.",
  Overlays: "The next detail, without losing your place.",
  Navigation: "A clear way through the bigger picture.",
  "Data & layout": "Make space for information that matters.",
  Communication: "Give every conversation its own rhythm.",
};

class PreviewBoundary extends Component<
  { children: ReactNode; onReset: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="kit-preview-error">
        <strong>This preview couldn’t load.</strong>
        <p>Try again, or inspect its complete source.</p>
        <button onClick={this.props.onReset}>Reload preview</button>
      </div>
    ) : (
      this.props.children
    );
  }
}

export function ComponentGallery() {
  const selectedId = useSyncExternalStore(
    subscribe,
    selectedSnapshot,
    () => "button",
  );
  const selected = shadcnCatalog.find((item) => item.id === selectedId)!;
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("All components"),
    [appearance, setAppearance] = useState("dark"),
    [tab, setTab] = useState("preview"),
    [sourceKind, setSourceKind] = useState("component"),
    [source, setSource] = useState<{ path: string; content: string } | null>(
      null,
    ),
    [sourceError, setSourceError] = useState(""),
    [notice, setNotice] = useState(""),
    [reset, setReset] = useState(0);
  const search = useRef<HTMLInputElement>(null),
    pack = useRef<Promise<Pack> | null>(null);
  const Preview = componentPreviews[selected.id];
  const normalized = query.trim().toLowerCase();
  const filtered = shadcnCatalog.filter(
    (item) =>
      (category === "All components" || item.category === category) &&
      (!normalized ||
        `${item.title} ${item.category} ${item.description} ${item.id}`
          .toLowerCase()
          .includes(normalized)),
  );

  useEffect(() => {
    document.body.dataset.componentTheme = appearance;
    return () => {
      delete document.body.dataset.componentTheme;
    };
  }, [appearance]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        event.key === "/" &&
        !(
          event.target instanceof HTMLElement &&
          event.target.closest("input,textarea,[contenteditable=true]")
        )
      ) {
        event.preventDefault();
        search.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  async function getSource(path: string) {
    if (!pack.current)
      pack.current = fetch("/api/open-source/components?format=json")
        .then((response) => {
          if (!response.ok)
            throw Error("The source pack couldn’t load. Please try again.");
          return response.json() as Promise<Pack>;
        })
        .catch((error) => {
          pack.current = null;
          throw error;
        });
    const result = (await pack.current).files.find(
      (file) => file.path === path,
    );
    if (!result)
      throw Error(
        "This source file is unavailable. Download the complete pack or try again.",
      );
    return result;
  }
  const sourcePath =
    sourceKind === "example" ? selected.examplePath : selected.sourcePath;
  useEffect(() => {
    if (tab !== "code") return;
    let active = true;
    getSource(sourcePath)
      .then((file) => {
        if (active) {
          setSource(file);
          setSourceError("");
        }
      })
      .catch((error) => {
        if (active)
          setSourceError(
            error instanceof Error
              ? error.message
              : "Couldn’t load the source.",
          );
      });
    return () => {
      active = false;
    };
  }, [sourcePath, tab]);
  function choose(id: string) {
    window.location.hash = id;
    setNotice("");
  }
  async function copySource() {
    try {
      const file = await getSource(sourcePath);
      await navigator.clipboard.writeText(file.content);
      setNotice("Source copied. Keep its MIT notice with your copy.");
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Copy unavailable. Open Code and select the source text.",
      );
    }
  }
  async function copyInstall() {
    try {
      await navigator.clipboard.writeText(selected.install);
      setNotice("Install command copied.");
    } catch {
      setNotice(selected.install);
    }
  }
  const currentIndex = shadcnCatalog.findIndex(
    (item) => item.id === selected.id,
  );

  return (
    <section className="kit-library" aria-label="shadcn component library">
      <div className="kit-discovery-bar">
        <div className="kit-search">
          <Search size={17} />
          <input
            ref={search}
            aria-label="Search all components"
            placeholder="Find the right little detail…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear component search"
            >
              <X size={15} />
            </button>
          ) : (
            <kbd>/</kbd>
          )}
        </div>
        <label className="kit-category-select">
          <span>Collection</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option>All components</option>
            {shadcnCategories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <span className="kit-search-count" role="status">
          {filtered.length} / {shadcnCatalog.length} pieces
        </span>
      </div>
      <label className="kit-mobile-picker">
        <span className="sr-only">Choose a component</span>
        <select
          aria-label="Choose a component"
          value={selected.id}
          onChange={(event) => choose(event.target.value)}
        >
          {!filtered.some((item) => item.id === selected.id) && (
            <option value={selected.id}>{selected.title} (current)</option>
          )}
          {shadcnCategories.map((group) => (
            <optgroup label={group} key={group}>
              {filtered
                .filter((item) => item.category === group)
                .map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.title}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </label>
      <div className="kit-workspace">
        <aside className="kit-sidebar" aria-label="Component navigation">
          <div className="kit-sidebar-top">
            <span>THE COLLECTION</span>
            <button
              className={category === "All components" ? "active" : ""}
              onClick={() => setCategory("All components")}
            >
              All pieces <span>68</span>
            </button>
          </div>
          <nav aria-label="Component list">
            {shadcnCategories.map((group) => {
              const items = filtered.filter((item) => item.category === group);
              return items.length > 0 ? (
                <div className="kit-nav-group" key={group}>
                  <h2>
                    {group}
                    <span>{items.length}</span>
                  </h2>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => choose(item.id)}
                      aria-current={
                        item.id === selected.id ? "true" : undefined
                      }
                      className={item.id === selected.id ? "is-selected" : ""}
                    >
                      <span>{item.title}</span>
                      {item.kind === "pattern" ? (
                        <small>recipe</small>
                      ) : item.id === selected.id ? (
                        <ArrowRight size={13} />
                      ) : null}
                    </button>
                  ))}
                </div>
              ) : null;
            })}
            {filtered.length === 0 && (
              <div className="kit-empty-search">
                <Search size={24} />
                <strong>No matching pieces.</strong>
                <p>Try “menu”, “form”, or “layout”.</p>
                <button
                  onClick={() => {
                    setQuery("");
                    setCategory("All components");
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </nav>
          <div className="kit-sidebar-bottom">
            <span aria-hidden="true">✳</span>
            <p>
              Good things are
              <br />
              made of small things.
            </p>
            <a href="/api/open-source/components">
              Take the complete collection <ArrowDown size={12} />
            </a>
          </div>
        </aside>
        <div className="kit-detail">
          <div className="kit-detail-eyebrow">
            <span>{selected.category}</span>
            <span>{String(currentIndex + 1).padStart(2, "0")} / 68</span>
          </div>
          <div className="kit-detail-heading">
            <div>
              <h2>
                {selected.title}
                <span className="kit-detail-dot" />
              </h2>
              <p>{selected.description}</p>
            </div>
            <a
              href={selected.docs}
              target="_blank"
              rel="noreferrer"
              className="kit-doc-link"
            >
              Documentation <ExternalLink size={13} />
            </a>
          </div>
          <div className="kit-stage">
            <div className="kit-stage-toolbar">
              <div
                className="kit-stage-tabs"
                role="tablist"
                aria-label="Component view"
                onKeyDown={(event) => {
                  if (
                    !["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                      event.key,
                    )
                  )
                    return;
                  event.preventDefault();
                  const next =
                    event.key === "Home"
                      ? "preview"
                      : event.key === "End"
                        ? "code"
                        : tab === "preview"
                          ? "code"
                          : "preview";
                  setTab(next);
                  document.getElementById(`kit-${next}-tab`)?.focus();
                }}
              >
                <button
                  id="kit-preview-tab"
                  role="tab"
                  aria-selected={tab === "preview"}
                  tabIndex={tab === "preview" ? 0 : -1}
                  aria-controls="kit-preview-panel"
                  onClick={() => setTab("preview")}
                >
                  <span className="kit-live-dot" />
                  Preview
                </button>
                <button
                  id="kit-code-tab"
                  role="tab"
                  aria-selected={tab === "code"}
                  tabIndex={tab === "code" ? 0 : -1}
                  aria-controls="kit-code-panel"
                  onClick={() => setTab("code")}
                >
                  <Code2 size={14} />
                  Code
                </button>
              </div>
              <div className="kit-stage-controls">
                {tab === "preview" ? (
                  <>
                    <button
                      onClick={() => setReset((value) => value + 1)}
                      aria-label="Reset component preview"
                      title="Reset preview"
                    >
                      <RotateCcw size={14} />
                    </button>
                    <span className="kit-control-divider" />
                    <div role="group" aria-label="Preview appearance">
                      <button
                        aria-label="Dark preview"
                        aria-pressed={appearance === "dark"}
                        onClick={() => setAppearance("dark")}
                      >
                        <Moon size={14} />
                      </button>
                      <button
                        aria-label="Light preview"
                        aria-pressed={appearance === "light"}
                        onClick={() => setAppearance("light")}
                      >
                        <Sun size={15} />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <select
                      aria-label="Source file"
                      value={sourceKind}
                      onChange={(event) => setSourceKind(event.target.value)}
                    >
                      <option value="component">Component</option>
                      <option value="example">Example</option>
                    </select>
                    <button
                      onClick={copySource}
                      aria-label="Copy displayed source"
                    >
                      <Copy size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
            {tab === "preview" ? (
              <div
                id="kit-preview-panel"
                role="tabpanel"
                aria-labelledby="kit-preview-tab"
                onSubmit={(event) => event.preventDefault()}
                className={`kit-preview-canvas oss-kit ${appearance === "dark" ? "dark" : ""}`}
                data-appearance={appearance}
              >
                <div className={`kit-preview-inner kit-preview-${selected.id}`}>
                  <PreviewBoundary
                    key={`${selected.id}-${appearance}-${reset}`}
                    onReset={() => setReset((value) => value + 1)}
                  >
                    <Preview />
                  </PreviewBoundary>
                </div>
                <div className="kit-canvas-signature">
                  <span>MADE TO BE INTERACTIVE</span>
                  <span>m /</span>
                </div>
              </div>
            ) : (
              <div
                className="kit-code-panel"
                id="kit-code-panel"
                role="tabpanel"
                aria-labelledby="kit-code-tab"
              >
                <div className="kit-code-path">
                  <span>{sourcePath}</span>
                  <span>TYPESCRIPT / REACT</span>
                </div>
                {sourceError ? (
                  <div className="kit-preview-error" role="alert">
                    {sourceError}
                    <button
                      onClick={() => {
                        setTab("preview");
                        setSourceError("");
                      }}
                    >
                      Return to preview
                    </button>
                  </div>
                ) : source?.path === sourcePath ? (
                  <pre tabIndex={0}>
                    <code>{source.content}</code>
                  </pre>
                ) : (
                  <div className="kit-preview-loading" role="status">
                    <span />
                    Loading complete source…
                  </div>
                )}
              </div>
            )}
            <div className="kit-stage-footer">
              <span>
                <Check size={12} />{" "}
                {selected.kind === "pattern"
                  ? "Composition recipe"
                  : "Upstream shadcn/ui"}{" "}
                · MIT
              </span>
              <button onClick={copySource}>
                <Copy size={12} /> Copy source
              </button>
            </div>
          </div>
          <div className="kit-below-stage">
            <div className="kit-install-box">
              <span className="kit-small-label">START WITH THE SOURCE</span>
              <button
                className="kit-install-command"
                onClick={copyInstall}
                title="Copy install command"
              >
                <code>
                  <span>$</span> {selected.install}
                </code>
                <Copy size={14} />
              </button>
              <p>
                The ZIP includes this component, its example, dependencies,
                helpers, and original license notices.
              </p>
              <a href="/api/open-source/components">
                Download the complete pack <ArrowDown size={13} />
              </a>
            </div>
            <div className="kit-detail-note">
              <span className="kit-small-label">A THOUGHTFUL DEFAULT</span>
              <span className="kit-note-mark" aria-hidden="true">
                ↳
              </span>
              <p>{categoryNotes[selected.category]}</p>
              <span>Style it. Compose it. Make it yours.</span>
            </div>
          </div>
          <div className="kit-related">
            <span>KEEP EXPLORING</span>
            {[1, 2, 3].map((offset) => {
              const item =
                shadcnCatalog[(currentIndex + offset) % shadcnCatalog.length];
              return (
                <button key={item.id} onClick={() => choose(item.id)}>
                  {item.title}
                  <ArrowRight size={13} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <p className="kit-notice" aria-live="polite" role="status">
        {notice ||
          "Working local previews. Example forms and chat elements do not send data or connect to an account backend."}
      </p>
    </section>
  );
}
