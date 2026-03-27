"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useTranslations } from "next-intl";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { formatMoney } from "@/lib/currency";

type TxStatus = "PAID" | "SETTLED" | "PENDING" | "AUTHORIZED" | "IN_PROCESS" | "FAILED" | "REFUNDED" | "CANCELLED";

function fmt(cents: number) {
    return formatMoney(cents, "USD");
}

function formatDate(ts?: number) {
    if (!ts) return "—";
    return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function Skeleton() {
    return (
        <tr>
            {[1, 2, 3, 4, 5].map((i) => (
                <td key={i} className="px-6 py-4">
                    <div className="h-4 bg-white/5 rounded animate-pulse" />
                </td>
            ))}
        </tr>
    );
}

export function TransactionsTable() {
    const t = useTranslations("TransactionsTable");
    const data = useQuery(api.transactions.getSellerTransactions);
    const txns = data?.transactions?.slice(0, 5) ?? [];
    const isLoading = data === undefined;

    const statusConfig: Record<string, { label: string; className: string }> = {
        PAID: { label: t("statusPaid"), className: "bg-primary/10 text-primary border-primary/20" },
        SETTLED: { label: t("statusSettled"), className: "bg-primary/10 text-primary border-primary/20" },
        PENDING: { label: t("statusPending"), className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
        AUTHORIZED: { label: t("statusAuth"), className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
        IN_PROCESS: { label: t("statusProcessing"), className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
        FAILED: { label: t("statusFailed"), className: "bg-red-500/10 text-red-400 border-red-500/20" },
        REFUNDED: { label: t("statusRefunded"), className: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
        CANCELLED: { label: t("statusCancelled"), className: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
    };

    return (
        <SpotlightCard className="lg:col-span-2 flex flex-col shadow-xl !p-0 overflow-hidden">
            <div className="relative z-10 p-6 border-b border-white/5 flex justify-between items-center bg-transparent">
                <h2 className="text-lg font-bold text-white tracking-tight">{t("recentTransactions")}</h2>
                <Link
                    href="/seller/transactions"
                    className="text-xs font-bold text-gray-400 border border-white/10 bg-white/5 px-3 py-1.5 rounded-full hover:bg-white/10 hover:text-white transition-colors uppercase tracking-widest"
                >
                    {t("viewAll")}
                </Link>
            </div>

            <div className="relative z-10 overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="text-gray-500 text-[10px] font-bold uppercase tracking-widest border-b border-white/5 bg-white/[0.01]">
                            <th className="px-6 py-4 font-medium">{t("date")}</th>
                            <th className="px-6 py-4 font-medium">{t("product")}</th>
                            <th className="px-6 py-4 font-medium">{t("customer")}</th>
                            <th className="px-6 py-4 font-medium">{t("link")}</th>
                            <th className="px-6 py-4 font-medium text-right">{t("amount")}</th>
                            <th className="px-6 py-4 font-medium text-center">{t("status")}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)
                        ) : txns.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12">
                                    <div className="flex flex-col items-center justify-center text-gray-500 text-sm">
                                        <span className="material-icons text-4xl mb-2 opacity-20">receipt_long</span>
                                        <span>{t("noTransactions")}</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            txns.map((tx) => {
                                const status = statusConfig[tx.status] ?? { label: tx.status, className: "bg-white/10 text-white border-white/10" };
                                return (
                                    <tr key={tx._id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap font-bold uppercase">{formatDate(tx.createdAt)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3 max-w-[200px]">
                                                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                    {tx.productImage ? (
                                                        <img src={tx.productImage as string} alt={tx.productName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="material-icons opacity-20 text-white text-base">inventory_2</span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-gray-300 text-xs font-medium truncate">
                                                        {tx.productName}
                                                    </span>
                                                    {tx.productDescription && (
                                                        <span className="text-gray-500 text-[10px] truncate mt-0.5 leading-tight">
                                                            {tx.productDescription as string}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-xs truncate max-w-[140px]">{tx.customerEmail}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                                                // @ts-ignore
                                                tx.link === "Default" 
                                                ? "bg-white/5 text-gray-400 border border-white/10" 
                                                // @ts-ignore
                                                : "bg-primary/10 text-primary border border-primary/20"
                                            }`}>
                                                {/* @ts-ignore */}
                                                {tx.link === "Default" ? <span className="material-icons text-[12px] mr-1">link</span> : <span className="material-icons text-[12px] mr-1">group</span>}
                                                {/* @ts-ignore */}
                                                {tx.link}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-white text-right font-medium">{fmt(tx.amountTotalCents)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${status.className}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </SpotlightCard>
    );
}
