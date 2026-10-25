import type { Metadata } from "next";
import { LibraryHome } from "./library/home";
export const metadata: Metadata = {
  title: "Migbits — Components, templates & design resources",
  description:
    "Explore free components, blocks, templates, typography, color palettes, original illustrations and Figma UI kits. Visual previews, real source and clear licenses.",
};
export default function Home() {
  return <LibraryHome />;
}
