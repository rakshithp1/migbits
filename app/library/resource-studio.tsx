"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, useRef } from "react";
import {
  Check,
  Copy,
  Monitor,
  Smartphone,
  Code2,
  Eye,
  Download,
} from "lucide-react";
import { templateColors } from "../../lib/template-colors";
import type { LibraryResource } from "../../lib/resource-library";
import { contrastRatio } from "../../lib/color-theory";
import { ThemeStudio } from "./theme-studio";
import { ColorIcons } from "./color-icons";
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
  const [scale, setScale] = useState(1.25);
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
      <div
        className="mb-type-scale"
        style={{ fontFamily: `"${item.family}",serif` }}
      >
        <label>
          Typography scale{" "}
          <select
            aria-label="Typography scale"
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
          >
            <option value={1.125}>Compact · 1.125</option>
            <option value={1.2}>Balanced · 1.2</option>
            <option value={1.25}>Editorial · 1.25</option>
            <option value={1.333}>Expressive · 1.333</option>
          </select>
        </label>
        {[3, 2, 1, 0].map((step) => (
          <p
            key={step}
            style={{
              fontSize: `clamp(${(16 * Math.pow(scale, step)).toFixed(1)}px,${(1.6 + step * 0.6).toFixed(1)}vw,${(20 * Math.pow(scale, step)).toFixed(1)}px)`,
            }}
          >
            <small>
              {step === 0 ? "Body" : `Heading ${4 - step}`} · responsive type
            </small>
            {step === 0
              ? "Clear, comfortable reading for the everyday details."
              : "Good things take shape."}
          </p>
        ))}
        <CopyButton
          label="Copy typography scale"
          text={`/* Font binaries and OFL notice: use the original font download. */\nfont-family: "${item.family}", sans-serif;\n${[0, 1, 2, 3].map((step) => `--type-${step}: clamp(${(16 * Math.pow(scale, step)).toFixed(1)}px, ${(1.6 + step * 0.6).toFixed(1)}vw, ${(20 * Math.pow(scale, step)).toFixed(1)}px);`).join("\n")}`}
        />
      </div>
    </div>
  );
}
function ColorStudio({ item }: { item: LibraryResource }) {
  const [gradientEnd, setGradientEnd] = useState("#22d3ee");
  const [angle, setAngle] = useState(125);
  const [animateGradient, setAnimateGradient] = useState(false);
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
      <div className="mb-studio-section">
        <h3>Build a gradient</h3>
        <p>
          Decorative color, with optional gentle movement. Keep readable text on
          a solid surface.
        </p>
        <div className="mb-studio-controls">
          <label>
            Gradient start
            <input
              type="color"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
            />
          </label>
          <label>
            Gradient end
            <input
              type="color"
              value={gradientEnd}
              onChange={(e) => setGradientEnd(e.target.value)}
            />
          </label>
          <label>
            Gradient angle · {angle}°
            <input
              type="range"
              min={0}
              max={360}
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
            />
          </label>
          <button
            className="mb-button"
            aria-pressed={animateGradient}
            onClick={() => setAnimateGradient(!animateGradient)}
          >
            {animateGradient ? "Pause gradient" : "Animate gradient"}
          </button>
        </div>
        <div
          className="mb-gradient-preview"
          data-animated={animateGradient}
          aria-label="Decorative gradient preview"
        >
          <div
            style={{
              background: `linear-gradient(${angle}deg, ${seed}, ${gradientEnd})`,
            }}
          />
        </div>
        <CopyButton
          label="Copy gradient CSS"
          text={
            animateGradient
              ? `/* Original MigBits motion. Keep text on a solid surface. */\n.gradient { position:relative; isolation:isolate; overflow:hidden; min-height:12rem; }\n.gradient::before { content:""; position:absolute; inset:-35%; z-index:-1; background:linear-gradient(${angle}deg, ${seed}, ${gradientEnd}); animation:gradient-drift 12s ease-in-out infinite alternate; }\n@keyframes gradient-drift { from { transform:translate3d(-8%,-4%,0) rotate(-5deg); } to { transform:translate3d(8%,4%,0) rotate(5deg); } }\n@media(prefers-reduced-motion:reduce) { .gradient::before { animation:none; transform:none; } }`
              : `/* Decorative background; check any overlaid text separately. */\nbackground: linear-gradient(${angle}deg, ${seed}, ${gradientEnd});`
          }
        />
      </div>
    </div>
  );
}
function IllustrationStudio({ item }: { item: LibraryResource }) {
  const originalColors = {
    Accent: item.accent || "#8B6CF8",
    Ink: "#302B46",
    Warmth: "#FFD3AE",
    Secondary: "#DBECAD",
    Paper: "#FFFFFF",
  };
  const [colors, setColors] = useState<Record<string, string>>(originalColors),
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
  const replacements = new Map(
    Object.entries(originalColors).map(([key, value]) => [
      value.toLowerCase(),
      colors[key],
    ]),
  );
  const modified = svg.replace(
      /#[a-f0-9]{6}\b/gi,
      (value) => replacements.get(value.toLowerCase()) || value,
    ),
    uri = modified
      ? "data:image/svg+xml;charset=utf-8," + encodeURIComponent(modified)
      : item.image;
  return (
    <div className="mb-illustration-studio">
      <div
        className="mb-illustration-palettes"
        role="group"
        aria-label="Illustration palette presets"
      >
        <button className="mb-button" onClick={() => setColors(originalColors)}>
          Original palette
        </button>
        <button
          className="mb-button"
          onClick={() =>
            setColors({
              Accent: "#2563eb",
              Ink: "#172554",
              Warmth: "#fbcfe8",
              Secondary: "#67e8f9",
              Paper: "#eff6ff",
            })
          }
        >
          Ocean candy
        </button>
        <button
          className="mb-button"
          onClick={() =>
            setColors({
              Accent: "#e76f51",
              Ink: "#2f3e46",
              Warmth: "#f4a261",
              Secondary: "#a7c4a0",
              Paper: "#fff8e8",
            })
          }
        >
          Warm botanical
        </button>
        <button
          className="mb-button"
          onClick={() =>
            setColors({
              Accent: "#7c3aed",
              Ink: "#312e81",
              Warmth: "#fda4af",
              Secondary: "#fcd34d",
              Paper: "#faf5ff",
            })
          }
        >
          Playful studio
        </button>
      </div>
      <div className="mb-studio-controls">
        {Object.keys(originalColors).map((key) => (
          <label key={key}>
            {key === "Accent" ? "Accent color" : `${key} color`}
            <input
              type="color"
              value={colors[key]}
              onChange={(e) =>
                setColors((previous) => ({
                  ...previous,
                  [key]: e.target.value,
                }))
              }
            />
          </label>
        ))}
        <code>{colors.Accent.toUpperCase()}</code>
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
        const preferred = item.previewType === "design-prompt" ? "MigBits-build-brief.md" : item.previewType === "source-kit" ? "README-MIGBITS.md" : item.previewType === "motion-example" ? "Example.tsx" : "";
        setSelected(data.files?.find(file => file.path === preferred)?.path || data.files?.[0]?.path || "");
      })
      .catch((e) => {
        if (e.name !== "AbortError")
          setError("Source could not load. Retry or download the ZIP.");
      });
    return () => controller.abort();
  }, [item.dataUrl, item.previewType, retry]);
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
export function ResourceStudio({ resource }: { resource: LibraryResource }) {
  const [variant, setVariant] = useState(0);
  const [color, setColor] = useState("original");
  const [colorCss, setColorCss] = useState("");
  const previewRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const send = () => previewRef.current?.contentWindow?.postMessage({ type: "migbits-template-color", color }, "*");
    const receive = (event: MessageEvent) => {
      if (event.source !== previewRef.current?.contentWindow) return;
      if (event.data?.type === "migbits-template-color-ready") send();
      if (event.data?.type === "migbits-template-color-applied" && event.data.color === color && typeof event.data.css === "string") setColorCss(event.data.css);
    };
    window.addEventListener("message", receive); send();
    return () => window.removeEventListener("message", receive);
  }, [color, variant]);
  useEffect(() => {
    const send = () => previewRef.current?.contentWindow?.postMessage({ type: "migbits-motion-policy", paused: document.documentElement.dataset.mbMotion === "paused" }, "*");
    const observer = new MutationObserver(send);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-mb-motion"] });
    const frame = previewRef.current; frame?.addEventListener("load", send); send();
    return () => { observer.disconnect(); frame?.removeEventListener("load", send); };
  }, [variant]);
  const item = { ...resource, ...resource.variants?.[variant] };
  const [tab, setTab] = useState("preview"),
    [mobile, setMobile] = useState(false);
  const iframeUrl =
    item.previewType === "component"
      ? `/library/preview/${item.id}`
      : item.previewUrl;
  return (
    <div className="mb-studio">
      {item.prompt && <div className="mb-registry-install"><p>MotionSites design · MigBits adaptation. Open Source to copy the build brief and code excerpts.</p></div>}
      {item.originalPrompt && <div className="mb-registry-install"><p>Original MigBits template ? editable build brief included</p><CopyButton label="Copy build prompt" text={item.originalPrompt} /></div>}
      {item.registryItem && (
        <div className="mb-registry-install">
          <code>
            npx shadcn@4.22.1 add https://migbits.com/r/{item.registryItem}.json
          </code>
          <CopyButton
            label="Copy install command"
            text={`npx shadcn@4.22.1 add https://migbits.com/r/${item.registryItem}.json`}
          />
        </div>
      )}
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
            {resource.category === "templates" && <>
              <button onClick={() => { const well = document.getElementById(`preview-${resource.id}`); if (well && document.fullscreenEnabled) void well.requestFullscreen().catch(() => {}); }} aria-label="Full-screen template preview">Full screen ↗</button>
            </>}
            {resource.previewType === "template" && <>
              <label>Colour <select aria-label="Template colour" value={color} onChange={event => { setColorCss(""); setColor(event.target.value); }}>
                {templateColors.map(preset => <option key={preset.id} value={preset.id}>{preset.label}</option>)}
              </select></label>
              {color !== "original" && colorCss && <CopyButton label="Copy colour CSS" text={`/* ${resource.author} ? ${resource.license}. Preserve the notices in the source download. MigBits colour adaptation. */\n${colorCss}`} />}
            </>}
            {resource.variants && (
              <>
                <select
                  aria-label={
                    resource.previewType === "template"
                      ? "Preview page"
                      : "Preview variant"
                  }
                  value={variant}
                  onChange={(event) => setVariant(Number(event.target.value))}
                >
                  {resource.variants.map((entry, index) => (
                    <option key={entry.label} value={index}>
                      {entry.label}
                    </option>
                  ))}
                </select>
                <a
                  href={item.downloadUrl}
                  aria-label="Download selected variant"
                >
                  <Download size={15} />
                </a>
              </>
            )}
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
        ) : item.previewType === "theme" ? (
          <ThemeStudio id={item.id.replace(/^theme-/, "")} />
        ) : item.previewType === "icons" ? (
          <ColorIcons />
        ) : iframeUrl ? (
          <div className="mb-frame-well" id={`preview-${resource.id}`}>
            <div className={mobile ? "mb-frame-mobile" : "mb-frame-desktop"}>
              <iframe
                  ref={previewRef}
                  onLoad={() => {
                    previewRef.current?.contentWindow?.postMessage({ type: "migbits-template-color", color }, "*");
                    previewRef.current?.contentWindow?.postMessage({ type: "migbits-motion-policy", paused: document.documentElement.dataset.mbMotion === "paused" }, "*");
                  }}
                  title={item.name + " interactive preview"}
                  src={iframeUrl}
                  sandbox="allow-scripts"
                  referrerPolicy="no-referrer"
                  loading="eager"
                />
            </div>
            <p className="mb-preview-note">
              {item.category === "shaders" &&
                "WebGPU required · starts paused · "}
              Isolated preview ·{" "}
              {item.previewType === "design-prompt"
                ? item.prompt?.previewMode === "live-adaptation" ? "live adaptation; original source retained" : "reference media; full application not verified"
                : item.previewType === "source-kit"
                ? "documentation overview; installation not verified"
                : item.previewType === "motion-example"
                  ? "technical example; source accessibility needs review"
                : item.previewType === "template"
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
