"use client";

import { useTranslations } from "next-intl";
import { formatMoney } from "@/lib/currency";

interface TransactionsStatsCardsProps {
    stats: {
        successful: number;
        pending: number;
        failed: number;
        totalRevenueCents: number;
        awaitingSettlementCents: number;
    };
}

export function TransactionsStatsCards({ stats }: TransactionsStatsCardsProps) {
    const t = useTranslations("TransactionsStatsCards");

    const totalTxns = stats.successful + stats.pending + stats.failed;
    const successRate = totalTxns > 0 ? (stats.successful / totalTxns) * 100 : 0;
    const failureRate = totalTxns > 0 ? (stats.failed / totalTxns) * 100 : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Success Card */}
            <div className="bg-surface-dark border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20">
                            <span className="material-icons text-primary text-xl">check_circle</span>
                        </div>
                        <div className="text-right">
                            <p className="text-text-grey text-xs font-bold uppercase tracking-widest">{t("successful")}</p>
                            <h3 className="text-2xl font-bold text-white mt-1">{stats.successful}</h3>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-text-grey">{t("successRate")}</span>
                            <span className="text-primary font-bold">{successRate.toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-1000"
                                style={{ width: `${successRate}%` }}
                            />
                        </div>
                    </div>
                </div>
                <p className="text-[10px] text-text-grey mt-4 flex items-center gap-1.5">
                    <span className="material-icons text-[12px] text-primary">info</span>
                    {t("fromPaidTransactions", { count: stats.successful })}
                </p>
            </div>

            {/* Total Revenue Card */}
            <div className="bg-surface-dark border border-white/5 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
                {/* Background Decoration */}
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />

                <div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-white/10 p-2.5 rounded-xl border border-white/20">
                            <span className="material-icons text-white text-xl">payments</span>
                        </div>
                        <div className="text-right">
                            <p className="text-text-grey text-xs font-bold uppercase tracking-widest">{t("totalRevenue")}</p>
                            <h3 className="text-2xl font-bold text-white mt-1">
                                {formatMoney(stats.totalRevenueCents, "USD")}
                            </h3>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-text-grey capitalize">{t("awaitingSettlement")}</span>
                            <span className="text-white font-bold">
                                {formatMoney(stats.awaitingSettlementCents, "USD")}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 group/btn cursor-pointer">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider group-hover/btn:text-primary transition-colors">
                            {t("allClear")}
                        </span>
                        <span className="material-icons text-[14px] text-text-grey group-hover/btn:text-primary group-hover/btn:translate-x-0.5 transition-all">arrow_forward</span>
                    </div>
                </div>
            </div>

            {/* Failure/Pending Card */}
            <div className="bg-surface-dark border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
                <div className="space-y-6">
                    <div className="flex justify-between items-start">
                        <div className="bg-white/10 p-2.5 rounded-xl border border-white/20">
                            <span className="material-icons text-white text-xl">error_outline</span>
                        </div>
                        <div className="text-right">
                            <p className="text-text-grey text-xs font-bold uppercase tracking-widest">{t("failed")}</p>
                            <h3 className="text-2xl font-bold text-white mt-1">{stats.failed}</h3>
                        </div>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                            <span className="text-xs text-text-grey font-medium">{t("pending")}</span>
                        </div>
                        <span className="text-sm font-bold text-white">{stats.pending}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs px-1">
                        <span className="text-text-grey capitalize">{t("failureRate")}</span>
                        <span className="text-white font-bold">{failureRate.toFixed(1)}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
