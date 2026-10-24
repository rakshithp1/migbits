"use client";
// Migbits preview composed with shadcn/ui (MIT); see ../ui/LICENSE.
import { useState } from "react";
import { Home, Folder, Settings } from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "../ui/sidebar";
export default function Example() {
  const [selected, setSelected] = useState("Overview");
  return (
    <SidebarProvider
      className="relative min-h-0 overflow-hidden rounded-xl border"
      style={{ minHeight: 300 }}
    >
      <Sidebar collapsible="none" className="w-44 border-r">
        <SidebarHeader className="p-4 font-semibold">Studio /</SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarMenu>
              {[
                ["Overview", Home],
                ["Projects", Folder],
                ["Settings", Settings],
              ].map(([label, Icon]) => (
                <SidebarMenuItem key={String(label)}>
                  <SidebarMenuButton
                    isActive={selected === label}
                    onClick={() => setSelected(String(label))}
                  >
                    {typeof Icon !== "string" && <Icon />}
                    <span>{String(label)}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-4 text-xs text-muted-foreground">
          Made for your workflow.
        </SidebarFooter>
      </Sidebar>
      <div className="flex flex-1 flex-col justify-center gap-2 p-6">
        <span className="text-xs text-muted-foreground">YOUR WORKSPACE</span>
        <h3 className="text-2xl font-medium">{selected}</h3>
        <p className="text-sm text-muted-foreground">
          Room for the next good idea.
        </p>
      </div>
    </SidebarProvider>
  );
}
