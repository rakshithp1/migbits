import type { MetadataRoute } from "next";
import { libraryResources, resourceCategories } from "../lib/resource-library";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/library", "/library/licenses", "/guides/installation", ...resourceCategories.map(category => `/library/${category.id}`), ...libraryResources.map(resource => `/library/resource/${resource.id}`)];
  return [...new Set(routes)].map(route => ({ url: `https://migbits.com${route}`, changeFrequency: "weekly", priority: route === "" ? 1 : route.startsWith("/library/resource/") ? 0.6 : 0.8 }));
}
