"use client";
// Migbits preview composed with shadcn/ui (MIT); see ../ui/LICENSE.
import { Check, Search, Package } from "lucide-react";
import {
  Trace,
  TraceLine,
  TraceIcon,
  TraceTitle,
  TraceDescription,
  TraceCollapsible,
  TraceCollapsibleTrigger,
  TraceCollapsibleContent,
} from "../ui/trace";
export default function Example() {
  return (
    <Trace className="max-w-sm gap-4">
      <TraceLine>
        <TraceIcon>
          <Search />
        </TraceIcon>
        <TraceTitle>Found the right pieces</TraceTitle>
        <TraceDescription>0.2 s</TraceDescription>
      </TraceLine>
      <TraceCollapsible>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon>
              <Package />
            </TraceIcon>
            <TraceTitle>Composed the interface</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <p className="py-4 pl-7 text-sm text-muted-foreground">
            Buttons, surfaces and considered spacing. Click again to collapse
            this detail.
          </p>
        </TraceCollapsibleContent>
      </TraceCollapsible>
      <TraceLine>
        <TraceIcon>
          <Check />
        </TraceIcon>
        <TraceTitle>Ready for your next idea</TraceTitle>
      </TraceLine>
    </Trace>
  );
}
