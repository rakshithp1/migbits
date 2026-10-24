// Example derived from shadcn/ui (MIT). See ../ui/LICENSE and ../ui/ORIGIN.json.
"use client";

import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

export default function SwitchDemo() {
  return (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  );
}
