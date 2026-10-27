import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {unzipSync,strFromU8} from 'fflate';
import {libraryResources,resourceUsage} from '../lib/resource-library';
import inventory from '../catalog/motionsites-import-inventory.json';
import proof from '../catalog/motionsites-preview-validation.json';

test('MotionSites free export retains all 40 original prompts and separate licensed adaptations',()=>{
 const records=libraryResources.filter(r=>r.previewType==='design-prompt');assert.equal(records.length,40);
 for(const item of records){
  const original=inventory.records.find(r=>r.id===item.id)!;assert.ok(original);
  const zip=unzipSync(readFileSync('public'+item.downloadUrl));const source=strFromU8(zip['original/MotionSites-prompt.md']);
  assert.equal(createHash('sha256').update(source).digest('hex'),original.sha256);
  assert.match(strFromU8(zip['MigBits-build-brief.md']),/MigBits adaptation requirements/);
  assert.match(strFromU8(zip['DISTRIBUTION-NOTICE.txt']),/Copyright MotionSites/);
  assert.ok(zip['UPSTREAM-LICENSE.txt']);assert.equal(item.license,'LicenseRef-MotionSites-Distribution');assert.equal(resourceUsage(item).saleOfCopies,false);
  assert.equal(item.template,undefined,'A prompt is not a complete template kit');
  assert.ok(!Object.keys(zip).some(name=>/authorization|contract|\.env|private-license/i.test(name)));
  const checked=proof.find(p=>p.id===item.id)!;assert.equal(checked.status,'passed');
  for(const [url,digest] of Object.entries(checked.artifacts!))assert.equal(createHash('sha256').update(readFileSync('public'+url)).digest('hex'),digest,item.id+' '+url);
 }
 assert.equal(records.filter(r=>r.prompt?.implementation==='sandbox-built').length,1);
 assert.equal(records.filter(r=>r.prompt?.previewMode==='unavailable').length,3);
});
