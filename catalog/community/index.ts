import verified from "./verified.json";
export interface CommunitySource { id:string;name:string;category:string;stack:string;website:string;summary:string;tags:string[];repository:string;revision:string;license:string;licenseUrl:string;licensePath:string;licenseSha256:string;reviewedAt:string;delivery:string;scope:string }
export const communitySources:CommunitySource[]=verified;
export const communityCategories=[...new Set(communitySources.map(source=>source.category))].sort();
export function filterCommunity({query="",category="all",stack="all",license="all"}:{query?:string;category?:string;stack?:string;license?:string}={}) {
 const words=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
 return communitySources.filter(source=>(category==="all"||source.category===category)&&(stack==="all"||source.stack.toLowerCase().includes(stack.toLowerCase()))&&(license==="all"||source.license===license)&&words.every(word=>[source.name,source.summary,source.category,source.stack,...source.tags].join(" ").toLowerCase().includes(word)));
}
