"use client";

import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { api } from "../../../../convex/_generated/api";
import { DashboardShell, useSidebarClose } from "@/components/dashboard/DashboardShell";

const navItems = [
    { href: "/", label: "Overview", icon: "dashboard" },
    { href: "/tenants", label: "Tenants", icon: "storefront" },
    { href: "/fees", label: "Fees", icon: "payments" },
    { href: "/transactions", label: "Transactions", icon: "receipt_long" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
    const pathname = usePathname();

    // Look up the Convex user to check accountType
    const convexUser = useQuery(
        api.memberships.getCurrentUser,
        isClerkLoaded && clerkUser ? {} : "skip"
    );

    const isUnauthorized = isClerkLoaded && convexUser !== undefined &&
        (!clerkUser || !convexUser || convexUser.accountType !== "ROOT_ADMIN");

    useEffect(() => {
        if (isUnauthorized) {
            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
            window.location.href = `https://${rootDomain}`;
        }
    }, [isUnauthorized]);

    if (!isClerkLoaded || convexUser === undefined || isUnauthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-dark">
                <p className="text-text-grey text-sm">Loading...</p>
            </div>
        );
    }

    return (
        <DashboardShell sidebar={<AdminSidebar pathname={pathname} email={convexUser?.email ?? ""} />}>
            <div className="p-8">
                {children}
            </div>
        </DashboardShell>
    );
}

function AdminSidebar({ pathname, email }: { pathname: string; email: string }) {
    const closeSidebar = useSidebarClose();

    return (
        <aside className="w-64 h-full flex flex-col justify-between border-r border-white/5 bg-background-dark">
            <div className="p-6">
                {/* Branding */}
                <div className="flex items-center gap-2 mb-10">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <span className="material-icons text-white/60 text-[18px]">admin_panel_settings</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <h1 className="text-base font-bold tracking-tight text-white truncate">Triadpay Admin</h1>
                        <p className="text-xs text-text-grey">Platform Management</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = item.href === "/"
                            ? pathname === "/" || pathname === "/app/admin"
                            : pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeSidebar}
                                className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-200 group ${
                                    isActive
                                        ? "bg-white/5 text-white border border-white/5"
                                        : "text-text-grey hover:text-white hover:bg-white/5"
                                }`}
                            >
                                <span className="material-icons text-[20px]">{item.icon}</span>
                                <span className="font-medium text-sm">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Footer: sign out */}
            <div className="p-4 mx-2 mb-2 bg-surface-dark rounded-xl border border-white/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-icons text-white/40 text-[18px]">person</span>
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-white truncate">Root Admin</p>
                    <p className="text-xs text-text-grey truncate">{email}</p>
                </div>
                <SignOutButton>
                    <button className="text-text-grey hover:text-white cursor-pointer" title="Sign out">
                        <span className="material-icons text-[18px]">logout</span>
                    </button>
                </SignOutButton>
            </div>
        </aside>
    );
}
