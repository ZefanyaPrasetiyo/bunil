"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  LogOut,
} from "lucide-react"

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

type Role = "ADMIN" | "USER"

type NavItem = {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  // roles yang boleh melihat menu ini. Jika undefined -> semua role boleh.
  roles?: Role[]
}

const navItems: NavItem[] = [
  {
    title: "Manajemen Akun",
    url: "/dashboard",
    icon: BookOpen,
    roles: ["ADMIN"],
  },
  {
    title: "Master Mapel",
    url: "/dashboard/master-mapel",
    icon: BookOpen,
    roles: ["ADMIN"],
  },
  {
    title: "Nilai Siswa",
    url: "/dashboard/nilai-siswa",
    icon: ClipboardList,
    roles: ["ADMIN"],
  },
  {
    title: "Nilai Saya",
    url: "/dashboard/nilai-saya",
    icon: GraduationCap,
    roles: ["USER"],
  },
]

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
  const pathname = usePathname()

  // Ambil session dari better-auth. Sesuaikan nama field kalau berbeda
  // (misal session.data.user.role).
  const { data: session } = authClient.useSession()

  const user = session?.user as
    | { name?: string; email?: string; role?: Role }
    | undefined

  const role: Role = (user?.role as Role) ?? "USER"
  const displayName = user?.name ?? "User"

 const logout = async () => {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        router.push("/login")
      },
      onError: (ctx) => {
        console.error("Logout gagal:", ctx.error)
      },
    },
  })
}

  // Filter menu sesuai role user yang sedang login
  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true
    return item.roles.includes(role)
  })

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-3 rounded-lg border border-sidebar-border/60 bg-sidebar-accent/10 px-3 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary dark:bg-accent/10 dark:text-accent">
            {getInitials(displayName)}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              {displayName}
            </span>
            <span className="truncate text-xs text-sidebar-foreground/60">
              {role}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => (
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
                    logout()
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