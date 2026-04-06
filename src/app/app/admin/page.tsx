"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { formatMoney } from "@/lib/currency";
import { useTranslations } from "next-intl";

function StatCard({ label, value, subValue, icon }: {
    label: string;
    value: string | number;
    subValue?: string;
    icon: string;
}) {
    return (
        <div className="bg-surface-dark border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
                <span className="material-icons text-text-grey text-[20px]">{icon}</span>
                <p className="text-text-grey text-xs uppercase tracking-widest font-semibold">{label}</p>
            </div>
            <p className="text-white text-3xl font-bold">{value}</p>
            {subValue && (
                <p className="text-text-grey text-sm mt-1">{subValue}</p>
            )}
        </div>
    );
}

function formatCents(cents: number): string {
    return formatMoney(cents, "USD");
}

export default function AdminOverviewPage() {
    const stats = useQuery(api.admin.getGlobalStats);
    const t = useTranslations("Admin.Overview");

    if (!stats) {
        return <p className="text-text-grey text-sm">{t("loading")}</p>;
    }

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-white text-2xl font-bold">{t("title")}</h2>
                <p className="text-text-grey text-sm mt-1">{t("description")}</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                <StatCard label={t("totalStores")} value={stats.totalStores} subValue={`${stats.activeStores} ${t("activeStores")} · ${stats.frozenStores} ${t("frozenStores")}`} icon="store" />
                <StatCard label={t("sellers")} value={stats.totalSellers} icon="people" />
                <StatCard label={t("affiliates")} value={stats.totalAffiliates} icon="group" />
                <StatCard label={t("transactions")} value={stats.totalTransactions} subValue={`${stats.paidTransactions} ${t("paidTransactions")}`} icon="receipt_long" />
                <StatCard label={t("totalRevenue")} value={formatCents(stats.totalRevenueCents)} icon="attach_money" />
                <StatCard label={t("platformEarnings")} value={formatCents(stats.totalPlatformEarnings)} subValue={t("triadpaysCut")} icon="account_balance" />
                <StatCard label={t("wlOwnerEarnings")} value={formatCents(stats.totalWlOwnerEarnings)} subValue={t("acrossAllStores")} icon="store" />
            </div>
        </div>
    );
}
