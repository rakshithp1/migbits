"use client";
import { useState, type CSSProperties } from "react";
import {
  findTheme,
  themeStyle,
  themeCSS,
  type ThemeMode,
} from "../../lib/themes";
import { applySiteTheme } from "./theme-controls";

export function ThemeStudio({ id }: { id: string }) {
  const theme = findTheme(id);
  const [mode, setMode] = useState<ThemeMode>("light");
  const [mobile, setMobile] = useState(false);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="mb-theme-studio">
      <div className="mb-studio-controls">
        <div role="group" aria-label="Theme appearance">
          {(["light", "dark"] as const).map((m) => (
            <button
              className="mb-button"
              key={m}
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
            >
              {m === "light" ? "Light" : "Dark"}
            </button>
          ))}
        </div>
        <button
          className="mb-button"
          aria-pressed={mobile}
          onClick={() => setMobile(!mobile)}
        >
          Mobile preview
        </button>
        <button
          className="mb-button"
          onClick={() => {
            applySiteTheme(theme.id, mode);
            setMessage("Theme applied to MigBits");
          }}
        >
          Apply to site
        </button>
      </div>
      <div
        className={`mb-theme-canvas ${mobile ? "is-mobile" : ""}`}
        style={themeStyle(theme, mode) as CSSProperties}
      >
        <div className="mb-theme-banner" aria-hidden="true" />
        <div className="mb-theme-demo">
          <div className="mb-theme-demo-nav">
            <strong>Studio / {theme.name}</strong>
            <span>Workspace</span>
          </div>
          <span className="mb-theme-badge">Your next chapter</span>
          <h2>
            Good things,
            <br />
            beautifully composed.
          </h2>
          <p>
            A complete palette, considered typography and clear states. Make
            space for the work that matters.
          </p>
          <div className="mb-theme-demo-grid">
            <section>
              <h3>Project overview</h3>
              <strong className="mb-theme-metric">
                12,480 <small>+24.8%</small>
              </strong>
              <div
                className="mb-theme-chart"
                aria-label="Illustrative weekly activity chart"
              >
                {[35, 62, 44, 82, 58, 96, 74].map((h, i) => (
                  <i key={i} style={{ height: h + "%" }} />
                ))}
              </div>
              <p>Illustrative data · last 7 days</p>
            </section>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
            >
              <h3>Make it yours</h3>
              <label>
                Project name
                <input
                  required
                  placeholder="My next good idea"
                  maxLength={80}
                />
              </label>
              <label>
                Project type
                <select defaultValue="Website">
                  <option>Website</option>
                  <option>Dashboard</option>
                  <option>Portfolio</option>
                </select>
              </label>
              <label className="mb-theme-checkbox">
                <input type="checkbox" defaultChecked /> Include a design review
              </label>
              <button type="submit">Create project</button>
              <button type="button" disabled>
                Invite team · coming soon
              </button>
              <p role="status">
                {submitted
                  ? "Demo project created. No data was sent."
                  : "Local demo. Nothing leaves this preview."}
              </p>
            </form>
          </div>
          <div className="mb-theme-role-swatches">
            {["primary", "secondary", "accent", "muted", "destructive"].map(
              (role) => (
                <span key={role}>
                  <i style={{ background: `var(--${role})` }} />
                  {role}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
      <p className="mb-preview-note">
        {theme.headingFont} headings / {theme.bodyFont} body · light and dark ·
        semantic CSS variables · decorative gradients · fonts retain their
        separate OFL notices.
      </p>
      <div className="mb-studio-controls">
        <button
          className="mb-button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(themeCSS(theme));
              setMessage("Theme CSS copied");
            } catch {
              setMessage("Select the CSS below to copy it");
            }
          }}
        >
          Copy theme CSS
        </button>
        <span role="status">{message}</span>
      </div>
      <details className="mb-theme-code">
        <summary>CSS tokens and installation</summary>
        <p>
          Copy these variables into your global stylesheet. Use your existing
          Tailwind/shadcn semantic token mappings and add the listed fonts with
          their OFL notices. Select the Source tab for the complete files and
          setup instructions.
        </p>
        <pre tabIndex={0}>{themeCSS(theme)}</pre>
      </details>
    </div>
  );
}
