"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel, SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem, useSidebar,
} from "@/client/shared/components/ui/sidebar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/client/shared/components/ui/select";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/client/shared/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { mainNavItems, administrationItems ,moduleItems, systemNavItems, type Tenant } from "./NavItems";
import {cn} from "@client/lib/utils";

interface AppSidebarProps {
    tenants: Tenant[];
    selectedTenant: string;
    onTenantChange: (tenantId: string) => void;
}

export function AppSidebar({ tenants, selectedTenant, onTenantChange }: AppSidebarProps) {
    const pathname = usePathname();
    const [modulesOpen, setModulesOpen] = useState(true);
    const { state, isMobile } = useSidebar();
    const isCollapsed = state === "collapsed";
    return (
        <Sidebar>
            {/* Logo section */}
            <SidebarHeader className="p-4 border-b border-border">
                <div
                    className={cn(
                        "flex items-center gap-3",
                        (isCollapsed && !isMobile) && "justify-center"
                    )}
                >
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold text-lg shadow-lg shrink-0">
                        Y
                    </div>
                    {(!isCollapsed || isMobile) && (
                        <div className="min-w-0">
                            <h2 className="font-semibold text-foreground truncate">Yooz Portal</h2>
                            <p className="text-xs text-muted-foreground">Data Sync Manager</p>
                        </div>
                    )}
                </div>
            </SidebarHeader>
            <SidebarContent className="overflow-y-auto [&::-webkit-scrollbar]:hidden">
                {/* Tenant Selection */}
                <SidebarGroup>
                    <SidebarGroupLabel>Tenant</SidebarGroupLabel>
                    <SidebarGroupContent className="px-2">
                        <Select value={selectedTenant} onValueChange={onTenantChange}>
                            <SelectTrigger data-testid="select-tenant">
                                <SelectValue placeholder="Select tenant">
                                    {selectedTenant && tenants.find((t) => t.id === selectedTenant) && (
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`w-2 h-2 rounded-full ${
                                                    tenants.find((t) => t.id === selectedTenant)?.status === "connected"
                                                        ? "bg-green-500"
                                                        : "bg-red-500"
                                                }`}
                                            />
                                            <span>{tenants.find((t) => t.id === selectedTenant)?.name}</span>
                                        </div>
                                    )}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {tenants.map((tenant) => (
                                    <SelectItem key={tenant.id} value={tenant.id}>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`w-2 h-2 rounded-full ${
                                                    tenant.status === "connected" ? "bg-green-500" : "bg-red-500"
                                                }`}
                                            />
                                            <span>{tenant.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Main Navigation */}
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {mainNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Administration - Collapsible */}
                <Collapsible open={modulesOpen} onOpenChange={setModulesOpen}>
                    <SidebarGroup>
                        <CollapsibleTrigger asChild>
                            <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent flex items-center justify-between">
                                <span>Administration</span>
                                <ChevronDown className={`h-4 w-4 transition-transform ${modulesOpen ? "rotate-180" : ""}`} />
                            </SidebarGroupLabel>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {administrationItems.map((item) => (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild isActive={pathname === item.url}>
                                                <Link href={item.url}>
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </CollapsibleContent>
                    </SidebarGroup>
                </Collapsible>

                {/* Modules - Collapsible */}
                <Collapsible open={modulesOpen} onOpenChange={setModulesOpen}>
                    <SidebarGroup>
                        <CollapsibleTrigger asChild>
                            <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent flex items-center justify-between">
                                <span>Modules</span>
                                <ChevronDown className={`h-4 w-4 transition-transform ${modulesOpen ? "rotate-180" : ""}`} />
                            </SidebarGroupLabel>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {moduleItems.map((item) => (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild isActive={pathname === item.url}>
                                                <Link href={item.url}>
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </CollapsibleContent>
                    </SidebarGroup>
                </Collapsible>

                {/* System */}
                <SidebarGroup>
                    <SidebarGroupLabel>System</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {systemNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}