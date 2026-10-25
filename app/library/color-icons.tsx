"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import collection from "../../resources/visual/fluent-color/review.json";

export function ColorIcons() {
  const [query, setQuery] = useState("");
  const [effect, setEffect] = useState("bob");
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState("");
  const [fallback, setFallback] = useState("");
  const items = collection.items.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <section className="mb-color-icons" aria-label="Color and animated icons">
      <div className="mb-studio-controls">
        <label>
          Search color icons
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            maxLength={80}
            placeholder="Mail, calendar, heart…"
          />
        </label>
        <label>
          Motion preset
          <select value={effect} onChange={(e) => setEffect(e.target.value)}>
            <option value="none">Still</option>
            <option value="bob">Float</option>
            <option value="tilt">Tilt</option>
            <option value="pulse">Pulse</option>
            <option value="turn">Turn</option>
            <option value="pop">Pop</option>
            <option value="swing">Swing</option>
          </select>
        </label>
        <button
          className="mb-button"
          aria-pressed={playing}
          onClick={() => setPlaying(!playing)}
        >
          {playing ? "Pause icon motion" : "Play icon motion"}
        </button>
      </div>
      <p className="mb-preview-note">
        16 Microsoft Fluent color SVGs · original MigBits CSS motion · hover or
        focus to animate · static when reduced motion is enabled. Copied SVGs
        include license and notice metadata.
      </p>
      <div
        className="mb-color-icon-grid"
        data-playing={playing}
        data-effect={effect}
      >
        {items.map((item) => (
          <button
            className="mb-color-icon"
            key={item.id}
            aria-label={`Copy ${item.name} SVG`}
            onClick={async () => {
              try {
                const response = await fetch(
                  `/library/icons/fluent/${item.id}.svg`,
                );
                if (!response.ok) throw Error("Source unavailable");
                const svg = await response.text();
                try {
                  await navigator.clipboard.writeText(svg);
                  setMessage(`${item.name} SVG copied with notices`);
                  setFallback("");
                } catch {
                  setFallback(svg);
                  setMessage("Select and copy the SVG below");
                }
              } catch {
                setMessage(
                  "Source could not load. Download the complete source pack instead.",
                );
              }
            }}
          >
            <img
              className="migbits-color-glyph"
              src={`/library/icons/fluent/${item.id}.svg`}
              alt=""
              width={64}
              height={64}
              loading="lazy"
            />
            <span>{item.name}</span>
            <small>Copy SVG</small>
          </button>
        ))}
      </div>
      {!items.length && <p>No icons match. Try “mail” or clear your search.</p>}
      <p role="status" aria-live="polite">
        {message}
      </p>
      {fallback && (
        <textarea
          className="mb-svg-copy-fallback"
          aria-label="SVG source to copy"
          value={fallback}
          readOnly
          rows={8}
        />
      )}
      <a
        className="mb-button"
        href="/library/downloads/fluent-color-motion.zip"
      >
        Download icons, motion CSS and notices
      </a>
    </section>
  );
}
