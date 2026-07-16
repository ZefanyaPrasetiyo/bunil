"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { ThemeToggle } from "@/components/ui/themetoggle"
import { Separator } from "@/components/ui/separator"
import { useEffect } from "react"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {

  useEffect(() => {
  async function getSession() {
    const res = await fetch("/api/session", {
      credentials: "include",
    });

    const session = await res.json();

    console.log(session);
  }

  getSession();
}, []);
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className=" h-4" />
          <ThemeToggle />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}