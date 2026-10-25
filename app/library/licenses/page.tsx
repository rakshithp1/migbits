import Link from "next/link";
import { GalleryHeader, GalleryFooter } from "../gallery";
import { libraryResources } from "../../../lib/resource-library";

export const metadata = { title: "Attribution & licenses — Migbits" };

export default function Attribution() {
  return (
    <div className="mb-site">
      <GalleryHeader />
      <main className="mb-main mb-license-page">
        <Link href="/library">← Back to the library</Link>
        <h1>Attribution &amp; licenses</h1>
        <p>Creator credits and original license notices for the library. Downloads retain applicable copyright and dependency notices.</p>
        <p><a href="https://github.com/rakshithp1/migbits/blob/main/THIRD_PARTY_NOTICES.md">Project third-party notices ↗</a></p>
        <section aria-label="Resource attribution records">
          <ul>{libraryResources.map(item => (
            <li key={item.id}>
              <Link href={`/library/resource/${item.id}`}>{item.name}</Link>
              {" · "}{item.author}{" · "}{item.license}{" · "}
              <a href={item.licenseUrl}>License notice</a>
              {item.sourceUrl && <>{" · "}<a href={item.sourceUrl}>Original source</a></>}
            </li>
          ))}</ul>
        </section>
      </main>
      <GalleryFooter />
    </div>
  );
}
