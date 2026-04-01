"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { TopNav } from "@/components/dashboard/TopNav";
import { formatMoney } from "@/lib/currency";
import { useStoreContext } from "@/providers/store-context";
import { useTranslations } from "next-intl";

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
    const t = useTranslations("WLOwnerDashboard.Overview");
    const { store } = useStoreContext();
    const stats = useQuery(
        api.wlOwnerQueries.getStoreStats,
        store?._id ? { storeId: store._id } : "skip"
    );

    return (
        <>
            <TopNav title={t("title")} />
            <div className="p-8 relative z-0 space-y-8 w-full">

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    <StatCard
                        label={t("totalRevenue")}
                        value={stats ? formatCents(stats.totalRevenueCents) : "—"}
                        icon="attach_money"
                        sub={t("acrossAllSellers")}
                    />
                    <StatCard
                        label={t("yourEarnings")}
                        value={stats ? formatCents(stats.totalWlEarningsCents) : "—"}
                        icon="account_balance_wallet"
                        sub={t("wlOwnerFeesCollected")}
                    />
                    <StatCard
                        label={t("activeSellers")}
                        value={stats ? `${stats.activeSellers}` : "—"}
                        icon="storefront"
                        sub={stats?.pendingSellers ? `${stats.pendingSellers} ${t("pendingApproval")}` : undefined}
                    />
                    <StatCard
                        label={t("transactions")}
                        value={stats ? stats.totalTransactions : "—"}
                        icon="receipt_long"
                        sub={t("allTime")}
                    />
                </div>

                {/* PSP Status Banner — not configured */}
                {store && !store.pspProvider && (
                    <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5 flex items-center gap-4">
                        <span className="material-icons text-yellow-400 text-[28px]">warning</span>
                        <div>
                            <p className="text-white font-semibold">{t("pspNotConnectedTitle")}</p>
                            <p className="text-sm text-text-grey mt-0.5">
                                {t("pspNotConnectedDesc")}
                                <a href="/dashboard/settings" className="text-primary underline">{t("goToSettings")}</a>
                            </p>
                        </div>
                    </div>
                )}

                {/* PSP Status Banner — pending Stripe onboarding */}
                {store?.pspProvider && store.pspStatus !== "CONNECTED" && (
                    <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5 flex items-center gap-4">
                        <span className="material-icons text-yellow-400 text-[28px]">pending</span>
                        <div>
                            <p className="text-white font-semibold">{t("pspPendingTitle")}</p>
                            <p className="text-sm text-text-grey mt-0.5">
                                {t("pspPendingDesc")}
                                <a href="/dashboard/settings" className="text-primary underline">{t("goToSettings")}</a>
                            </p>
                        </div>
                    </div>
                )}

                {/* PSP Connected Banner */}
                {store?.pspProvider && store.pspStatus === "CONNECTED" && (
                    <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5 flex items-center gap-4">
                        <span className="material-icons text-green-400 text-[28px]">check_circle</span>
                        <div>
                            <p className="text-white font-semibold">{t("pspConnectedTitle")}</p>
                            <p className="text-sm text-text-grey mt-0.5">
                                {t("pspConnectedDesc")}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
