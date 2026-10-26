import type { LibraryResource } from "../../lib/resource-library";
import "./motion-collection-cover.css";

/** Original vector overviews. Actual upstream examples run only on detail pages. */
export function MotionCollectionCover({ item }: { item: LibraryResource }) {
  const family = item.family || "animation";
  const title = ({ presence: "Enter. Exit. Repeat.", animation: "Make every move count.", layout: "Layouts that flow.", drag: "Grab some momentum.", gestures: "Made to interact.", "lazy-loading": "Motion, on demand.", reorder: "Find a new order.", svg: "Draw something alive.", waapi: "Built for the browser.", hooks: "Connect the movement." } as Record<string, string>)[family];
  return (
    <div className={`mb-motion-cover mb-motion-cover-${family}`}>
      <div className="mb-motion-cover-label"><span>Motion patterns</span><span>{item.variants?.length || 1} {item.variants?.length === 1 ? "example" : "examples"}</span></div>
      <svg viewBox="0 0 480 260" aria-hidden="true" focusable="false">
        {family === "presence" ? <g className="mb-cover-drift"><rect x="82" y="38" width="300" height="62" rx="16" fill="#1e3151"/><rect x="70" y="102" width="324" height="68" rx="16" fill="#355b91"/><rect x="58" y="172" width="348" height="68" rx="16" fill="#8fbcff"/><circle cx="96" cy="206" r="13" fill="#18335b"/><path d="m89 206 5 5 10-11" fill="none" stroke="#c8e3ff" strokeWidth="3"/><path d="M126 198h160m-160 16h108" stroke="#24466f" strokeWidth="7" strokeLinecap="round"/></g>
          : family === "layout" ? <g className="mb-cover-layout"><rect x="50" y="36" width="165" height="188" rx="22" fill="#7cb4ff"/><rect x="230" y="36" width="197" height="85" rx="22" fill="#4268a6"/><rect x="230" y="136" width="90" height="88" rx="22" fill="#b6a2ef"/><rect x="336" y="136" width="91" height="88" rx="22" fill="#8bd6cb"/></g>
          : family === "drag" ? <><path d="M84 190Q250 220 377 66" stroke="#5276ac" strokeWidth="2" strokeDasharray="7 9" fill="none"/><g className="mb-cover-slide"><rect x="154" y="66" width="172" height="132" rx="28" fill="#99c7ff"/><path d="M223 113h4m22 0h4m-30 17h4m22 0h4m-30 17h4m22 0h4" stroke="#284c7d" strokeWidth="6" strokeLinecap="round"/></g><path d="m328 173 26 59 10-22 23-9Z" fill="#f4f7ff" stroke="#193759" strokeWidth="3"/></>
          : family === "gestures" ? <><circle className="mb-cover-pulse" cx="241" cy="130" r="89" fill="none" stroke="#416697" strokeWidth="2"/><rect x="113" y="92" width="254" height="78" rx="39" fill="#a6c8ff"/><path d="M154 131h124m-14-14 15 14-15 14" stroke="#23446e" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/><path className="mb-cover-drift" d="m320 147 24 61 11-22 23-9Z" fill="#fff" stroke="#284b7d" strokeWidth="3"/></>
          : family === "reorder" ? <g className="mb-cover-drift">{Array.from({ length: 9 }, (_, i) => <rect key={i} x={126 + i % 3 * 79} y={24 + Math.floor(i / 3) * 77} width="66" height="64" rx="16" fill={["#9ec6ff", "#91d5cc", "#a89bdd"][i % 3]} />)}<path d="m299 144 20 52 10-19 21-8Z" fill="#fff" stroke="#173353" strokeWidth="3"/></g>
          : family === "svg" ? <><path d="M57 187c65 0 52-130 122-130s61 146 126 146 73-118 118-118" stroke="#2d4569" strokeWidth="12" strokeLinecap="round" fill="none"/><path className="mb-cover-draw" d="M57 187c65 0 52-130 122-130s61 146 126 146 73-118 118-118" stroke="#a3caff" strokeWidth="12" strokeLinecap="round" fill="none"/><circle cx="57" cy="187" r="10" fill="#d0e5ff"/></>
          : family === "lazy-loading" ? <g><rect x="80" y="45" width="320" height="171" rx="24" fill="#1b2d49" stroke="#3e5e8c"/><rect className="mb-cover-shimmer" x="105" y="73" width="108" height="113" rx="14" fill="#597fac"/><path d="M240 88h126m-126 29h94m-94 43h111m-111 23h73" stroke="#516b90" strokeWidth="10" strokeLinecap="round"/></g>
          : family === "hooks" ? <><path d="M64 130h352" stroke="#344e75" strokeWidth="2" strokeDasharray="6 8"/><path d="M60 130q36-115 72 0t72 0 72 0 72 0 72 0" stroke="#83baff" strokeWidth="6" fill="none"/><circle className="mb-cover-slide" cx="238" cy="130" r="24" fill="#b9e4de" stroke="#12233c" strokeWidth="8"/></>
          : family === "waapi" ? <><rect x="55" y="80" width="370" height="100" rx="25" fill="#1b2d49" stroke="#41618a"/><rect className="mb-cover-slide" x="139" y="103" width="158" height="54" rx="27" fill="#9dc9ff"/><path d="M70 207h340m-300-6v12m65-12v12m65-12v12m65-12v12m65-12v12" stroke="#52729d" strokeWidth="2"/></>
          : <><path d="M70 192Q228 7 414 170" stroke="#385b8a" strokeWidth="2" strokeDasharray="7 9" fill="none"/><g className="mb-cover-drift"><rect x="179" y="65" width="122" height="122" rx="32" fill="#95c5ff" transform="rotate(-15 240 126)"/><circle cx="240" cy="126" r="26" fill="#cce4ff"/></g><circle cx="70" cy="192" r="6" fill="#91d5cc"/><circle cx="414" cy="170" r="6" fill="#91d5cc"/></>}
      </svg>
      <div className="mb-motion-cover-caption"><strong>{title}</strong><span>Collection overview · open to interact ↗</span></div>
    </div>
  );
}
