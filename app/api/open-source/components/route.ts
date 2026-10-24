import { Buffer } from "node:buffer";
import pack from "../../../../catalog/community/component-pack.json";
import archive from "../../../../catalog/community/component-archive.json";

export async function GET(request: Request) {
  const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
  if (new URL(request.url).searchParams.get("format") === "json") return Response.json(pack, { headers });
  return new Response(new Uint8Array(Buffer.from(archive.base64, "base64")), {
    headers: { ...headers, "Content-Type": "application/zip", "Content-Disposition": `attachment; filename="migbits-open-source-ui-${pack.version}.zip"` },
  });
}
