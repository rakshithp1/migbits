"use client";
import { useEffect } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
export function SearchShortcut() {
  const router = useRouter();
  function focusSearch() {
    const input = document.getElementById("gallery-search");
    if (input) {
      input.focus();
      input.scrollIntoView({
        block: "center",
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    } else router.push("/library#gallery-search");
  }
  useEffect(() => {
    function shortcut(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const input = document.getElementById("gallery-search");
        if (input) input.focus();
        else router.push("/library#gallery-search");
      }
    }
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [router]);
  return (
    <button
      className="mb-header-search"
      onClick={focusSearch}
      aria-label="Search the library"
    >
      <Search size={16} />
      <span>Search</span>
      <kbd>⌘K</kbd>
    </button>
  );
}
