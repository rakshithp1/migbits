// Example derived from shadcn/ui (MIT). See ../ui/LICENSE and ../ui/ORIGIN.json.
"use client";

import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

export default function LabelDemo() {
  return (
    <div>
      <div className="flex items-center space-x-2">
        <Checkbox id="terms" />
        <Label htmlFor="terms">Accept terms and conditions</Label>
      </div>
    </div>
  );
}
