// Class merging helper for the shadcn/ui-derived components. See components/ui/LICENSE.
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
