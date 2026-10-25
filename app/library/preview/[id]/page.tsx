import { notFound } from "next/navigation";
import { libraryResources } from "../../../../lib/resource-library";
import { ComponentPreview } from "../../component-preview";
import "../../gallery.css";
export const metadata = { robots: { index: false, follow: false } };
export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = libraryResources.find(
    (r) => r.id === id && r.previewType === "component",
  );
  if (!item?.componentId) notFound();
  return <ComponentPreview id={item.componentId} />;
}
