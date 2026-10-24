"use client";
// Migbits composition with shadcn/ui (MIT). See ../ui/LICENSE and ORIGIN.json.
import { useState } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import { Button } from "../ui/button";

export default function ButtonDemo() {
  const [clicks, setClicks] = useState(0);
  return (
    <div className="grid gap-7 text-center">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => setClicks((value) => value + 1)}>
          Make it happen <ArrowUpRight />
        </Button>
        <Button variant="outline" onClick={() => setClicks(0)}>
          Start again
        </Button>
        <Button
          variant="secondary"
          size="icon"
          aria-label="Add one"
          onClick={() => setClicks((value) => value + 1)}
        >
          <Plus />
        </Button>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setClicks((value) => value + 1)}
        >
          A quieter action
        </Button>
        <Button disabled size="sm">
          Not just yet
        </Button>
      </div>
      <p className="text-xs text-muted-foreground" role="status">
        {clicks
          ? `${clicks} little step${clicks === 1 ? "" : "s"} forward.`
          : "A few good options. Give one a click."}
      </p>
    </div>
  );
}
