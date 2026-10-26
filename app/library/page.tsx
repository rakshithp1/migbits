import type { Metadata } from "next";
import { ResourceGallery } from "./gallery";
export const metadata: Metadata = {
  alternates: { canonical: "/library" },
  title: "The library — Migbits",
  description:
    "Browse components, blocks, templates, typography, color theory, illustrations and Figma kits.",
};
export default function Library(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <ResourceGallery searchParams={props.searchParams} />;
}
