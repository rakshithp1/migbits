import Link from "next/link";
import { communitySources } from "../../catalog/community";
export function ProductHeader() {
  return (
    <header className="product-header">
      <Link href="/" className="logo">
        <span aria-hidden="true">✳</span> Migbits
      </Link>
      <nav aria-label="Library navigation">
        <Link href="/open-source/components">
          Components <span>65</span>
        </Link>
        <Link href="/library">Resources</Link>
        <Link href="/open-source/imports">Imported collection</Link>
        <Link href="/open-source">
          Open source <span>{communitySources.length}</span>
        </Link>
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
