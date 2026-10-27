/** Original continuously advected value-noise field; no video or repeating timeline. MIT. */
export const smokeRuntime = `
function createSmoke(canvas){
 const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)return null;
 canvas.width=240;canvas.height=80;const w=canvas.width,h=canvas.height,image=ctx.createImageData(w,h),pixels=image.data;
 const probe=document.createElement('canvas');probe.width=probe.height=1;const colors=probe.getContext('2d');let dark=[.3,.01,.05],light=[1,.42,.34];
 function palette(){const style=getComputedStyle(canvas);function read(name,fallback){const value=style.getPropertyValue(name).trim();if(!value)return fallback;colors.fillStyle=value;colors.fillRect(0,0,1,1);const p=colors.getImageData(0,0,1,1).data;return [p[0]/255,p[1]/255,p[2]/255]}dark=read('--smoke-deep',dark);light=read('--smoke-glow',light)}
 function hash(x,y){let n=Math.imul(x,374761393)^Math.imul(y,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295}
 function noise(x,y){const ix=Math.floor(x),iy=Math.floor(y);let a=x-ix,b=y-iy;a=a*a*(3-2*a);b=b*b*(3-2*b);const p=hash(ix,iy),q=hash(ix+1,iy),r=hash(ix,iy+1),s=hash(ix+1,iy+1);return p+(q-p)*a+(r-p)*b+(p-q-r+s)*a*b}
 function fbm(x,y){let n=0,a=.55;for(let i=0;i<4;i++){n+=a*noise(x,y);const nx=x*.8-y*.6,ny=x*.6+y*.8;x=nx*2.03+7.4;y=ny*2.03+3.1;a*=.5}return n}
 const clamp=x=>Math.max(0,Math.min(1,x));function smooth(a,b,x){x=clamp((x-a)/(b-a));return x*x*(3-2*x)}
 function render(time){for(let y=0;y<h;y++){const v=1-y/(h-1);for(let x=0;x<w;x++){const u=x/(w-1),px=u*3.8+time*.025,py=v*1.8;const q=fbm(px+time*.013,py+time*.009),r=fbm(px+4.7-time*.008,py+3.1+time*.014);const f=fbm(px+q*3.2,py+r*3.2-time*.016),ridge=Math.pow(Math.max(0,1-Math.abs(f*2-1)),5),blend=Math.pow(clamp(f),.6);const mask=smooth(.04,.94,u)*Math.pow(1-v,.65),band=Math.exp(-Math.pow(v-.28-.17*Math.sin(u*5.4+q*3),2)/.19),density=smooth(.22,.73,f)*mask*band*1.65;const i=(y*w+x)*4;for(let c=0;c<3;c++)pixels[i+c]=255*clamp((dark[c]+(light[c]-dark[c])*blend+light[c]*ridge*.16)*density);pixels[i+3]=255}}ctx.putImageData(image,0,0);canvas.dataset.frames=String(Number(canvas.dataset.frames||0)+1);canvas.dataset.elapsed=time.toFixed(3)}
 palette();return {render,palette};
}
`;
