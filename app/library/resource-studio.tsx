"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  Monitor,
  Smartphone,
  Code2,
  Eye,
  Download,
} from "lucide-react";
import type { LibraryResource } from "../../lib/resource-library";
import { contrastRatio } from "../../lib/color-theory";
type Payload = {
  files: { path: string; content: string }[];
  installation?: string[];
  record?: Record<string, string>;
  resource?: { dependencies?: string[]; revision?: string };
};
function CopyButton({
  text,
  label = "Copy",
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [status, setStatus] = useState("");
  return (
    <button
      className={`mb-button ${className}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setStatus("Copied");
          setTimeout(() => setStatus(""), 1800);
        } catch {
          setStatus("Select and copy the text below");
        }
      }}
    >
      <span aria-live="polite">{status || label}</span>
      {status === "Copied" ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}
function FontStudio({ item }: { item: LibraryResource }) {
  const [text, setText] = useState("Good things take shape."),
    [size, setSize] = useState(64),
    [weight, setWeight] = useState(400);
  return (
    <div className="mb-font-studio">
      <div className="mb-studio-controls">
        <label>
          Preview text
          <input
            value={text}
            maxLength={180}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <label>
          Size · {size}px
          <input
            type="range"
            min={24}
            max={100}
            value={size}
            onChange={(e) => setSize(+e.target.value)}
          />
        </label>
        {item.variable && (
          <label>
            Weight
            <select value={weight} onChange={(e) => setWeight(+e.target.value)}>
              {[300, 400, 500, 600, 700].map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <div
        className="mb-type-specimen"
        style={{ fontFamily: `"${item.family}",serif`, fontWeight: weight }}
      >
        <p style={{ fontSize: size }}>{text || "Type something good."}</p>
        <span>Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm</span>
        <span>Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz</span>
        <span>0123456789 &amp; @ ! ?</span>
      </div>
      <CopyButton
        label="Copy font-family"
        text={`font-family: "${item.family}", sans-serif;`}
      />
    </div>
  );
}
function ColorStudio({ item }: { item: LibraryResource }) {
  const colors = item.colors || {},
    [fg, setFg] = useState(colors.Foreground || "#222222"),
    [bg, setBg] = useState(colors.Background || "#FFFFFF"),
    [seed, setSeed] = useState(colors.Primary || "#7957D5");
  const ratio = contrastRatio(fg, bg);
  const tokens =
    ":root {\n" +
    Object.entries(colors)
      .map(([k, v]) => `  --${k.toLowerCase().replaceAll(" ", "-")}: ${v};`)
      .join("\n") +
    "\n}";
  function shift(hex: string, angle: number) {
    const [r, g, b] = [1, 3, 5].map(
        (i) => parseInt(hex.slice(i, i + 2), 16) / 255,
      ),
      max = Math.max(r, g, b),
      min = Math.min(r, g, b),
      d = max - min,
      l = (max + min) / 2;
    let h = 0;
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    if (d)
      h =
        (max === r
          ? ((g - b) / d) % 6
          : max === g
            ? (b - r) / d + 2
            : (r - g) / d + 4) * 60;
    return `hsl(${(h + angle + 360) % 360} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`;
  }
  return (
    <div className="mb-color-studio">
      <div className="mb-swatches">
        {Object.entries(colors).map(([name, color]) => (
          <div key={name}>
            <span style={{ background: color }} />
            <strong>{name}</strong>
            <CopyButton label={color} text={color} />
          </div>
        ))}
      </div>
      <div className="mb-studio-section">
        <h3>Check the contrast</h3>
        <p>
          WCAG contrast for this exact color pair. Normal text needs 4.5:1 for
          AA and 7:1 for AAA; large text needs 3:1 for AA.
        </p>
        <div className="mb-studio-controls">
          <label>
            Text color
            <input
              type="color"
              value={fg}
              onChange={(e) => setFg(e.target.value)}
            />
          </label>
          <label>
            Background
            <input
              type="color"
              value={bg}
              onChange={(e) => setBg(e.target.value)}
            />
          </label>
        </div>
        <div
          className="mb-contrast-sample"
          style={{ background: bg, color: fg }}
        >
          <strong>Aa · {ratio.toFixed(2)}:1</strong>
          <p>Good design should be easy to read.</p>
          <span>
            {ratio >= 7
              ? "AAA normal text"
              : ratio >= 4.5
                ? "AA normal text"
                : ratio >= 3
                  ? "AA large text only"
                  : "Below AA text contrast"}
          </span>
        </div>
      </div>
      <div className="mb-studio-section">
        <h3>A little color theory</h3>
        <p>
          Complementary colors sit opposite each other. Analogous colors sit
          next to each other. Triadic colors are evenly spaced around the color
          wheel. Always check contrast after choosing your harmony.
        </p>
        <label className="mb-seed">
          Base color
          <input
            type="color"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
          />
          <code>{seed}</code>
        </label>
        <div className="mb-harmonies">
          {[
            ["Complementary", [0, 180]],
            ["Analogous", [-30, 0, 30]],
            ["Triadic", [0, 120, 240]],
          ].map(([name, angles]) => (
            <div key={String(name)}>
              <h4>{String(name)}</h4>
              <div>
                {(angles as number[]).map((angle) => (
                  <span
                    key={angle}
                    style={{ background: shift(seed, angle) }}
                    title={shift(seed, angle)}
                  />
                ))}
              </div>
              <CopyButton
                label="Copy harmony"
                text={(angles as number[])
                  .map((a) => shift(seed, a))
                  .join(", ")}
              />
            </div>
          ))}
        </div>
      </div>
      <CopyButton label="Copy all CSS tokens" text={tokens} />
      <pre className="mb-token-code">{tokens}</pre>
    </div>
  );
}
function IllustrationStudio({ item }: { item: LibraryResource }) {
  const [accent, setAccent] = useState(item.accent || "#8B6CF8"),
    [svg, setSvg] = useState(""),
    [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch(item.image!, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw Error();
        return r.text();
      })
      .then(setSvg)
      .catch((e) => {
        if (e.name !== "AbortError") setFailed(true);
      });
    return () => controller.abort();
  }, [item.image]);
  const modified = svg.replaceAll(item.accent || "#8B6CF8", accent),
    uri = modified
      ? "data:image/svg+xml;charset=utf-8," + encodeURIComponent(modified)
      : item.image;
  return (
    <div className="mb-illustration-studio">
      <div className="mb-studio-controls">
        <label>
          Accent color
          <input
            type="color"
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
          />
        </label>
        <code>{accent.toUpperCase()}</code>
        {modified && (
          <a className="mb-button" href={uri} download={item.id + ".svg"}>
            <Download size={13} />
            Download recolored SVG
          </a>
        )}
      </div>
      {failed && (
        <p role="alert">
          Could not load editable source. The original ZIP remains available.
        </p>
      )}
      <img src={uri} alt={item.name} />
      <p className="mb-preview-note">
        Original Migbits vectors. The recolored SVG includes author and license
        metadata; retain the full MIT notice from the ZIP when redistributing.
      </p>
    </div>
  );
}
function SourcePanel({ item }: { item: LibraryResource }) {
  const [payload, setPayload] = useState<Payload | null>(null),
    [selected, setSelected] = useState(""),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!item.dataUrl) return;
    const controller = new AbortController();
    fetch(item.dataUrl, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw Error("Source request failed");
        return r.json();
      })
      .then((data: Payload) => {
        setPayload(data);
        setSelected(data.files?.[0]?.path || "");
      })
      .catch((e) => {
        if (e.name !== "AbortError")
          setError("Source could not load. Retry or download the ZIP.");
      });
    return () => controller.abort();
  }, [item.dataUrl, retry]);
  if (!item.dataUrl)
    return (
      <div className="mb-source-panel">
        <p>
          This font is distributed as a binary with its CSS and exact OFL notice
          in the ZIP.
        </p>
        <CopyButton
          label="Copy font CSS"
          text={`font-family: "${item.family}", sans-serif;`}
        />
      </div>
    );
  if (error)
    return (
      <div className="mb-source-panel" role="alert">
        <p>{error}</p>
        <button
          className="mb-button"
          onClick={() => {
            setError("");
            setRetry((v) => v + 1);
          }}
        >
          Retry
        </button>
      </div>
    );
  if (!payload)
    return (
      <p className="mb-source-panel" role="status">
        Loading original source…
      </p>
    );
  const file = payload.files?.find((f) => f.path === selected);
  return (
    <div className="mb-source-panel">
      {payload.files?.length > 0 && (
        <>
          <div className="mb-source-toolbar">
            <label>
              File
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
              >
                {payload.files.map((f) => (
                  <option key={f.path} value={f.path}>
                    {f.path}
                  </option>
                ))}
              </select>
            </label>
            {file && <CopyButton text={file.content} label="Copy code" />}
          </div>
          <pre tabIndex={0} aria-label="Source code">
            <code>{file?.content}</code>
          </pre>
        </>
      )}
      {payload.record && (
        <>
          <h3>Original data</h3>
          <pre tabIndex={0}>{JSON.stringify(payload.record, null, 2)}</pre>
        </>
      )}
      {payload.installation?.length ? (
        <div className="mb-source-setup">
          <h3>Installation from upstream</h3>
          {payload.installation.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      ) : null}
      {payload.resource?.dependencies?.length ? (
        <p>Dependencies: {payload.resource.dependencies.join(", ")}</p>
      ) : null}
      {payload.resource?.revision && (
        <p className="mb-preview-note">
          Pinned revision: <code>{payload.resource.revision}</code>
        </p>
      )}
    </div>
  );
}
export function ResourceStudio({
  resource: item,
}: {
  resource: LibraryResource;
}) {
  const [tab, setTab] = useState("preview"),
    [mobile, setMobile] = useState(false),
    [loaded, setLoaded] = useState(false);
  const iframeUrl =
    item.previewType === "component"
      ? `/library/preview/${item.id}`
      : item.previewUrl;
  return (
    <div className="mb-studio">
      <div className="mb-studio-bar">
        <div role="tablist" aria-label="Resource view">
          {[
            ["preview", Eye, "Preview"],
            ["source", Code2, "Source"],
            ["usage", Copy, "How to use"],
          ].map(([value, Icon, label]) => {
            const Symbol = Icon as typeof Eye;
            return (
              <button
                key={String(value)}
                role="tab"
                aria-selected={tab === value}
                aria-controls={`studio-${value}`}
                id={`tab-${value}`}
                tabIndex={tab === value ? 0 : -1}
                onKeyDown={(e) => {
                  if (
                    ["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)
                  ) {
                    e.preventDefault();
                    const values = ["preview", "source", "usage"];
                    const next =
                      e.key === "Home"
                        ? "preview"
                        : e.key === "End"
                          ? "usage"
                          : values[
                              (values.indexOf(tab) +
                                (e.key === "ArrowRight" ? 1 : 2)) %
                                3
                            ];
                    setTab(next);
                    document.getElementById("tab-" + next)?.focus();
                  }
                }}
                onClick={() => setTab(String(value))}
              >
                <Symbol size={14} />
                {String(label)}
              </button>
            );
          })}
        </div>
        {iframeUrl && tab === "preview" && (
          <div className="mb-device-controls">
            <button
              aria-label="Desktop preview"
              aria-pressed={!mobile}
              onClick={() => setMobile(false)}
            >
              <Monitor size={16} />
            </button>
            <button
              aria-label="Mobile preview"
              aria-pressed={mobile}
              onClick={() => setMobile(true)}
            >
              <Smartphone size={16} />
            </button>
          </div>
        )}
      </div>
      <div role="tabpanel" id={`studio-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "source" ? (
          <SourcePanel item={item} />
        ) : tab === "usage" ? (
          <div className="mb-usage">
            <h2>Make it your own</h2>
            {(
              item.usage || [
                "Extract the source archive and keep the included license notices.",
                "Open the original source and README. Install the listed dependencies for your project.",
                "Review keyboard behavior, reduced motion and contrast in your final interface.",
              ]
            ).map((step, i) => (
              <div key={i}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <p>{step}</p>
              </div>
            ))}
            <CopyButton
              label="Copy instructions"
              text={(item.usage || []).join("\n\n")}
            />
          </div>
        ) : iframeUrl ? (
          <div className="mb-frame-well">
            <div className={mobile ? "mb-frame-mobile" : "mb-frame-desktop"}>
              {!loaded ? (
                <div className="mb-preview-cover">
                  <img src={item.image} alt={`${item.name} preview`} />
                  <button
                    className="mb-button mb-button-primary"
                    onClick={() => setLoaded(true)}
                  >
                    Load interactive preview <Eye size={15} />
                  </button>
                </div>
              ) : (
                <iframe
                  title={item.name + " interactive preview"}
                  src={iframeUrl}
                  sandbox="allow-scripts"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              )}
            </div>
            <p className="mb-preview-note">
              {item.category === "shaders" &&
                "WebGPU required · starts paused · "}
              Isolated preview ·{" "}
              {item.previewType === "template"
                ? "frontend demo; forms do not send data"
                : "original source and setup in the download"}{" "}
              · animations respect reduced motion where supported.
            </p>
          </div>
        ) : item.previewType === "font" ? (
          <FontStudio item={item} />
        ) : item.previewType === "palette" ? (
          <ColorStudio item={item} />
        ) : item.previewType === "illustration" ? (
          <IllustrationStudio item={item} />
        ) : (
          <div className="mb-figma-studio">
            <img src={item.image} alt={item.name + " editable Figma board"} />
            <p>
              Download the kit for editable SVG, tokens, native
              component-generator source and step-by-step setup. Generator
              syntax is checked; native Figma execution is not yet verified.
            </p>
            <a className="mb-button" href={item.image} download>
              Download editable SVG board <Download size={14} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
