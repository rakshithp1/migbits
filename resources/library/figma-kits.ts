export const figmaKits = [
  {
    id: "studio",
    name: "Studio essentials",
    accent: "#7957D5",
    description:
      "An editorial kit with buttons, form fields, cards, navigation and a hero block.",
    hero: "A little space for big ideas.",
  },
  {
    id: "saas",
    name: "SaaS foundations",
    accent: "#217A63",
    description:
      "Product interface foundations with reusable controls, pricing cards and dashboard blocks.",
    hero: "Make room for better work.",
  },
  {
    id: "commerce",
    name: "Commerce starter",
    accent: "#AE5637",
    description:
      "A warm storefront kit with product cards, purchase controls, navigation and promotional blocks.",
    hero: "Considered things. Everyday.",
  },
] as const;
export function kitSvg(id: string) {
  const kit = figmaKits.find((k) => k.id === id);
  if (!kit) throw Error("Unknown kit");
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="760" viewBox="0 0 1000 760"><metadata>Original Migbits UI kit. MIT License. Copyright 2026 Migbits contributors.</metadata><rect width="1000" height="760" fill="#F7F6F3"/><g font-family="Arial,sans-serif" fill="#26242C"><text x="48" y="65" font-size="25" font-weight="700">` +
    kit.name +
    `</text><text x="48" y="94" font-size="13" fill="#777">COMPONENTS / BLOCKS / DESIGN TOKENS</text><rect x="48" y="130" width="904" height="62" rx="12" fill="white"/><text x="70" y="167" font-size="19" font-weight="700">` +
    kit.id +
    `.</text><text x="620" y="167" font-size="14">Discover</text><text x="715" y="167" font-size="14">About</text><rect x="807" y="144" width="124" height="34" rx="7" fill="` +
    kit.accent +
    `"/><text x="832" y="167" fill="white" font-size="13">Get started</text><rect x="48" y="210" width="904" height="234" rx="12" fill="white"/><text x="78" y="258" font-size="12" fill="` +
    kit.accent +
    `">THOUGHTFULLY MADE</text><text x="78" y="313" font-size="38" font-weight="700">` +
    kit.hero +
    `</text><text x="78" y="350" font-size="15" fill="#777">An editable starting point, ready for your next project.</text><rect x="78" y="378" width="145" height="40" rx="8" fill="` +
    kit.accent +
    `"/><text x="104" y="403" fill="white" font-size="14">Explore the kit</text>` +
    [0, 1, 2]
      .map(
        (i) =>
          `<rect x="` +
          (48 + i * 310) +
          `" y="466" width="284" height="232" rx="12" fill="white"/><rect x="` +
          (68 + i * 310) +
          `" y="486" width="244" height="82" rx="8" fill="` +
          ["#E8E1F5", "#E2ECE4", "#F2DED4"][i] +
          `"/><text x="` +
          (68 + i * 310) +
          `" y="600" font-size="17" font-weight="700">` +
          ["Everyday essentials", "Made to compose", "A thoughtful detail"][i] +
          `</text><text x="` +
          (68 + i * 310) +
          `" y="626" font-size="13" fill="#777">Editable shapes and typography</text><rect x="` +
          (68 + i * 310) +
          `" y="647" width="118" height="30" rx="6" fill="` +
          kit.accent +
          `"/><text x="` +
          (83 + i * 310) +
          `" y="667" fill="white" font-size="12">View collection</text>`,
      )
      .join("") +
    `<text x="48" y="735" font-size="12" fill="#777">Original Migbits / MIT / Editable SVG board + native component generator</text></g></svg>`
  );
}
export function kitPlugin(id: string) {
  const kit = figmaKits.find((k) => k.id === id);
  if (!kit) throw Error("Unknown kit");
  return (
    `// Original Migbits UI kit generator. MIT. Copyright 2026 Migbits contributors.
(async function(){
 await figma.loadFontAsync({family:"Inter",style:"Regular"});
 await figma.loadFontAsync({family:"Inter",style:"Bold"});
 const accent="` +
    kit.accent +
    `";
 function rgb(hex){return {r:parseInt(hex.slice(1,3),16)/255,g:parseInt(hex.slice(3,5),16)/255,b:parseInt(hex.slice(5,7),16)/255}}
 function paint(hex){return [{type:"SOLID",color:rgb(hex)}]}
 const page=figma.createPage();page.name="Migbits / ` +
    kit.name +
    `";await figma.setCurrentPageAsync(page);
 function text(parent,label,size=14,color="#26242C",bold=false){const n=figma.createText();n.fontName={family:"Inter",style:bold?"Bold":"Regular"};n.characters=label;n.fontSize=size;n.fills=paint(color);parent.appendChild(n);return n}
 function frame(name,w,h,color="#FFFFFF",component=false){const n=component?figma.createComponent():figma.createFrame();n.name=name;n.resize(w,h);n.fills=paint(color);n.cornerRadius=10;page.appendChild(n);return n}
 function auto(n){n.layoutMode="VERTICAL";n.paddingTop=n.paddingBottom=20;n.paddingLeft=n.paddingRight=20;n.itemSpacing=12;n.primaryAxisSizingMode="AUTO";n.counterAxisSizingMode="FIXED"}
 const tokens={primary:accent,ink:"#26242C",surface:"#FFFFFF",background:"#F7F6F3",muted:"#777777"};
 for(const [key,value] of Object.entries(tokens)){const style=figma.createPaintStyle();style.name="Migbits/` +
    kit.id +
    `/"+key;style.paints=paint(value)}
 const variants=[];
 for(const [index,state] of ["Primary","Secondary","Disabled"].entries()){
   const n=frame("Style="+state,160,44,state==="Primary"?accent:state==="Secondary"?"#EEEAF5":"#E5E5E5",true);n.x=48+index*190;n.y=100;n.layoutMode="HORIZONTAL";n.primaryAxisAlignItems="CENTER";n.counterAxisAlignItems="CENTER";n.paddingLeft=n.paddingRight=18;n.primaryAxisSizingMode="AUTO";text(n,"Button",14,state==="Primary"?"#FFFFFF":"#26242C");variants.push(n);
 }
 const buttons=figma.combineAsVariants(variants,page);buttons.name="Button";buttons.x=48;buttons.y=100;
 const field=frame("Input / Default",300,84,"#FFFFFF",true);auto(field);field.x=48;field.y=250;text(field,"Email address",12,"#777777");text(field,"you@example.com",14);
 const badge=frame("Badge / Default",110,32,"#EEEAF5",true);badge.x=400;badge.y=250;badge.layoutMode="HORIZONTAL";badge.primaryAxisAlignItems="CENTER";badge.counterAxisAlignItems="CENTER";text(badge,"New collection",11,accent);
 const card=frame("Card / Default",300,180,"#FFFFFF",true);auto(card);card.x=48;card.y=390;text(card,"A thoughtful detail",22,"#26242C",true);text(card,"Build something worth keeping.",14,"#777777");card.appendChild(variants[0].createInstance());
 const nav=frame("Block / Navigation",900,80,"#FFFFFF",true);nav.x=48;nav.y=650;nav.layoutMode="HORIZONTAL";nav.paddingLeft=nav.paddingRight=28;nav.counterAxisAlignItems="CENTER";nav.itemSpacing=60;text(nav,"` +
    kit.id +
    `.",24,"#26242C",true);text(nav,"Discover");text(nav,"About");nav.appendChild(variants[0].createInstance());
 const hero=frame("Block / Hero",900,270,"#FFFFFF",true);auto(hero);hero.x=48;hero.y=770;text(hero,"THOUGHTFULLY MADE",12,accent);text(hero,"` +
    kit.hero +
    `",38,"#26242C",true);text(hero,"An editable starting point for your next project.",16,"#777777");hero.appendChild(variants[0].createInstance());
 const pricing=frame("Block / Pricing",300,240,"#FFFFFF",true);auto(pricing);pricing.x=400;pricing.y=390;text(pricing,"Studio plan",22,"#26242C",true);text(pricing,"$24 / month",26);text(pricing,"Everything you need to begin.",14,"#777777");pricing.appendChild(variants[0].createInstance());
 const board=frame("Template / Starter",980,800,"#F7F6F3");board.x=1100;board.y=100;
 const navInstance=nav.createInstance();board.appendChild(navInstance);navInstance.x=40;navInstance.y=30;
 const heroInstance=hero.createInstance();board.appendChild(heroInstance);heroInstance.x=40;heroInstance.y=140;
 for(let i=0;i<3;i++){const instance=card.createInstance();board.appendChild(instance);instance.x=30+i*310;instance.y=450}
 text(page,"Original Migbits. MIT: preserve LICENSE when redistributing. Fonts remain separately licensed.",14,"#777777").y=1150;
 figma.viewport.scrollAndZoomIntoView([board]);figma.closePlugin("Created editable components, button variants, blocks, paint styles and a starter template.");
})().catch(error=>{figma.closePlugin("Could not generate kit: "+error.message)});
`
  );
}
