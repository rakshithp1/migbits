// Example derived from shadcn/ui (MIT). See ../ui/LICENSE and ../ui/ORIGIN.json.
"use client";

import { BookmarkIcon } from "lucide-react";

import { Toggle } from "../ui/toggle";

export default function ToggleDemo() {
  return (
    <Toggle
      aria-label="Toggle bookmark"
      size="sm"
      variant="outline"
      className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-blue-500 data-[state=on]:*:[svg]:stroke-blue-500"
    >
      <BookmarkIcon />
      Bookmark
    </Toggle>
  );
}
