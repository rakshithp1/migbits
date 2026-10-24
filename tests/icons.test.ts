import {test} from "node:test";
import assert from "node:assert/strict";
import {createAttributedIconSvg} from "../services/icon-export";
test("icon export retains source attribution and escapes metadata as XML text",()=>{const output=createAttributedIconSvg('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>','Copyright A & B. </metadata><script>bad</script>','1.0.0');assert.ok(output.includes('Source: Lucide Icons (1.0.0)'));assert.ok(output.includes('Copyright A &amp; B.'));assert.ok(output.includes('&lt;script&gt;bad&lt;/script&gt;'));assert.equal(output.includes('<script>'),false);assert.ok(output.endsWith('<path d="M0 0"/></svg>'));});
test("icon export refuses missing source or missing license notice",()=>{assert.throws(()=>createAttributedIconSvg('','license','1'));assert.throws(()=>createAttributedIconSvg('<svg/>','','1'));});
