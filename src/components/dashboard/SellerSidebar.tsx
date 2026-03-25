"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useStoreContext } from "@/providers/store-context";
import { useTranslations } from "next-intl";
import { useSidebarClose } from "./DashboardShell";

export function SellerSidebar() {
    const pathname = usePathname();
    const closeSidebar = useSidebarClose();
    const t = useTranslations("DashboardSidebar");

    const navItems = [
        { label: t("overview"), icon: "dashboard", href: "/seller" },
        { label: t("transactions"), icon: "receipt_long", href: "/seller/transactions" },
        { label: t("earnings"), icon: "account_balance_wallet", href: "/seller/earnings" },
        { label: t("products"), icon: "inventory_2", href: "/seller/products" },
        { label: t("checkout"), icon: "shopping_cart", href: "/seller/checkout" },
        { label: t("affiliates"), icon: "group", href: "/seller/affiliates" },
        // { label: "Payouts", icon: "account_balance_wallet", href: "/seller/payouts" }, // TODO: implement payouts
        { label: t("payments"), icon: "payments", href: "/seller/payments" },
        { label: t("settings"), icon: "settings", href: "/seller/settings" },
    ];

    const { store } = useStoreContext();
    const logoUrl = useQuery(
        api.stores.getLogoUrl,
        store?._id ? { storeId: store._id } : "skip"
    );

    const storeName = store?.name ?? "Dashboard";
    // First letter fallback
    const initials = storeName.charAt(0).toUpperCase();

    return (
        <aside className="w-64 h-full flex flex-col justify-between border-r border-white/5 bg-background-dark relative z-20 transition-all duration-300">
            {/* Logo & Nav */}
            <div className="p-6">
                <Link href="/" className="flex items-center gap-2 mb-10 group cursor-pointer">
                    {/* Store Logo */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:ring-2 group-hover:ring-primary/50 transition-all ${
                        logoUrl 
                            ? (store?.logoHasWhiteBg ? "bg-white" : "bg-transparent")
                            : "bg-white"
                    }`}>
                        {!store ? (
                            // Loading skeleton
                            <div className="w-full h-full bg-white/10 animate-pulse" />
                        ) : logoUrl ? (
                            <Image
                                src={logoUrl}
                                alt={storeName}
                                width={32}
                                height={32}
                                className="w-full h-full object-contain p-0.5"
                            />
                        ) : (
                            // Initial fallback
                            <span className="font-bold text-black text-sm">{initials}</span>
                        )}
                    </div>

                    {/* Store Name */}
                    <h1 className="text-xl font-bold tracking-tight text-white truncate">
                        {!store ? (
                            <span className="block w-24 h-5 bg-white/10 rounded animate-pulse" />
                        ) : (
                            storeName
                        )}
                    </h1>
                </Link>

                <nav className="space-y-2">
                    {navItems.map((item) => {
                        const isActive =
                            item.href === "/seller"
                                ? pathname === "/seller"
                                : pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeSidebar}
                                className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-200 group ${isActive
                                    ? "bg-white/5 text-white border border-white/5"
                                    : "text-text-grey hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <span
                                    className={`material-icons text-[20px] ${isActive ? "text-primary" : "group-hover:text-white transition-colors"
                                        }`}
                                >
                                    {item.icon}
                                </span>
                                <span className="font-medium text-sm">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* User Profile */}
            <div className="p-4 mx-2 mb-2 bg-surface-dark rounded-xl border border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-icons text-white/40 text-[20px]">person</span>
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-white truncate">{storeName}</p>
                    <p className="text-xs text-text-grey truncate">{t("storeOwner")}</p>
                </div>
                <SignOutButton signOutOptions={{ redirectUrl: `${typeof window !== "undefined" ? window.location.protocol : "https:"}//${process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000"}/` }}>
                    <button className="text-text-grey hover:text-white cursor-pointer" title={t("logout")}>
                        <span className="material-icons text-[18px]">logout</span>
                    </button>
                </SignOutButton>
            </div>
        </aside>
    );
}
