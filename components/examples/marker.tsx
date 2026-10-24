"use client";
// Migbits preview composed with shadcn/ui (MIT); see ../ui/LICENSE.
import { Check, Clock } from "lucide-react";
import { Marker, MarkerIcon, MarkerContent } from "../ui/marker";
export default function Example() {
  return (
    <div className="grid w-full max-w-sm gap-8">
      <Marker variant="separator">
        <MarkerContent>Today, 10:42 AM</MarkerContent>
      </Marker>
      <Marker>
        <MarkerIcon>
          <Check />
        </MarkerIcon>
        <MarkerContent>All changes saved</MarkerContent>
      </Marker>
      <Marker variant="border">
        <MarkerIcon>
          <Clock />
        </MarkerIcon>
        <MarkerContent>A new chapter starts here</MarkerContent>
      </Marker>
    </div>
  );
}
