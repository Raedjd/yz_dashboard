import {
    Home,
    FileText,
    Settings,
    Database,
    Users,
    Package,
    CreditCard,
    Truck,
    BarChart3,
    ArrowRightLeft,
    type LucideIcon, Building2, Boxes,
} from "lucide-react";

export interface NavItem {
    title: string;
    url: string;
    icon: LucideIcon;
}

export interface Tenant {
    id: string;
    name: string;
    status: "connected" | "disconnected";
}

export const mainNavItems: NavItem[] = [
    { title: "Dashboard", url: "/", icon: Home },
    { title: "Sync Flow", url: "/sync-flow", icon: ArrowRightLeft },
];

export const administrationItems: NavItem[] = [
    { title: "Connections", url: "/dashboard/administrations/connections", icon: Database },
    { title: "Tenants Config", url: "/dashboard/administrations/tenants-config", icon: Building2 },
    { title: "Objects Config", url: "/dashboard/administrations/objects-config", icon: Boxes },
];

export const moduleItems: NavItem[] = [
    { title: "Documents", url: "/dashboard/modules/documents", icon: FileText },
    { title: "Customers", url: "/dashboard/modules/customers", icon: Users },
    { title: "Suppliers", url: "/dashboard/modules/suppliers", icon: Package },
    { title: "Analytical", url: "/dashboard/modules/analytical", icon: BarChart3 },
    { title: "Accounts", url: "/dashboard/modules/accounts", icon: CreditCard },
    { title: "Payments", url: "/dashboard/modules/payments", icon: CreditCard },
    { title: "Purchase Delivery Notes", url: "/dashboard/modules/purchase-delivery-notes", icon: Truck },
];

export const systemNavItems: NavItem[] = [
    { title: "Settings", url: "/settings", icon: Settings },
];