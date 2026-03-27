"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { formatMoneyCompact } from "@/lib/currency";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function VolumeChart() {
    const t = useTranslations("VolumeChart");
    const { transactions } = useQuery(api.transactions.getSellerTransactions) ?? { transactions: [] };
    const timeRanges = [
        { code: "7D", label: t("timeRange7D") },
        { code: "30D", label: t("timeRange30D") },
        { code: "3M", label: t("timeRange3M") },
    ];

    const [activeRange, setActiveRange] = useState<string>("30D");

    const { chartData, xAxisLabels } = useMemo(() => {
        const validTxns = transactions.filter(t => t.status === "PAID" || t.status === "SETTLED");
        const now = Date.now();
        let days = 30;
        if (activeRange === "7D") days = 7;
        else if (activeRange === "3M") days = 90;

        const cutoff = now - days * 24 * 60 * 60 * 1000;
        const rangeTxns = validTxns.filter(t => t.createdAt >= cutoff);

        const numBuckets = activeRange === "7D" ? 7 : activeRange === "30D" ? 15 : 12;
        const bucketMs = (days * 24 * 60 * 60 * 1000) / numBuckets;

        const buckets = Array(numBuckets).fill(0);
        rangeTxns.forEach(t => {
            const timeDiff = t.createdAt - cutoff;
            const bucketIndex = Math.floor(timeDiff / bucketMs);
            if (bucketIndex >= 0 && bucketIndex < numBuckets) {
                buckets[bucketIndex] += t.amountTotalCents;
            } else if (bucketIndex === numBuckets) {
                buckets[numBuckets - 1] += t.amountTotalCents;
            }
        });

        const maxBucket = Math.max(...buckets, 1);
        const data = buckets.map(amountCents => ({
            value: Math.max((amountCents / maxBucket) * 100, amountCents > 0 ? 5 : 0),
            label: amountCents > 0 ? formatMoneyCompact(amountCents, "USD") : "$0",
        }));

        // Generate 4 X-axis labels
        const labels = [];
        for (let i = 0; i < 4; i++) {
            const dateStr = new Date(cutoff + (i * days * 24 * 60 * 60 * 1000) / 3).toLocaleDateString("en-US", { month: "short", day: "2-digit" });
            labels.push(dateStr);
        }

        return { chartData: data, xAxisLabels: labels };
    }, [transactions, activeRange]);

    return (
        <SpotlightCard className="relative overflow-hidden shadow-xl !p-6 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">{t("paymentVolume")}</h2>
                    <p className="text-xs text-gray-500">{t("performance30Days")}</p>
                </div>
                <div className="flex gap-2">
                    {timeRanges.map((range) => (
                        <button
                            key={range.code}
                            onClick={() => setActiveRange(range.code)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${activeRange === range.code
                                ? "bg-white text-black"
                                : "bg-white/5 text-gray-500 hover:text-white hover:bg-white/10"
                                }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bar Chart */}
            <div className="h-48 w-full flex items-end justify-between gap-1 relative z-10">
                {chartData.map((bar, i) => (
                    <div
                        key={i}
                        className={`w-full rounded-t-sm transition-colors cursor-pointer group relative ${bar.value >= 75
                            ? "bg-primary/80 hover:bg-primary"
                            : bar.value >= 70
                                ? "bg-primary/40 hover:bg-primary/60"
                                : "bg-white/5 hover:bg-white/20"
                            }`}
                        style={{ height: `${bar.value}%` }}
                    >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">
                            {bar.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between text-xs text-gray-500 mt-2 px-1 font-bold uppercase tracking-widest relative z-10">
                {xAxisLabels.map((lbl, idx) => (
                    <span key={idx}>{lbl}</span>
                ))}
            </div>
        </SpotlightCard>
    );
}
