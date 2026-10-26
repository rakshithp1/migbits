"use client";
import { useEffect, useState } from "react";
import "./hero-backgrounds.css";

const names = ["Aurora", "Orbit", "Prism"];
export function HeroBackgrounds() {
  const [active, setActive] = useState(0), [stopped, setStopped] = useState(true);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion:reduce)");
    const policy = () => setStopped(media.matches || document.hidden || document.documentElement.dataset.mbMotion === "paused");
    const observer = new MutationObserver(policy);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-mb-motion"] });
    media.addEventListener("change", policy); document.addEventListener("visibilitychange", policy); policy();
    return () => { observer.disconnect(); media.removeEventListener("change", policy); document.removeEventListener("visibilitychange", policy); };
  }, []);
  useEffect(() => {
    if (stopped) return;
    const timer = setInterval(() => setActive(value => (value + 1) % names.length), 6500);
    return () => clearInterval(timer);
  }, [stopped, active]);
  return <>
    <div className="mb-flow-background mb-hero-backdrops" aria-hidden="true" data-background={names[active]}>
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs><filter id="hero-soft"><feGaussianBlur stdDeviation="36"/></filter><linearGradient id="hero-aurora"><stop stopColor="#1533ff"/><stop offset=".5" stopColor="#0ba9bf"/><stop offset="1" stopColor="#6839e4"/></linearGradient><radialGradient id="hero-orb"><stop stopColor="#467cfa" stopOpacity=".8"/><stop offset="1" stopColor="#182554" stopOpacity="0"/></radialGradient><pattern id="hero-grid" width="70" height="70" patternUnits="userSpaceOnUse"><path d="M70 0H0V70" fill="none" stroke="#6ea1f8" strokeOpacity=".16"/></pattern></defs>
        <g className="mb-hero-scene" data-active={active === 0}><g className="mb-hero-aurora" filter="url(#hero-soft)"><path d="M-100 680Q120-100 460 220T1500 180" fill="none" stroke="url(#hero-aurora)" strokeWidth="170"/><path d="M100 700Q700 50 1500 640" fill="none" stroke="#2231a9" strokeWidth="150"/></g></g>
        <g className="mb-hero-scene" data-active={active === 1}><circle cx="1000" cy="240" r="490" fill="url(#hero-orb)"/><g className="mb-hero-orbit" fill="none" stroke="#79a8ff" strokeOpacity=".3"><ellipse cx="850" cy="340" rx="650" ry="180" transform="rotate(-20 850 340)"/><ellipse cx="850" cy="340" rx="560" ry="250" transform="rotate(25 850 340)"/><ellipse cx="850" cy="340" rx="480" ry="320" transform="rotate(-45 850 340)"/><circle cx="1160" cy="130" r="9" fill="#b1dcff"/><circle cx="430" cy="400" r="6" fill="#91d9d8"/></g></g>
        <g className="mb-hero-scene" data-active={active === 2}><rect width="1440" height="900" fill="url(#hero-grid)"/><g className="mb-hero-prism" filter="url(#hero-soft)"><path d="m220 700 450-700 390 750Z" fill="#3448c6" opacity=".55"/><circle cx="1180" cy="260" r="230" fill="#0087ac" opacity=".4"/><circle cx="340" cy="380" r="150" fill="#6430bd" opacity=".5"/></g></g>
      </svg>
    </div>
    <div className="mb-hero-background-controls" role="group" aria-label="Hero backgrounds">{names.map((name, index) => <button key={name} type="button" aria-label={`${name} background`} aria-pressed={active === index} onClick={() => setActive(index)}><span/>{name}</button>)}</div>
  </>;
}
