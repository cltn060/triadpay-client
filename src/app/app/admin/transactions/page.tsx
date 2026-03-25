"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState } from "react";

function formatCents(cents: number): string {
    return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

const STATUS_STYLES: Record<string, string> = {
    PAID: "text-green-400 bg-green-400/10 border-green-400/20",
    PENDING: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    IN_PROCESS: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    FAILED: "text-red-400 bg-red-400/10 border-red-400/20",
    REFUNDED: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    AUTHORIZED: "text-sky-400 bg-sky-400/10 border-sky-400/20",
    SETTLED: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
};

export default function TransactionsPage() {
    const [statusFilter, setStatusFilter] = useState("");
    const transactions = useQuery(api.admin.getAllTransactions, {
        status: statusFilter || undefined,
        limit: 100,
    });

    if (!transactions) {
        return <p className="text-text-grey text-sm">Loading transactions...</p>;
    }

    return (
        <div>
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="text-white text-2xl font-bold">Transactions</h2>
                    <p className="text-text-grey text-sm mt-1">
                        Global view across all stores. Showing {transactions.length} records.
                    </p>
                </div>

                {/* Status filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-background-dark border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30 cursor-pointer"
                >
                    <option value="">All Statuses</option>
                    <option value="PAID">Paid</option>
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROCESS">In Process</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                </select>
            </div>

            <div className="rounded-2xl border border-white/5 bg-surface-dark overflow-x-auto">
                <table className="w-full text-xs" style={{ borderCollapse: "collapse", minWidth: "1100px" }}>
                    <thead>
                        <tr className="border-b border-white/5">
                            {["Ref", "Store", "Seller", "Product", "Amount", "Platform", "WL Fee", "Affiliate", "Seller Net", "Status", "Transfers", "Date"].map((h) => (
                                <th key={h} className="text-left px-4 py-3 text-text-grey text-xs uppercase tracking-wider font-medium whitespace-nowrap">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length === 0 && (
                            <tr>
                                <td colSpan={12} className="px-6 py-12 text-center text-text-grey">
                                    No transactions found.
                                </td>
                            </tr>
                        )}
                        {transactions.map((tx: any) => {
                            const statusClass = STATUS_STYLES[tx.status] ?? "text-text-grey bg-white/5 border-white/10";
                            return (
                                <tr key={tx._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-mono text-text-grey text-[11px] whitespace-nowrap">{tx.externalReference}</td>
                                    <td className="px-4 py-3 text-text-grey">{tx.storeName}</td>
                                    <td className="px-4 py-3 text-text-grey text-[11px]">{tx.sellerEmail}</td>
                                    <td className="px-4 py-3 text-white font-medium max-w-[120px] truncate whitespace-nowrap overflow-hidden" style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {tx.productName}
                                    </td>
                                    <td className="px-4 py-3 text-white font-semibold whitespace-nowrap">{formatCents(tx.amountTotalCents)}</td>
                                    <td className="px-4 py-3 text-text-grey whitespace-nowrap">{formatCents(tx.feePlatformCents)}</td>
                                    <td className="px-4 py-3 text-text-grey whitespace-nowrap">{formatCents(tx.feeWlOwnerCents)}</td>
                                    <td className="px-4 py-3 text-text-grey whitespace-nowrap">{formatCents(tx.feeAffiliateCents)}</td>
                                    <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{formatCents(tx.netSellerCents)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusClass}`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {tx.transferStatus?.completedAt ? (
                                            <span className="flex items-center gap-1 text-green-400 text-[11px]">
                                                <span className="material-icons text-[13px]">check_circle</span>
                                                Done
                                            </span>
                                        ) : tx.status === "PAID" ? (
                                            <span className="text-amber-400 text-[11px]">Pending</span>
                                        ) : (
                                            <span className="text-text-grey text-[11px]">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-text-grey text-[11px] whitespace-nowrap">
                                        {new Date(tx.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
