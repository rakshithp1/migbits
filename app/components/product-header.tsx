import Link from "next/link";
export function ProductHeader() {
  return (
    <header className="product-header">
      <Link href="/" className="logo">
        <span aria-hidden="true">✳</span> Migbits
      </Link>
      <nav aria-label="Library navigation">
        <Link href="/library">Library</Link>
        <Link href="/library/components">Components</Link>
        <Link href="/library/blocks">Blocks</Link>
        <Link href="/library/templates">Templates</Link>
        <Link href="/library/figma">Figma kits</Link>
        <a
          href="https://github.com/rakshithp1/migbits"
          target="_blank"
          rel="noreferrer"
        >
          GitHub ↗
        </a>
      </nav>
    </header>
  );
}
