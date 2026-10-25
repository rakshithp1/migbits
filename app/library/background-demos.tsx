"use client";
import { useState } from "react";
import { Copy, Download, Pause, Play, Check } from "lucide-react";
const backgrounds = [
  {
    id: "aurora",
    name: "Aurora flow",
    description: "Soft bands of color moving across a dark canvas.",
    css: "body{background:#070913}body::before,body::after{content:'';position:absolute;width:125%;height:65%;left:-10%;border-radius:45%;filter:blur(45px);opacity:.7;animation:flow 14s ease-in-out infinite alternate}body::before{top:-20%;background:linear-gradient(110deg,transparent 10%,var(--accent) 35%,#7a45d3 65%,transparent);transform:rotate(-20deg)}body::after{bottom:-35%;background:linear-gradient(120deg,#103a8a,var(--accent),transparent);animation-delay:-7s}@keyframes flow{to{transform:translate(6%,20%) rotate(15deg) scale(1.15)}}",
  },
  {
    id: "dots",
    name: "Spotlight dot grid",
    description: "A crisp dotted pattern with a slowly drifting spotlight.",
    css: "body{background:#090b10;background-image:radial-gradient(#818cab55 1px,transparent 1px);background-size:20px 20px}body::before{content:'';position:absolute;inset:-40%;background:radial-gradient(ellipse at center,var(--accent),transparent 38%);opacity:.35;animation:spotlight 12s ease-in-out infinite alternate;mix-blend-mode:screen}@keyframes spotlight{from{transform:translate(-12%,-5%)}to{transform:translate(15%,10%)}}",
  },
];
function BackgroundCard({
  background,
  license,
}: {
  background: (typeof backgrounds)[number];
  license: string;
}) {
  const [accent, setAccent] = useState(
      background.id === "aurora" ? "#2455ff" : "#63a9d9",
    ),
    [paused, setPaused] = useState(false),
    [copied, setCopied] = useState(false),
    [error, setError] = useState("");
  const html =
    "<!doctype html>\n<!--\n" +
    license +
    '\n-->\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' +
    background.name +
    "</title><style>:root{--accent:" +
    accent +
    "}*{box-sizing:border-box}body{margin:0;min-height:100vh;overflow:hidden;position:relative}" +
    background.css +
    "body::before,body::after{animation-play-state:" +
    (paused ? "paused" : "running") +
    "}@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important}}</style></head><body></body></html>";
  return (
    <article className="mb-background-card">
      <iframe
        title={background.name + " background preview"}
        srcDoc={html}
        sandbox=""
        aria-label={background.name + " background preview"}
      />
      <div className="mb-background-caption">
        <h3>{background.name}</h3>
        <p>{background.description}</p>
        <div className="mb-background-controls">
          <label>
            Accent
            <input
              type="color"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
            />
          </label>
          <button
            className="mb-button"
            aria-pressed={paused}
            onClick={() => setPaused(!paused)}
          >
            {paused ? <Play size={12} /> : <Pause size={12} />}{" "}
            {paused ? "Resume" : "Pause"}
          </button>
          <button
            className="mb-button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(html);
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
              } catch {
                setError("Copy unavailable. Use the HTML download.");
              }
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}{" "}
            {copied ? "Copied" : "Copy HTML"}
          </button>
          <a
            className="mb-button"
            download={background.id + ".html"}
            href={"data:text/html;charset=utf-8," + encodeURIComponent(html)}
          >
            <Download size={12} />
            HTML
          </a>
        </div>
        <details>
          <summary>View source</summary>
          <pre tabIndex={0}>
            <code>{html}</code>
          </pre>
        </details>
        {error && <p role="status">{error}</p>}
      </div>
    </article>
  );
}
export function BackgroundDemos({ license }: { license: string }) {
  return (
    <div className="mb-background-grid">
      {backgrounds.map((background) => (
        <BackgroundCard
          key={background.id}
          background={background}
          license={license}
        />
      ))}
    </div>
  );
}
