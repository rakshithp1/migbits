import "./site-effects.css";

export function SiteCallToAction({ color, light }: { color: string; light: boolean }) {
  const content = <>
    <div className="cta-glow"/>
    <span className="eyebrow">YOUR NEXT IDEA STARTS WITH A BIT</span>
    <h2>Build something<br/>people remember.</h2>
    <p>A little motion. A little personality. A lot of possibility.</p>
    <a className="button primary" href="#components">Find your first bit <span aria-hidden="true">→</span></a>
  </>;

  return <section className="section-width site-cta" aria-label="Start exploring components">
    <div className="final-cta" data-appearance={light ? "light" : "dark"} style={{borderColor: `${color}33`}}>{content}</div>
  </section>;
}
