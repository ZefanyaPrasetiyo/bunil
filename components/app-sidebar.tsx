"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  LogOut,
} from "lucide-react"
import { useRouter } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth-client"

type NavItem = {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  {
    title: "Manajemen Akun",
    url: "/dashboard",
    icon: BookOpen,
  },
  {
    title: "Master Mapel",
    url: "/dashboard/master-mapel",
    icon: BookOpen,
  },
  {
    title: "Nilai Siswa",
    url: "/dashboard/nilai-siswa",
    icon: ClipboardList,
  },
  {
    title: "Nilai Saya",
    url: "/dashboard/nilai-saya",
    icon: GraduationCap,
  },
]

// TODO: ganti dengan data user asli dari session/auth kamu.
const currentUser = {
  name: "Ahsan",
  role: "Guru",
}




function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
const router = useRouter()
  const logout = async() => {
  await authClient.signOut({
  fetchOptions: {
    onSuccess: () => {
      router.push("/login"); // redirect to login page
    },
  },
});
}
  const pathname = usePathname()

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-3 rounded-lg border border-sidebar-border/60 bg-sidebar-accent/10 px-3 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary dark:bg-accent/10 dark:text-accent">
            {getInitials(currentUser.name)}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              {currentUser.name}
            </span>
            <span className="truncate text-xs text-sidebar-foreground/60">
              {currentUser.role}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={pathname === item.url}
                    render={<a href={item.url} />}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              render={
                <button
                  type="button"
                  onClick={() => {
                    logout();
                  }}
                />
              }
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}