"use client";
// Migbits preview composed with shadcn/ui (MIT); see ../ui/LICENSE.
import { AspectRatio } from "../ui/aspect-ratio";
export default function Example() {
  return (
    <div className="w-full max-w-sm">
      <AspectRatio ratio={16 / 9}>
        <div className="relative flex h-full w-full items-end justify-between overflow-hidden rounded-xl bg-gradient-to-br from-violet-900 via-purple-500 to-fuchsia-200 p-6 text-white">
          <span className="max-w-40 text-xl leading-tight italic">
            Room for a different perspective.
          </span>
          <b className="font-mono text-xs font-normal">16 : 9</b>
        </div>
      </AspectRatio>
    </div>
  );
}
