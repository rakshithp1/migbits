"use client";
// Migbits preview composed with shadcn/ui (MIT); see ../ui/LICENSE.
import { Bubble, BubbleGroup, BubbleContent } from "../ui/bubble";
export default function Example() {
  return (
    <BubbleGroup className="w-full max-w-sm space-y-4">
      <Bubble>
        <BubbleContent>
          What if the little details made all the difference?
        </BubbleContent>
      </Bubble>
      <Bubble className="ml-auto">
        <BubbleContent className="bg-primary text-primary-foreground">
          Let?s build something considered.
        </BubbleContent>
      </Bubble>
    </BubbleGroup>
  );
}
