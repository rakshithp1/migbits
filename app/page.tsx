import type { Metadata } from "next";
import { ResourceGallery } from "./library/gallery";
export const metadata: Metadata = {
  title: "Migbits — Components, templates & design resources",
  description:
    "Explore free components, blocks, templates, typography, color palettes, original illustrations and Figma UI kits. Visual previews, real source and clear licenses.",
};
export default function Home(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <ResourceGallery searchParams={props.searchParams} />;
}
