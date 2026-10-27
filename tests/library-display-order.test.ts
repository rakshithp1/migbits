import test from "node:test";
import assert from "node:assert/strict";
import { findLibraryResources } from "../lib/resource-library";
test("Editorial gallery order puts visually reviewed showcases before basic examples", () => {
  const resources = findLibraryResources();
  assert.equal(resources[0].id, "template-aperture-os");
  assert.ok(resources.findIndex(r => r.id === "magic-ui--globe") < resources.findIndex(r => r.id === "component-accordion"));
  assert.equal(new Set(resources.map(r => r.id)).size, resources.length);
});
