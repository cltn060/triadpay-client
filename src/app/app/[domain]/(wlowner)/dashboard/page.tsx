"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { TopNav } from "@/components/dashboard/TopNav";
import { formatMoney } from "@/lib/currency";
import { useStoreContext } from "@/providers/store-context";

function StatCard({
    label,
    value,
    icon,
    sub,
}: {
    label: string;
    value: string | number;
    icon: string;
    sub?: string;
}) {
    return (
        <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-text-grey font-semibold">{label}</span>
                <span className="material-icons text-primary text-[22px]">{icon}</span>
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
            {sub && <p className="text-xs text-text-grey">{sub}</p>}
        </div>
    );
}

function formatCents(cents: number) {
    return formatMoney(cents, "USD");
}

export default function WLOwnerOverviewPage() {
    const { store } = useStoreContext();
    const stats = useQuery(
        api.wlOwnerQueries.getStoreStats,
        store?._id ? { storeId: store._id } : "skip"
    );

    return (
        <>
            <TopNav title="Overview" />
            <div className="p-8 relative z-0 space-y-8 w-full">

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    <StatCard
                        label="Total Revenue"
                        value={stats ? formatCents(stats.totalRevenueCents) : "—"}
                        icon="attach_money"
                        sub="Across all sellers"
                    />
                    <StatCard
                        label="Your Earnings"
                        value={stats ? formatCents(stats.totalWlEarningsCents) : "—"}
                        icon="account_balance_wallet"
                        sub="WL Owner fees collected"
                    />
                    <StatCard
                        label="Active Sellers"
                        value={stats ? `${stats.activeSellers}` : "—"}
                        icon="storefront"
                        sub={stats?.pendingSellers ? `${stats.pendingSellers} pending approval` : undefined}
                    />
                    <StatCard
                        label="Transactions"
                        value={stats ? stats.totalTransactions : "—"}
                        icon="receipt_long"
                        sub="All time"
                    />
                </div>

                {/* PSP Status Banner — not configured */}
                {store && !store.pspProvider && (
                    <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5 flex items-center gap-4">
                        <span className="material-icons text-yellow-400 text-[28px]">warning</span>
                        <div>
                            <p className="text-white font-semibold">Payment provider not connected</p>
                            <p className="text-sm text-text-grey mt-0.5">
                                Your sellers cannot accept payments until you connect Stripe.{" "}
                                <a href="/dashboard/settings" className="text-primary underline">Go to Settings →</a>
                            </p>
                        </div>
                    </div>
                )}

                {/* PSP Status Banner — pending Stripe onboarding */}
                {store?.pspProvider && store.pspStatus !== "CONNECTED" && (
                    <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5 flex items-center gap-4">
                        <span className="material-icons text-yellow-400 text-[28px]">pending</span>
                        <div>
                            <p className="text-white font-semibold">Complete your Stripe setup</p>
                            <p className="text-sm text-text-grey mt-0.5">
                                Your Stripe account needs to be verified before you can accept payments.{" "}
                                <a href="/dashboard/settings" className="text-primary underline">Go to Settings →</a>
                            </p>
                        </div>
                    </div>
                )}

                {/* PSP Connected Banner */}
                {store?.pspProvider && store.pspStatus === "CONNECTED" && (
                    <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5 flex items-center gap-4">
                        <span className="material-icons text-green-400 text-[28px]">check_circle</span>
                        <div>
                            <p className="text-white font-semibold">Stripe connected</p>
                            <p className="text-sm text-text-grey mt-0.5">
                                Your platform is active. Sellers can now accept payments.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
