"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { formatMoney } from "@/lib/currency";
import Link from "next/link";
import { useState } from "react";

function formatCents(cents: number): string {
    return formatMoney(cents, "USD");
}

export default function TenantsPage() {
    const stores = useQuery(api.admin.listAllStores);
    const freezeStore = useMutation(api.admin.freezeStore);
    const unfreezeStore = useMutation(api.admin.unfreezeStore);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const handleToggleFreeze = async (storeId: any, currentStatus: string) => {
        setActionLoading(storeId);
        try {
            if (currentStatus === "FROZEN") {
                await unfreezeStore({ storeId });
            } else {
                await freezeStore({ storeId });
            }
        } catch (err: any) {
            alert(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    if (!stores) {
        return <p className="text-text-grey text-sm">Loading stores...</p>;
    }

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-white text-2xl font-bold">WL Tenants</h2>
                <p className="text-text-grey text-sm mt-1">
                    All white-label stores on the platform. {stores.length} total.
                </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-surface-dark overflow-x-auto">
                <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
                    <thead>
                        <tr className="border-b border-white/5">
                            {["Store", "Status", "Owner", "Sellers", "Affiliates", "Revenue", "Platform Fees", "WL%", "Actions"].map((h) => (
                                <th key={h} className="text-left px-6 py-3 text-text-grey text-xs uppercase tracking-wider font-medium">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {stores.map((store: any) => (
                            <tr key={store._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                {/* Store name + slug merged */}
                                <td className="px-6 py-4">
                                    <Link href={`/tenants/${store._id}`} className="flex items-center gap-2 group">
                                        <div>
                                            <p className="text-white font-medium text-sm group-hover:text-indigo-400 transition-colors">{store.name}</p>
                                            <p className="text-text-grey text-xs mt-0.5">{store.slug}</p>
                                        </div>
                                        <span className="material-icons text-text-grey group-hover:text-white transition-colors text-[18px] ml-auto flex-shrink-0">navigate_next</span>
                                    </Link>
                                </td>

                                {/* Status badge */}
                                <td className="px-6 py-4">
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                                        store.status === "FROZEN"
                                            ? "text-amber-400 bg-amber-400/10 border-amber-400/20"
                                            : "text-green-400 bg-green-400/10 border-green-400/20"
                                    }`}>
                                        {store.status}
                                    </span>
                                </td>

                                {/* Owner email */}
                                <td className="px-6 py-4 text-text-grey text-sm">{store.ownerEmail}</td>

                                {/* Seller count */}
                                <td className="px-6 py-4 text-text-grey text-center">{store.sellerCount}</td>

                                {/* Affiliate count */}
                                <td className="px-6 py-4 text-text-grey text-center">{store.affiliateCount}</td>

                                {/* Revenue */}
                                <td className="px-6 py-4 text-white font-medium">{formatCents(store.totalRevenueCents)}</td>

                                {/* Platform fees */}
                                <td className="px-6 py-4 text-text-grey">{formatCents(store.platformEarningsCents)}</td>

                                {/* WL% */}
                                <td className="px-6 py-4 text-text-grey">{store.wlOwnerFeePercent}%</td>

                                {/* Action button */}
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleToggleFreeze(store._id, store.status)}
                                        disabled={actionLoading === store._id}
                                        className={`text-xs px-3 py-1.5 rounded-full transition-colors cursor-pointer disabled:opacity-50 ${
                                            store.status === "FROZEN"
                                                ? "bg-white/5 text-white border border-white/10 hover:bg-white/10"
                                                : "border border-white/10 text-text-grey hover:text-white"
                                        }`}
                                    >
                                        {actionLoading === store._id ? "..." : store.status === "FROZEN" ? "Unfreeze" : "Freeze"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
