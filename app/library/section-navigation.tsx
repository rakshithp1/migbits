import Link from "next/link";
import { libraryResources, librarySections } from "../../lib/resource-library";
export function SectionNavigation({ active }: { active: string }) {
  return (
    <nav
      className="mb-category-tabs mb-tool-categories"
      aria-label="Resource categories"
    >
      <Link href="/library">
        All<span>{libraryResources.length}</span>
      </Link>
      {librarySections.map((section) => (
        <Link
          key={section.id}
          href={"/library/" + section.id}
          aria-current={active === section.id ? "page" : undefined}
        >
          {section.label}
          <span>{section.count}</span>
        </Link>
      ))}
    </nav>
  );
}
