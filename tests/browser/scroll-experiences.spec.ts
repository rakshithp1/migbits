import {test,expect} from '@playwright/test';
import {scrollDesigns} from '../../resources/library/scroll-experiences';
for(const design of scrollDesigns)test(`${design.slug}: realistic scroll story, accessible static fallback and mobile`,async({page})=>{
 await page.setViewportSize({width:1440,height:960});await page.goto(`/library/previews/scroll/${design.slug}.html`);
 await expect(page.locator('body')).toHaveAttribute('data-preview-state','rendered');
 await expect(page.locator('.hero')).toBeVisible();
 for(const image of await page.locator('img').all())expect(await image.evaluate((e:HTMLImageElement)=>e.complete&&e.naturalWidth>0)).toBe(true);
 const scroll=async(p:number)=>{await page.evaluate(p=>{const s=document.querySelector<HTMLElement>('.scroll-story')!;scrollTo({top:s.offsetTop+(s.offsetHeight-innerHeight)*p,behavior:'instant'})},p);await page.waitForTimeout(150)};
 await scroll(.12);const before=await page.locator('.story-art').evaluate(e=>e.style.transform);
 await scroll(.85);await expect(page.locator('html')).toHaveAttribute('data-chapter','3');expect(await page.locator('.story-art').evaluate(e=>e.style.transform)).not.toBe(before);
 await page.locator('.motion-toggle').evaluate((e:HTMLButtonElement)=>e.click());const frozen=await page.locator('.story-art').evaluate(e=>e.style.transform);await scroll(.25);expect(await page.locator('.story-art').evaluate(e=>e.style.transform)).toBe(frozen);
 await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator('html')).toHaveAttribute('data-reduced','true');expect(await page.locator('.story-stage').evaluate(e=>getComputedStyle(e).position)).toBe('relative');
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo(0,0));expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 if(design.theme==='software'){const tabs=page.locator('.hero .app-tabs');await tabs.getByRole('tab',{name:'Roadmap'}).click();await expect(page.locator('#hero-view-roadmap')).toBeVisible();await tabs.getByRole('tab',{name:'Roadmap'}).press('ArrowRight');await expect(page.locator('#hero-view-activity')).toBeVisible()}
});

test('Rejected sector templates have no public resources or downloads',async({request})=>{
 for(const slug of ['relay-software','cascade-automation','prism-analytics','haven-security','syntax-api','papertrail-knowledge','velocity-running','concrete-sneakers','form-footwear','squeeze-citrus','popwave-soda','stillwater-tea']){
  expect((await request.get(`/library/resource/template-${slug}`)).status()).toBe(404);
  expect((await request.get(`/library/downloads/template-${slug}.zip`)).status()).toBe(404);
 }
});
