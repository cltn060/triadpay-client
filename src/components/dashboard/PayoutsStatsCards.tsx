"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function PayoutsStatsCards() {
    const t = useTranslations("PayoutsStatsCards");

    const stats = [
        {
            label: t("availableForPayout"),
            value: "$124,592.00", // Hardcoded Mock for now
            icon: "account_balance_wallet",
            iconColor: "text-primary",
            indicator: (
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-glow inline-block" />
            ),
            change: (
                <div className="mt-4 flex items-center text-sm text-primary">
                    <span className="material-icons text-base mr-1">
                        trending_up
                    </span>
                    <span>{t("increaseThisWeek", { percentage: "12.5%" })}</span>
                </div>
            ),
        },
        {
            label: t("pendingClearance"),
            value: "$12,450.00", // Hardcoded Mock for now
            icon: "hourglass_empty",
            iconColor: "text-white",
            change: (
                <div className="mt-4 flex items-center text-sm text-text-grey">
                    <span className="material-icons text-base mr-1">schedule</span>
                    <span>{t("clearingTime", { time: "24h" })}</span>
                </div>
            ),
        },
        {
            label: t("totalPayoutsYTD"),
            value: "$4.2M", // Hardcoded Mock for now
            icon: "bar_chart",
            iconColor: "text-primary",
            change: (
                <div className="mt-4 flex items-center text-sm text-primary">
                    <span className="material-icons text-base mr-1">
                        north_east
                    </span>
                    <span>{t("transactionsCount", { count: 1240 })}</span>
                </div>
            ),
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="bg-surface-dark border border-white/5 p-8 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-all duration-300"
                >
                    {/* Background Icon */}
                    <div className="absolute right-0 top-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <span
                            className={cn("material-icons text-6xl", stat.iconColor)}
                        >
                            {stat.icon}
                        </span>
                    </div>

                    <p className="text-text-grey font-medium mb-2 flex items-center gap-2">
                        {stat.label}
                        {stat.indicator}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <h3
                            className={cn(
                                "text-4xl font-bold tracking-tight",
                                stat.label === t("pendingClearance") ? "text-slate-200" : "text-white"
                            )}
                        >
                            {stat.value}
                        </h3>
                    </div>
                    {stat.change}
                </div>
            ))}
        </div>
    );
}
