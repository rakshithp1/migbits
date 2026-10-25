import { notFound } from "next/navigation";
import { ResourceGallery } from "../gallery";
import {
  resourceCategories,
  categoryLabel,
} from "../../../lib/resource-library";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  return { title: categoryLabel(category) + " — Migbits" };
}
export default async function Category(props: {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { category } = await props.params;
  if (!resourceCategories.some((c) => c.id === category)) notFound();
  return (
    <ResourceGallery category={category} searchParams={props.searchParams} />
  );
}
