"use client";
// Migbits preview composed with shadcn/ui (MIT); see ../ui/LICENSE.
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from "../ui/message-scroller";
export default function Example() {
  return (
    <div className="h-72 w-full max-w-sm overflow-hidden rounded-xl border p-4">
      <MessageScrollerProvider>
        <MessageScroller>
          <MessageScrollerViewport>
            <MessageScrollerContent className="gap-4">
              {Array.from({ length: 12 }, (_, i) => (
                <MessageScrollerItem key={i}>
                  <div className="rounded-lg bg-muted p-4 text-sm">
                    <strong>Chapter {i + 1}</strong>
                    <p className="mt-2 text-muted-foreground">
                      A small detail. A better experience.
                    </p>
                  </div>
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton direction="end" />
        </MessageScroller>
      </MessageScrollerProvider>
    </div>
  );
}
