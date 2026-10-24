"use client";
// Migbits preview composed with shadcn/ui (MIT); see ../ui/LICENSE.
import { Toaster, toast } from "../ui/toast";
import { Button } from "../ui/button";
export default function Example() {
  return (
    <Toaster>
      <div className="flex flex-wrap justify-center gap-3">
        <Button
          onClick={() =>
            toast.add({
              title: "A little progress.",
              description: "Your changes are saved in this preview.",
              type: "success",
            })
          }
        >
          Show toast
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.add({
              title: "Something needs attention.",
              description: "This is a preview error message.",
              type: "error",
            })
          }
        >
          Error state
        </Button>
      </div>
    </Toaster>
  );
}
