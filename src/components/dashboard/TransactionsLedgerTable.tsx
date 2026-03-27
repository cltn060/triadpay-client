"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/currency";
import { StripeLogo, MercadoPagoLogo } from "./PaymentLogos";
import { useTranslations } from "next-intl";

// ─── Types ──────────────────────────────────────────────────────────────────
interface Transaction {
    _id: string;
    customerEmail: string;
    productName: string;
    productImage?: string | null;
    productDescription?: string | null;
    link?: string;
    pspProvider: "STRIPE" | "MERCADO_PAGO";
    amountTotalCents: number;
    netSellerCents: number;
    feeAffiliateCents: number;
    feePlatformCents: number;
    status: string;
    payoutStatus: string;
    externalReference: string;
    createdAt: number;
}

interface TransactionsLedgerTableProps {
    transactions: Transaction[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatCents(cents: number) {
    return formatMoney(cents, "USD");
}

function formatDate(ts: number) {
    const d = new Date(ts);
    return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    }) + ", " + d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

const PAGE_SIZE = 10;

// ─── Component ──────────────────────────────────────────────────────────────
export function TransactionsLedgerTable({ transactions }: TransactionsLedgerTableProps) {
    const t = useTranslations("TransactionsLedgerTable");
    const [page, setPage] = useState(0);
    const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
    const paginated = transactions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    const showingFrom = transactions.length === 0 ? 0 : page * PAGE_SIZE + 1;
    const showingTo = Math.min((page + 1) * PAGE_SIZE, transactions.length);

    const statusStyles: Record<string, string> = {
        PAID: "bg-primary/10 text-primary border-primary/20",
        SETTLED: "bg-emerald-500/10 text-emerald-400 border-emerald-400/20",
        PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        AUTHORIZED: "bg-blue-500/10 text-blue-400 border-blue-400/20",
        IN_PROCESS: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        FAILED: "bg-red-500/10 text-red-500 border-red-500/20",
        REFUNDED: "bg-purple-500/10 text-purple-400 border-purple-400/20",
    };

    return (
        <div className="bg-surface-dark border border-white/5 rounded-2xl flex flex-col">
            {transactions.length === 0 ? (
                <div className="p-12 text-center">
                    <span className="material-icons text-4xl text-gray-600 mb-3 block">receipt_long</span>
                    <p className="text-gray-400 text-sm font-medium">{t("noTransactions")}</p>
                    <p className="text-gray-600 text-xs mt-1">{t("transactionsAppearHere")}</p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="text-text-grey border-b border-white/5 bg-white/[0.02]">
                                    <th className="px-6 py-4 font-medium w-44">{t("date")}</th>
                                    <th className="px-6 py-4 font-medium">{t("reference")}</th>
                                    <th className="px-6 py-4 font-medium">{t("customer")}</th>
                                    <th className="px-6 py-4 font-medium">{t("link")}</th>
                                    <th className="px-6 py-4 font-medium">{t("product")}</th>
                                    <th className="px-6 py-4 font-medium text-center">{t("provider")}</th>
                                    <th className="px-6 py-4 font-medium text-right">{t("total")}</th>
                                    <th className="px-6 py-4 font-medium text-right">{t("net")}</th>
                                    <th className="px-6 py-4 font-medium text-right">{t("status")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {paginated.map((tx) => (
                                    <tr
                                        key={tx._id}
                                        className="group hover:bg-white/[0.02] transition-colors"
                                    >
                                        {/* Date */}
                                        <td className="px-6 py-4 text-text-grey font-mono text-xs">
                                            {formatDate(tx.createdAt)}
                                        </td>

                                        {/* Reference */}
                                        <td className="px-6 py-4 text-white font-mono text-xs tracking-wider">
                                            {tx.externalReference}
                                        </td>

                                        {/* Customer */}
                                        <td className="px-6 py-4 text-white">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white text-xs font-bold">
                                                        {tx.customerEmail[0]?.toUpperCase() ?? "?"}
                                                    </span>
                                                </div>
                                                <span className="text-sm font-medium truncate max-w-[160px]">
                                                    {tx.customerEmail}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Link */}
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                                                tx.link === "Default" 
                                                ? "bg-white/5 text-gray-400 border border-white/10" 
                                                : "bg-primary/10 text-primary border border-primary/20"
                                            }`}>
                                                {tx.link === "Default" ? <span className="material-icons text-[12px] mr-1">link</span> : <span className="material-icons text-[12px] mr-1">group</span>}
                                                {tx.link}
                                            </span>
                                        </td>

                                        {/* Product */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3 max-w-[200px]">
                                                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                    {tx.productImage ? (
                                                        <img src={tx.productImage} alt={tx.productName} className="w-full h-full object-cover" />
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
                                                            {tx.productDescription}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Provider */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center">
                                                {tx.pspProvider === "STRIPE" ? (
                                                    <StripeLogo size="sm" />
                                                ) : (
                                                    <MercadoPagoLogo size="sm" />
                                                )}
                                            </div>
                                        </td>

                                        {/* Total */}
                                        <td className="px-6 py-4 text-white text-right font-medium">
                                            {formatCents(tx.amountTotalCents)}
                                        </td>

                                        {/* Net */}
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-[#0df20d] font-medium">
                                                {formatCents(tx.netSellerCents)}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4 text-right">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusStyles[tx.status] ?? statusStyles.PENDING}`}
                                            >
                                                {tx.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t border-white/5 flex justify-between items-center bg-white/[0.01]">
                        <span className="text-xs text-text-grey">
                            {t("showingRows", { from: showingFrom, to: showingTo, total: transactions.length.toLocaleString() })}
                        </span>
                        <div className="flex gap-2">
                            <button
                                disabled={page === 0}
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                className="px-3 py-1 rounded-lg border border-white/5 bg-surface-dark text-text-grey text-xs hover:text-white hover:bg-white/5 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                {t("previous")}
                            </button>
                            <span className="text-xs text-text-grey flex items-center px-2">
                                {page + 1} / {totalPages}
                            </span>
                            <button
                                disabled={page >= totalPages - 1}
                                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                                className="px-3 py-1 rounded-lg border border-white/5 bg-surface-dark text-text-grey text-xs hover:text-white hover:bg-white/5 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                {t("next")}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
