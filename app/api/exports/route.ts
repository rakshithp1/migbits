import { archiveExport, canDeliverDrafts, createResourceExport, DeliveryError, deliveryError, readBoundedJson } from "../../../services/resource-export";
export async function POST(request:Request) {
  try {
    const origin=request.headers.get("origin");if(origin && origin!==new URL(request.url).origin)throw new DeliveryError(403,"ORIGIN_NOT_ALLOWED","Use the website's own export controls.");
    const input=await readBoundedJson(request);
    if(!input || typeof input!=="object" || Array.isArray(input))throw new DeliveryError(422,"INVALID_REQUEST","Choose a resource, version, and preset.");
    const body=input as Record<string,unknown>;
    if(Object.keys(body).some(key=>!["slug","version","preset","format"].includes(key)) || typeof body.slug!=="string" || typeof body.version!=="string" || !["zip","json"].includes(body.format as string))throw new DeliveryError(422,"INVALID_REQUEST","Choose a supported export format and exact resource version.");
    const bundle=createResourceExport({slug:body.slug,version:body.version,preset:body.preset,allowDrafts:canDeliverDrafts()});
    if(body.format==="json")return Response.json(bundle,{headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
    return new Response(new Uint8Array(archiveExport(bundle)),{headers:{"Content-Type":"application/zip","Content-Disposition":`attachment; filename="migbits-${body.slug}-${bundle.resourceVersion}.zip"`,"Cache-Control":"no-store","X-Content-Type-Options":"nosniff","X-Migbits-Export-Digest":bundle.exportDigest}});
  }catch(error){return deliveryError(error);}
}
