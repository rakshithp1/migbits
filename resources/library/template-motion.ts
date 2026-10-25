/** Original MigBits adaptation. No third-party animation engine. */
export const templateMotionCss = `
html{scroll-behavior:smooth;scroll-padding-top:80px}body{overflow-x:clip}img{object-fit:cover}
body[data-mb-template-edition]{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
:focus-visible{outline:3px solid #367aff!important;outline-offset:4px}
.mb-template-motion{position:fixed;bottom:16px;right:16px;z-index:2000;background:#10213c;color:white;border:1px solid #9bbcff66;border-radius:30px;padding:9px 14px;font:12px system-ui;box-shadow:0 5px 24px #0003}
.mb-template-status{font:13px/1.5 system-ui;color:inherit;margin-top:12px}
.mb-template-icon{display:inline-block;width:1em;height:1em;vertical-align:-.12em}
.mb-template-icon svg{width:100%;height:100%;fill:currentColor}
.mb-template-art{max-width:100%;height:auto}
.mb-template-zoom{max-width:min(1000px,92vw);border:0;border-radius:14px;padding:10px;background:#101827;color:white}
.mb-template-zoom::backdrop{background:#050a15ce}.mb-template-zoom img{max-width:100%;max-height:80vh}.mb-template-zoom button{display:block;margin:6px 0 6px auto}
@media(hover:hover) and (prefers-reduced-motion:no-preference){.btn{transition:box-shadow .25s,filter .25s}.btn:hover{filter:brightness(1.06);box-shadow:0 6px 20px #0002}.card,.portfolio-item{transition:box-shadow .3s}.card:hover,.portfolio-item:hover{box-shadow:0 12px 32px #1636671c}}
html[data-template-motion=paused] *{animation-play-state:paused!important;transition:none!important;scroll-behavior:auto!important}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{animation:none!important;transition:none!important}}
`;
export const templateMotionJs = `
(()=>{
const media=matchMedia('(prefers-reduced-motion:reduce)'),active=new Set(),seen=new WeakSet();let paused=false,lastFocus=null;
const toggle=document.createElement('button');toggle.className='mb-template-motion';toggle.type='button';document.body.append(toggle);
const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting||paused||media.matches)continue;observer.unobserve(entry.target);if(seen.has(entry.target))continue;seen.add(entry.target);const a=entry.target.animate([{opacity:.78,translate:'0 16px'},{opacity:1,translate:'0 0'}],{duration:700,easing:'cubic-bezier(.16,1,.3,1)'});active.add(a);a.finished.finally(()=>active.delete(a)).catch(()=>{});}},{threshold:.1});
function policy(){const stop=paused||media.matches;document.documentElement.dataset.templateMotion=stop?'paused':'running';toggle.textContent=media.matches?'Reduced motion':paused?'Resume motion':'Pause motion';toggle.disabled=media.matches;toggle.setAttribute('aria-pressed',String(stop));if(stop){active.forEach(a=>a.cancel());active.clear();}else document.querySelectorAll('header .container,section .row,article,.card,.portfolio-item').forEach(el=>{if(!seen.has(el))observer.observe(el);});}
toggle.onclick=()=>{paused=!paused;policy()};media.addEventListener('change',policy);policy();
function targetFor(button){const selector=button.getAttribute('data-bs-target')||button.getAttribute('href');return selector&&/^#[a-zA-Z][\\w-]*$/.test(selector)?document.querySelector(selector):null;}
function closeModals(){document.querySelectorAll('.modal.show').forEach(el=>{el.classList.remove('show');el.style.display='none';el.setAttribute('aria-hidden','true');el.removeAttribute('aria-modal');});document.querySelectorAll('.modal-backdrop').forEach(el=>el.remove());lastFocus?.focus();lastFocus=null;}
document.addEventListener('click',event=>{
const trigger=event.target.closest('[data-bs-toggle],[data-bs-dismiss]');if(trigger){const kind=trigger.getAttribute('data-bs-toggle'),target=targetFor(trigger);if(kind==='collapse'&&target){event.preventDefault();const show=target.classList.toggle('show');trigger.setAttribute('aria-expanded',String(show));}if(kind==='dropdown'){event.preventDefault();const menu=trigger.parentElement.querySelector('.dropdown-menu');if(menu)trigger.setAttribute('aria-expanded',String(menu.classList.toggle('show')));}if(kind==='modal'&&target){event.preventDefault();lastFocus=trigger;target.classList.add('show');target.style.display='block';target.setAttribute('aria-modal','true');target.removeAttribute('aria-hidden');target.setAttribute('role','dialog');target.tabIndex=-1;target.focus();const backdrop=document.createElement('div');backdrop.className='modal-backdrop fade show';document.body.append(backdrop);}if(trigger.hasAttribute('data-bs-dismiss'))closeModals();}
const anchor=event.target.closest('a');if(!anchor)return;const href=anchor.getAttribute('href')||'';
if(anchor.dataset.mbImage){event.preventDefault();const dialog=document.createElement('dialog');dialog.className='mb-template-zoom';const close=document.createElement('button');close.type='button';close.textContent='Close image';const image=document.createElement('img');image.src=anchor.dataset.mbImage;image.alt='Original MigBits demo artwork';dialog.append(close,image);document.body.append(dialog);close.onclick=()=>dialog.close();dialog.onclose=()=>dialog.remove();dialog.showModal();return;}
if(/^https?:|^mailto:|^tel:/.test(href)){event.preventDefault();return;}
if(href.startsWith('#')&&!anchor.hasAttribute('data-bs-toggle'))document.querySelectorAll('.navbar-collapse.show').forEach(el=>{el.classList.remove('show');document.querySelectorAll('.navbar-toggler').forEach(button=>button.setAttribute('aria-expanded','false'));});
});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeModals();if(event.key==='Tab'){const modal=document.querySelector('.modal.show');if(!modal)return;const focus=[...modal.querySelectorAll('button,a[href],input,select,textarea,[tabindex="0"]')].filter(el=>!el.disabled&&el.getClientRects().length);if(!focus.length){event.preventDefault();modal.focus();return;}const first=focus[0],last=focus[focus.length-1];if(event.shiftKey&&(document.activeElement===first||document.activeElement===modal)){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
document.addEventListener('submit',event=>{event.preventDefault();let status=event.target.querySelector('[role=status]');if(!status){status=document.createElement('p');status.setAttribute('role','status');status.className='mb-template-status';event.target.append(status);}status.textContent='Demo only — no information has been sent. Connect your own form backend.';});
document.querySelectorAll('form [type=submit]').forEach(button=>{button.disabled=false;button.classList.remove('disabled')});
document.body.dataset.previewState='rendered';
})();`;
