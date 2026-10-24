"use client";
// Migbits preview composed with shadcn/ui (MIT); see ../ui/LICENSE.
import { Avatar, AvatarFallback } from "../ui/avatar";
export default function Example() {
  return (
    <div className="flex items-center gap-5">
      {["MK", "AR", "JD"].map((name, i) => (
        <Avatar key={name} className={i === 0 ? "size-16" : "size-11"}>
          <AvatarFallback>{name}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  );
}
