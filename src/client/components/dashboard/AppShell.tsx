"use client";

import { useState } from "react";

import {Tenant} from "@/client/components/dashboard/NavItems";
import {AppSidebar} from "@/client/components/dashboard/Sidebar";
import {Navbar} from "@/client/components/dashboard/Navbar";
import {SidebarInset, SidebarProvider} from "@/client/shared/components/ui/sidebar";
import {Toaster} from "@client/shared/components/ui/toaster";


// TODO: replace with real tenant data (fetched or passed down from a server component)
const tenants: Tenant[] = [];

export function AppShell({ children }: { children: React.ReactNode }) {
    const [selectedTenant, setSelectedTenant] = useState("");

    return (
        <SidebarProvider>
            <AppSidebar
                tenants={tenants}
                selectedTenant={selectedTenant}
                onTenantChange={setSelectedTenant}
            />
            <SidebarInset>
                <Navbar />
                <main className="flex-1">{children}</main>
                <Toaster />
            </SidebarInset>
        </SidebarProvider>
    );
}
