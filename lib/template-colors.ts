export const templateColors = [
  { id: "original", label: "Original" },
  { id: "ocean", label: "Ocean blue", hue: 215 },
  { id: "emerald", label: "Emerald", hue: 155 },
  { id: "amber", label: "Amber", hue: 35 },
  { id: "violet", label: "Violet", hue: 265 },
  { id: "rose", label: "Rose", hue: 340 },
] as const;

/** Original adaptation: accept only named presets, never executable parent content. */
export const templateColorRuntime = `(()=>{
const presets={ocean:215,emerald:155,amber:35,violet:265,rose:340};
const styles=[...document.querySelectorAll('style')].map(node=>[node,node.textContent]);
function recolor(css,hue){return css.replace(/#([a-f0-9]{6}|[a-f0-9]{3})(?![a-f0-9])/gi,(original,hex)=>{
if(hex.length===3)hex=hex.split('').map(c=>c+c).join('');
const rgb=[0,2,4].map(i=>parseInt(hex.slice(i,i+2),16)/255),max=Math.max(...rgb),min=Math.min(...rgb),l=(max+min)/2;
if(max-min<.08||l<.06||l>.96)return original;
const s=(max-min)/(1-Math.abs(2*l-1));
const linear=c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4;
const lum=channels=>channels.reduce((total,c,i)=>total+linear(c)*[.2126,.7152,.0722][i],0);
const target=lum(rgb),h=hue/30;
function atLightness(light){const a=s*Math.min(light,1-light);return [0,8,4].map(n=>{const k=(n+h)%12;return light-a*Math.max(-1,Math.min(k-3,9-k,1))})}
let low=0,high=1;for(let i=0;i<18;i++){const mid=(low+high)/2;if(lum(atLightness(mid))<target)low=mid;else high=mid}
return 'hsl('+hue+' '+(s*100).toFixed(3)+'% '+((low+high)*50).toFixed(3)+'%)';
});}
addEventListener('message',event=>{if(event.source!==parent||event.data?.type!=='migbits-template-color')return;
const id=event.data.color;if(id!=='original'&&!Object.hasOwn(presets,id))return;
for(const [node,original] of styles)node.textContent=id==='original'?original:recolor(original,presets[id]);
document.documentElement.dataset.templateColor=id;
parent.postMessage({type:'migbits-template-color-applied',color:id,css:styles.map(([node])=>node.textContent).join('\\n')},'*');
});parent.postMessage({type:'migbits-template-color-ready'},'*');
})();`;
