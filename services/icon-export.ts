function escapeXml(text:string){return text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');}
// Input comes from a rendered, allowlisted Lucide component, never an uploaded SVG.
export function createAttributedIconSvg(renderedSvg:string,licenseNotice:string,version:string):string {
 if(!/^<svg\b/i.test(renderedSvg)||!licenseNotice.trim())throw new Error('Rendered icon and its license notice are required.');
 return renderedSvg.replace(/(<svg[^>]*>)/,`$1<metadata>${escapeXml(`Source: Lucide Icons (${version}). License notice: ${licenseNotice}`)}</metadata>`);
}
