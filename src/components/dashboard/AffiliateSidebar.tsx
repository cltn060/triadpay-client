"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Image from "next/image";
import { useSidebarClose } from "./DashboardShell";

const navItems = [
    { label: "Overview", icon: "dashboard", href: "/portal" },
    { label: "My Links", icon: "link", href: "/portal/links" },
    { label: "Payments", icon: "account_balance", href: "/portal/payments" },
    { label: "Earnings", icon: "payments", href: "/portal/earnings" },
    { label: "Settings", icon: "settings", href: "/portal/settings", showBadge: true },
];

export function AffiliateSidebar() {
    const pathname = usePathname();
    const closeSidebar = useSidebarClose();
    const params = useParams();
    const domain = params.domain as string;

    const store = useQuery(api.stores.getStoreBySlug, { slug: domain });
    const logoUrl = useQuery(
        api.stores.getLogoUrl,
        store?._id ? { storeId: store._id } : "skip"
    );
    const paymentStatus = useQuery(api.paymentsHelpers.getAffiliatePaymentStatus);

    // Check if onboarding needs attention
    const needsOnboardingAttention = paymentStatus !== undefined &&
        !paymentStatus?.connectedProviders?.some((p: { onboardingCompleted: boolean }) => p.onboardingCompleted);

    const storeName = store?.name ?? "Partner Hub";
    const initials = storeName.charAt(0).toUpperCase();

    return (
        <aside className="w-64 h-full flex flex-col justify-between border-r border-white/5 bg-background-dark relative z-20 transition-all duration-300">
            {/* Logo & Nav */}
            <div className="p-6">
                <Link
                    href={`/app/${domain}/portal`}
                    className="flex items-center gap-2 mb-10 group cursor-pointer"
                >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:ring-2 group-hover:ring-primary/50 transition-all ${
                        logoUrl 
                            ? (store?.logoHasWhiteBg ? "bg-white" : "bg-transparent")
                            : "bg-white/5"
                    }`}>
                        {store === undefined ? (
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
                            <span className="font-bold text-white text-sm">{initials}</span>
                        )}
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-white truncate">
                        {store === undefined ? (
                            <span className="block w-24 h-5 bg-white/10 rounded animate-pulse" />
                        ) : (
                            storeName
                        )}
                    </h1>
                </Link>

                <nav className="space-y-2">
                    {navItems.map((item) => {
                        const hrefStr = `/app/${domain}${item.href}`;
                        const isActive =
                            item.href === "/portal"
                                ? pathname === hrefStr
                                : pathname.startsWith(hrefStr);

                        return (
                            <Link
                                key={item.href}
                                href={hrefStr}
                                onClick={closeSidebar}
                                className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-200 group ${isActive
                                    ? "bg-white/5 text-white border border-white/5"
                                    : "text-text-grey hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <span
                                    className={`material-icons text-[20px] ${isActive
                                        ? ""
                                        : "group-hover:text-white transition-colors"
                                        }`}
                                >
                                    {item.icon}
                                </span>
                                <span className="font-medium text-sm flex-1">{item.label}</span>
                                {(item as any).showBadge && needsOnboardingAttention && (
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* User Profile */}
            <div className="p-4 mx-2 mb-2 bg-surface-dark rounded-xl border border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0df20d]/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-icons text-[#0df20d] text-xl">person</span>
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-white truncate">Affiliate</p>
                    <p className="text-xs text-text-grey truncate">
                        Partner Account
                    </p>
                </div>
                <SignOutButton signOutOptions={{ redirectUrl: `${typeof window !== "undefined" ? window.location.protocol : "https:"}//${process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000"}/` }}>
                    <button className="text-text-grey hover:text-white cursor-pointer">
                        <span className="material-icons text-[18px]">logout</span>
                    </button>
                </SignOutButton>
            </div>
        </aside>
    );
}
