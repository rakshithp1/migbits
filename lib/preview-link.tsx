// Portable link adapter for shadcn/ui's MIT examples.
import type { ComponentProps } from "react";
export default function PreviewLink({ href, ...props }: ComponentProps<"a">) {
  const target = href?.startsWith("/docs")
    ? `https://ui.shadcn.com${href}`
    : href;
  return (
    <a
      {...props}
      href={target}
      target={target?.startsWith("https://") ? "_blank" : undefined}
      rel={target?.startsWith("https://") ? "noreferrer" : undefined}
    />
  );
}
