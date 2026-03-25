"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { TopNav } from "@/components/dashboard/TopNav";
import { useStoreContext } from "@/providers/store-context";

function formatCents(cents: number) {
    return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export default function WLEarningsPage() {
    const { store } = useStoreContext();
    const earnings = useQuery(
        api.wlOwnerQueries.getWlOwnerEarnings,
        store?._id ? { storeId: store._id } : "skip"
    );

    return (
        <>
            <TopNav title="Earnings" />
            <div className="p-8 relative z-0 space-y-6 w-full">

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 space-y-2">
                        <span className="text-xs uppercase tracking-widest text-text-grey font-semibold">Total Earnings</span>
                        <p className="text-3xl font-bold text-white">
                            {earnings ? formatCents(earnings.totalEarningsCents) : "—"}
                        </p>
                        <p className="text-xs text-text-grey">From WL Owner platform fee</p>
                    </div>
                    <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 space-y-2">
                        <span className="text-xs uppercase tracking-widest text-text-grey font-semibold">Total Conversions</span>
                        <p className="text-3xl font-bold text-white">
                            {earnings ? earnings.totalConversions : "—"}
                        </p>
                        <p className="text-xs text-text-grey">Paid & settled transactions</p>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="rounded-2xl border border-white/5 bg-surface-dark overflow-x-auto">
                    <div className="px-6 py-4 border-b border-white/5">
                        <h3 className="text-white font-semibold text-sm">Recent Earnings</h3>
                    </div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5 text-text-grey text-xs uppercase tracking-wider">
                                <th className="text-left px-6 py-3">Product</th>
                                <th className="text-left px-6 py-3">Total</th>
                                <th className="text-left px-6 py-3">Your Cut</th>
                                <th className="text-left px-6 py-3">Status</th>
                                <th className="text-left px-6 py-3">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!earnings && (
                                <tr><td colSpan={5} className="px-6 py-10 text-center text-text-grey">Loading…</td></tr>
                            )}
                            {earnings?.recentTransactions.length === 0 && (
                                <tr><td colSpan={5} className="px-6 py-10 text-center text-text-grey">No transactions yet.</td></tr>
                            )}
                            {earnings?.recentTransactions.map((t) => (
                                <tr key={String(t._id)} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                                    <td className="px-6 py-3 text-white">{t.productName}</td>
                                    <td className="px-6 py-3 text-text-grey">{formatCents(t.amountTotalCents)}</td>
                                    <td className="px-6 py-3 text-primary font-semibold">{formatCents(t.feeWlOwnerCents)}</td>
                                    <td className="px-6 py-3">
                                        <span className="text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full font-semibold">
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-text-grey">
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
