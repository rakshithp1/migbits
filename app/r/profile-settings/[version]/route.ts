import { canDeliverDrafts, createResourceExport, deliveryError, registryItem } from "../../../../services/resource-export";
export async function GET(_request:Request,{params}:{params:Promise<{version:string}>}) {
  try{const {version}=await params;const bundle=createResourceExport({slug:"profile-settings",version:version.replace(/\.json$/,""),allowDrafts:canDeliverDrafts()});return Response.json(registryItem(bundle),{headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});}catch(error){return deliveryError(error);}
}
