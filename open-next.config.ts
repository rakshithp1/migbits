import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// No persistent cache is needed for the current catalog and download endpoints.
export default defineCloudflareConfig();
