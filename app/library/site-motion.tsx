"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Pause, Play } from "lucide-react";
import "./site-motion.css";

const preference = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const subscribe = (notify: () => void) => {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};

/** Original MigBits presentation motion; never runs or modifies example code. */
export function SiteMotion() {
  const pathname = usePathname();
  const reduced = useSyncExternalStore(subscribe, preference, () => false);
  const [paused, setPaused] = useState(false);
  const stopped = paused || reduced;
  const revealed = useRef(new WeakSet<Element>());

  useEffect(() => {
    document.documentElement.dataset.mbMotion = stopped ? "paused" : "running";
    if (stopped || !window.IntersectionObserver) return;
    const seen = revealed.current;
    const animations = new Set<Animation>();
    const observer = new IntersectionObserver((entries) => {
      let order = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        const animation = entry.target.animate(
          [{ opacity: 0.82, translate: "0 8px" }, { opacity: 1, translate: "0 0" }],
          { duration: 650, delay: Math.min(order++ * 30, 120), easing: "cubic-bezier(.16,1,.3,1)" },
        );
        animations.add(animation);
        animation.finished.then(() => animations.delete(animation)).catch(() => {});
      }
    }, { threshold: 0.12 });
    const selector = ".mb-site .mb-card-preview, .mb-site .mb-home-category-grid > a, .mb-site .mb-home-workflow > article, .mb-site .mb-home-section-heading, .mb-site .mb-home-hero-copy > *, .mb-site .mb-intro, .mb-site .mb-detail-heading";
    const scan = (root: Document | Element) => {
      const elements = [...root.querySelectorAll(selector)];
      if (root instanceof Element && root.matches(selector)) elements.push(root);
      elements.forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        observer.observe(element);
      });
    };
    scan(document);
    // Inspect inserted subtrees only; text changes must not replay the page.
    const updates = new MutationObserver((records) => {
      for (const record of records) for (const node of record.addedNodes) {
        if (node instanceof Element) scan(node);
      }
    });
    updates.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      updates.disconnect();
      animations.forEach((animation) => animation.cancel());
    };
  }, [pathname, stopped]);

  // Embedded examples retain their own isolated animation/visibility policy.
  if (pathname.includes("/preview/") || pathname.startsWith("/open-source/")) return null;
  return (
    <button className="mb-motion-toggle" onClick={() => setPaused((value) => !value)} disabled={reduced} aria-pressed={stopped}>
      {stopped ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
      {reduced ? "Reduced motion" : paused ? "Resume motion" : "Pause motion"}
    </button>
  );
}
