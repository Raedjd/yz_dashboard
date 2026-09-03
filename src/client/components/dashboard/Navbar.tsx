"use client";

import { Moon, Sun, User, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { SidebarTrigger } from "@/client/shared/components/ui/sidebar";
import { Button } from "@/client/shared/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/client/shared/components/ui/dropdown-menu";
import { getUserInfo, logout } from "@/client/services/authorization/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function Navbar() {
    const { theme, setTheme } = useTheme();

    const [userInfo, setUserInfo] = useState<{
        username: string | null;
        email: string | null;
        tenantId: string | null;
    }>({
        username: null,
        email: null,
        tenantId: null,
    });

    useEffect(() => {
        const info = getUserInfo();
        setUserInfo(info);
    }, []);

    const router = useRouter();
    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <header className="flex h-14 items-center justify-between border-b bg-background px-4">
            <SidebarTrigger />

            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    aria-label="Toggle theme"
                    className="relative"
                >
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Menu utilisateur">
                            <User className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="flex flex-col">
                            <span className="truncate font-medium">
                                {userInfo.username ?? "Utilisateur"}
                            </span>
                            {userInfo.email && (
                                <span className="text-xs font-normal text-muted-foreground truncate">
                                    {userInfo.email}
                                </span>
                            )}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}