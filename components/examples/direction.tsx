"use client";
// Migbits preview composed with shadcn/ui (MIT); see ../ui/LICENSE.
import { useState } from "react";
import { DirectionProvider } from "../ui/direction";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
export default function Example() {
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");
  return (
    <div className="grid w-full max-w-sm gap-5">
      <DirectionProvider dir={direction}>
        <div dir={direction} className="grid gap-3">
          <label htmlFor="direction-name">
            {direction === "rtl" ? "الاسم" : "Your name"}
          </label>
          <Input
            id="direction-name"
            placeholder={direction === "rtl" ? "مرحباً" : "Hello there"}
          />
        </div>
      </DirectionProvider>
      <Button
        variant="outline"
        onClick={() => setDirection(direction === "ltr" ? "rtl" : "ltr")}
      >
        Switch to {direction === "ltr" ? "right-to-left" : "left-to-right"}
      </Button>
    </div>
  );
}
