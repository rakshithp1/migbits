"use client";
// Migbits preview composed with shadcn/ui (MIT); see ../ui/LICENSE.
import { toast } from "sonner";
import { Toaster } from "../ui/sonner";
import { Button } from "../ui/button";
export default function Example() {
  return (
    <>
      <Toaster />
      <div className="flex flex-wrap justify-center gap-3">
        <Button
          onClick={() =>
            toast.success("That worked.", {
              description: "One thoughtful detail at a time.",
            })
          }
        >
          Success notification
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast("An idea worth keeping.", {
              action: { label: "Dismiss", onClick: () => {} },
            })
          }
        >
          With action
        </Button>
      </div>
    </>
  );
}
