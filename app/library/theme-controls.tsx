"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { findTheme, themes, type ThemeMode } from "../../lib/themes";

export function applySiteTheme(id: string, mode: ThemeMode) {
  const theme = findTheme(id);
  document.documentElement.dataset.mbTheme = theme.id;
  document.documentElement.dataset.mbAppearance = mode;
  try {
    localStorage.setItem(
      "migbits-theme",
      JSON.stringify({ id: theme.id, mode }),
    );
  } catch {
    /* Theme still works with storage disabled. */
  }
  window.dispatchEvent(new Event("migbits-theme-change"));
}
export function ThemeControls() {
  const [id, setId] = useState("ocean");
  const [mode, setMode] = useState<ThemeMode>("dark");
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("migbits-theme") || "null");
      if (
        saved &&
        themes.some((t) => t.id === saved.id) &&
        ["light", "dark"].includes(saved.mode)
      )
        applySiteTheme(saved.id, saved.mode);
    } catch {
      /* Invalid preferences use defaults. */
    }
    function sync() {
      setId(findTheme(document.documentElement.dataset.mbTheme || "ocean").id);
      setMode(
        document.documentElement.dataset.mbAppearance === "light"
          ? "light"
          : "dark",
      );
    }
    sync();
    window.addEventListener("migbits-theme-change", sync);
    return () => window.removeEventListener("migbits-theme-change", sync);
  }, []);
  return (
    <div className="mb-theme-controls">
      <label>
        <span className="sr-only">Site theme</span>
        <select
          aria-label="Site theme"
          value={id}
          onChange={(e) => applySiteTheme(e.target.value, mode)}
        >
          {themes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        aria-label={
          mode === "dark" ? "Use light appearance" : "Use dark appearance"
        }
        onClick={() => applySiteTheme(id, mode === "dark" ? "light" : "dark")}
      >
        {mode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </div>
  );
}
