import {test,expect} from '@playwright/test';
import {libraryResources} from '../../lib/resource-library';

test('MotionSites prompt collection is searchable, attributed and source-copyable',async({page})=>{
 await page.goto('/library/prompts');await expect(page.locator('.mb-card')).toHaveCount(40);
 await page.getByRole('link',{name:/MigBits \/ AI Workflow Hero/}).first().click();
 await expect(page.getByText('MotionSites design · MigBits adaptation.',{exact:false})).toBeVisible();
 await page.getByRole('tab',{name:'Source',exact:true}).click();await expect(page.getByRole('option',{name:'MigBits-build-brief.md',exact:true})).toBeAttached();
 await expect(page.getByText('MigBits adaptation requirements',{exact:false})).toBeVisible();
});

test('All 40 imported prompt packages open isolated references without presenting them as tested applications',async({page})=>{
 for(const item of libraryResources.filter(r=>r.previewType==='design-prompt')){
  await page.goto('/library/resource/'+item.id);
  const frame=page.frameLocator('iframe');await expect(frame.locator('body')).toHaveAttribute('data-preview-state','rendered');
  await expect(page.locator('iframe')).toHaveAttribute('sandbox','allow-scripts');
  await expect(frame.locator('.head p')).toContainText(item.prompt!.previewMode==='live-adaptation'?'Live MigBits adaptation':'visual reference');
 }
});

test('Live workflow adaptation honors pause and reduced motion and opens its mobile menu',async({page})=>{
 await page.goto('/library/resource/motionsites-ai-workflow');const frame=page.frameLocator('iframe');
 await expect(frame.locator('#root')).toContainText('MigBits Flow');await frame.getByRole('button',{name:'Pause motion',exact:true}).click();await expect(frame.locator('html')).toHaveAttribute('data-motion','paused');
 await page.getByRole('button',{name:'Mobile preview',exact:true}).click();await frame.getByRole('button',{name:'Open menu'}).click();await expect(frame.getByRole('button',{name:'Close menu'})).toBeVisible();
 await frame.getByRole('button',{name:'Close menu'}).click();await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:900,height:900});await expect(frame.locator('html')).toHaveAttribute('data-reduced','true');
});
