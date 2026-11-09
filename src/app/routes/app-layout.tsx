import {BarChart3, Play, TestTubes} from "lucide-react"
import {NavLink, Outlet, useLocation} from "react-router"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"

const navigationItems = [
    {label: "Dashboard", to: "/", icon: BarChart3},
    {label: "Experiments", to: "/experiments", icon: TestTubes},
    {label: "Runs", to: "/runs", icon: Play},
]

export default function AppLayout() {
    const location = useLocation()

    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader className="border-b">
                    <div className="flex h-8 items-center px-2 text-sm font-semibold">
                        Omen
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Application</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {navigationItems.map((item) => (
                                    <SidebarMenuItem key={item.to}>
                                        <SidebarMenuButton
                                            isActive={
                                                item.to === "/"
                                                    ? location.pathname === "/"
                                                    : location.pathname.startsWith(item.to)
                                            }
                                            render={<NavLink to={item.to}/>}
                                            tooltip={item.label}
                                        >
                                            <item.icon/>
                                            <span>{item.label}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
            <SidebarInset>
                <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger/>
                    <div className="text-sm font-medium">
                        {location.pathname.startsWith("/experiments")
                            ? "Experiments"
                            : location.pathname.startsWith("/runs")
                              ? "Runs"
                              : "Dashboard"}
                    </div>
                </header>
                <Outlet/>
            </SidebarInset>
        </SidebarProvider>
    )
}
