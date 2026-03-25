"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { TopNav } from "@/components/dashboard/TopNav";
import { useStoreContext } from "@/providers/store-context";

function formatCents(cents: number) {
    return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

const STATUS_STYLES: Record<string, string> = {
    PAID:      "text-green-400 bg-green-400/10 border-green-400/20",
    SETTLED:   "text-green-400 bg-green-400/10 border-green-400/20",
    PENDING:   "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    FAILED:    "text-red-400 bg-red-400/10 border-red-400/20",
    REFUNDED:  "text-blue-400 bg-blue-400/10 border-blue-400/20",
    IN_PROCESS:"text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
};

export default function WLTransactionsPage() {
    const { store } = useStoreContext();
    const transactions = useQuery(
        api.wlOwnerQueries.getStoreTransactions,
        store?._id ? { storeId: store._id } : "skip"
    );

    return (
        <>
            <TopNav title="Transactions" />
            <div className="p-8 relative z-0 space-y-6 w-full">
                <div>
                    <h2 className="text-white font-bold text-lg">All Transactions</h2>
                    <p className="text-text-grey text-sm mt-0.5">Every transaction across all sellers on your platform.</p>
                </div>

                <div className="rounded-2xl border border-white/5 bg-surface-dark overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5 text-text-grey text-xs uppercase tracking-wider">
                                <th className="text-left px-6 py-4">Customer</th>
                                <th className="text-left px-6 py-4">Product</th>
                                <th className="text-left px-6 py-4">Seller</th>
                                <th className="text-left px-6 py-4">Total</th>
                                <th className="text-left px-6 py-4">Your Fee</th>
                                <th className="text-left px-6 py-4">Status</th>
                                <th className="text-left px-6 py-4">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!transactions && (
                                <tr><td colSpan={7} className="px-6 py-10 text-center text-text-grey">Loading…</td></tr>
                            )}
                            {transactions?.length === 0 && (
                                <tr><td colSpan={7} className="px-6 py-10 text-center text-text-grey">No transactions yet.</td></tr>
                            )}
                            {transactions?.map((t) => (
                                <tr key={String(t._id)} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                                    <td className="px-6 py-3 text-white text-xs">{t.customerEmail}</td>
                                    <td className="px-6 py-3 text-text-grey">{t.productName}</td>
                                    <td className="px-6 py-3 text-text-grey text-xs">{t.sellerEmail}</td>
                                    <td className="px-6 py-3 text-white font-medium">{formatCents(t.amountTotalCents)}</td>
                                    <td className="px-6 py-3 text-primary font-semibold">{formatCents(t.feeWlOwnerCents)}</td>
                                    <td className="px-6 py-3">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLES[t.status] ?? ""}`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-text-grey text-xs">
                                        {new Date(t.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
