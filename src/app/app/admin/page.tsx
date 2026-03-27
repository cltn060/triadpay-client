"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { formatMoney } from "@/lib/currency";

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

    if (!stats) {
        return <p className="text-text-grey text-sm">Loading stats...</p>;
    }

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-white text-2xl font-bold">Platform Overview</h2>
                <p className="text-text-grey text-sm mt-1">Global metrics across all WL tenants.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                <StatCard label="Total Stores" value={stats.totalStores} subValue={`${stats.activeStores} active · ${stats.frozenStores} frozen`} icon="store" />
                <StatCard label="Sellers" value={stats.totalSellers} icon="people" />
                <StatCard label="Affiliates" value={stats.totalAffiliates} icon="group" />
                <StatCard label="Transactions" value={stats.totalTransactions} subValue={`${stats.paidTransactions} paid`} icon="receipt_long" />
                <StatCard label="Total Revenue" value={formatCents(stats.totalRevenueCents)} icon="attach_money" />
                <StatCard label="Platform Earnings" value={formatCents(stats.totalPlatformEarnings)} subValue="Triadpay's cut" icon="account_balance" />
                <StatCard label="WL Owner Earnings" value={formatCents(stats.totalWlOwnerEarnings)} subValue="Across all stores" icon="store" />
            </div>
        </div>
    );
}
