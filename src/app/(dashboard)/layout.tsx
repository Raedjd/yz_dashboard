import "../globals.css";
import {ThemeProvider} from "next-themes";
import {AppShell} from "@/client/components/dashboard/AppShell";


export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <AppShell>{children}</AppShell>
        </ThemeProvider>
        </body>
        </html>
    );
}