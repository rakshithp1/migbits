import { notFound, redirect } from "next/navigation";
import { libraryResources } from "../../../../lib/resource-library";
export default async function LegacyResource({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!libraryResources.some((item) => item.id === id)) notFound();
  redirect("/library/resource/" + id);
}
