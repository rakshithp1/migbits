// Lucide adapter for shadcn/ui's registry icon placeholders (MIT).
import {
  CheckIcon,
  CopyIcon,
  XIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
  ChevronRightIcon,
  type LucideProps,
} from "lucide-react";

const icons = {
  CheckIcon,
  CopyIcon,
  XIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
  ChevronRightIcon,
};
export function IconPlaceholder({
  lucide,
  hugeicons,
  tabler,
  phosphor,
  remixicon,
  ...props
}: LucideProps & {
  lucide?: string;
  hugeicons?: string;
  tabler?: string;
  phosphor?: string;
  remixicon?: string;
}) {
  void hugeicons;
  void tabler;
  void phosphor;
  void remixicon;
  const Icon = icons[lucide as keyof typeof icons] ?? InfoIcon;
  return <Icon {...props} />;
}
