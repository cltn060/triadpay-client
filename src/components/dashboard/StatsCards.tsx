"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useTranslations } from "next-intl";
import React, { useRef, useState } from "react";

function fmt(cents: number) {
    return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-white/5 rounded ${className ?? ""}`} />;
}

function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    const divRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setOpacity(1)}
            onMouseLeave={() => setOpacity(0)}
            className={`group relative rounded-2xl bg-white/5 ${className}`}
        >
            {/* Dynamic Border Glow */}
            <div
                className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 rounded-2xl"
                style={{
                    opacity,
                    background: `radial-gradient(450px circle at ${position.x}px ${position.y}px, rgba(var(--color-primary-rgb), 0.6), transparent 40%)`,
                }}
            />
            {/* Inner background block (clips the inner gradient to faux-1px border) */}
            <div className="absolute inset-[1px] z-0 rounded-2xl bg-[#121212]" />
            {/* Subtle Inner Interior Glow */}
            <div
                className="pointer-events-none absolute inset-[1px] z-0 transition-opacity duration-300 rounded-2xl"
                style={{
                    opacity,
                    background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(var(--color-primary-rgb), 0.05), transparent 40%)`,
                }}
            />
            <div className="relative z-10 flex h-full flex-col p-6">
                {children}
            </div>
        </div>
    );
}

export function StatsCards() {
    const t = useTranslations("DashboardStats");
    const data = useQuery(api.transactions.getSellerTransactions);
    const products = useQuery(api.products.getMyProducts);

    const stats = data?.stats;
    const txns = data?.transactions ?? [];

    // Volume today vs yesterday for trend
    const now = Date.now();
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const yesterdayStart = todayStart - 86_400_000;
    const todayRevenue = txns
        .filter((t) => t.status === "PAID" || t.status === "SETTLED")
        .filter((t) => (t.createdAt ?? 0) >= todayStart)
        .reduce((s, t) => s + t.amountTotalCents, 0);
    const yesterdayRevenue = txns
        .filter((t) => t.status === "PAID" || t.status === "SETTLED")
        .filter((t) => {
            const ts = t.createdAt ?? 0;
            return ts >= yesterdayStart && ts < todayStart;
        })
        .reduce((s, t) => s + t.amountTotalCents, 0);
    const trendPct =
        yesterdayRevenue > 0
            ? (((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100).toFixed(1)
            : null;

    const isLoading = data === undefined;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Revenue */}
            <SpotlightCard>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-500 text-sm font-medium mb-1">{t("totalRevenue")}</p>
                        {isLoading ? (
                            <Skeleton className="h-9 w-40 mt-1" />
                        ) : (
                            <h3 className="text-3xl font-bold text-white tracking-tight">
                                {fmt(stats?.totalRevenueCents ?? 0)}
                            </h3>
                        )}
                    </div>
                    <div className="bg-primary/10 p-2 rounded-xl">
                        <span className="material-icons text-primary text-xl">account_balance_wallet</span>
                    </div>
                </div>
                <div className="flex items-end justify-between">
                    {isLoading ? (
                        <Skeleton className="h-6 w-20" />
                    ) : trendPct !== null ? (
                        <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full border ${parseFloat(trendPct) >= 0 ? "text-primary bg-primary/10 border-primary/20" : "text-red-400 bg-red-500/10 border-red-500/20"}`}>
                            <span className="material-icons text-[14px]">{parseFloat(trendPct) >= 0 ? "arrow_upward" : "arrow_downward"}</span>
                            <span>{Math.abs(parseFloat(trendPct))}% {t("today")}</span>
                        </div>
                    ) : (
                        <span className="text-xs text-gray-500">{t("noSalesToday")}</span>
                    )}
                    <svg className="w-32 h-10 text-primary drop-shadow-[0_0_8px_rgba(13,242,13,0.4)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 100 30">
                        <path d="M0 25 L10 20 L20 22 L30 15 L40 18 L50 10 L60 14 L70 5 L80 12 L90 8 L100 2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                    </svg>
                </div>
            </SpotlightCard>

            {/* Transactions */}
            <SpotlightCard>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-500 text-sm font-medium mb-1">{t("totalTransactions")}</p>
                        {isLoading ? (
                            <Skeleton className="h-9 w-20 mt-1" />
                        ) : (
                            <h3 className="text-3xl font-bold text-white tracking-tight">
                                {(stats?.successful ?? 0) + (stats?.pending ?? 0) + (stats?.failed ?? 0)}
                            </h3>
                        )}
                    </div>
                    <div className="bg-white/5 p-2 rounded-xl">
                        <span className="material-icons text-gray-400 text-xl">bar_chart</span>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-xs">
                    {isLoading ? <Skeleton className="h-5 w-full" /> : (
                        <>
                            <span className="text-primary font-semibold">{stats?.successful ?? 0} {t("paid")}</span>
                            <span className="text-amber-400">{stats?.pending ?? 0} {t("pending")}</span>
                            <span className="text-red-400">{stats?.failed ?? 0} {t("failed")}</span>
                        </>
                    )}
                </div>
            </SpotlightCard>

            {/* Active Products */}
            <SpotlightCard>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-500 text-sm font-medium mb-1">{t("activeProducts")}</p>
                        {products === undefined ? (
                            <Skeleton className="h-9 w-16 mt-1" />
                        ) : (
                            <h3 className="text-3xl font-bold text-white tracking-tight">
                                {products.filter((p) => p.isActive).length}
                            </h3>
                        )}
                    </div>
                    <div className="bg-white/5 p-2 rounded-xl">
                        <span className="material-icons text-gray-400 text-xl">inventory_2</span>
                    </div>
                </div>
                <div className="text-xs text-gray-500">
                    {products === undefined ? (
                        <Skeleton className="h-4 w-28" />
                    ) : (
                        <span>{products.length} {t("total")} · {products.filter((p) => !p.isActive).length} {t("inactive")}</span>
                    )}
                </div>
            </SpotlightCard>
        </div>
    );
}
