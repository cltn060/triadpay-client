"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { TopNav } from "@/components/dashboard/TopNav";
import { useStoreContext } from "@/providers/store-context";

// Affiliates page for WL Owner — reuses existing getStoreAffiliates query
// WL Owner can approve/reject affiliates across all sellers on their platform

const STATUS_STYLES: Record<string, string> = {
    APPROVED: "text-green-400 bg-green-400/10 border-green-400/20",
    PENDING:  "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    REJECTED: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function WLAffiliatesPage() {
    const { store } = useStoreContext();
    const affiliates = useQuery(
        api.memberships.getStoreAffiliates,
        store?.slug ? { storeSlug: store.slug } : "skip"
    );
    const updateStatus = useMutation(api.memberships.updateMembershipStatus);

    return (
        <>
            <TopNav title="Affiliates" />
            <div className="p-8 relative z-0 space-y-6 w-full">
                <div>
                    <h2 className="text-white font-bold text-lg">Affiliate Management</h2>
                    <p className="text-text-grey text-sm mt-0.5">
                        Manage affiliate access to your platform.
                    </p>
                </div>

                <div className="rounded-2xl border border-white/5 bg-surface-dark overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5 text-text-grey text-xs uppercase tracking-wider">
                                <th className="text-left px-6 py-4">Affiliate</th>
                                <th className="text-left px-6 py-4">PSP</th>
                                <th className="text-left px-6 py-4">Status</th>
                                <th className="text-right px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {affiliates === undefined && (
                                <tr><td colSpan={4} className="px-6 py-12 text-center text-text-grey">Loading…</td></tr>
                            )}
                            {affiliates?.length === 0 && (
                                <tr><td colSpan={4} className="px-6 py-12 text-center text-text-grey">No affiliates yet.</td></tr>
                            )}
                            {affiliates?.map((a) => (
                                <tr key={String(a._id)} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                                    <td className="px-6 py-4 text-white font-medium">{a.affiliateEmail}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-semibold ${a.hasPspConnected ? "text-green-400" : "text-text-grey"}`}>
                                            {a.hasPspConnected ? "Connected" : "Not connected"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${STATUS_STYLES[a.status]}`}>
                                            {a.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        {a.status === "PENDING" && (
                                            <>
                                                <button
                                                    onClick={() => updateStatus({ membershipId: a._id, status: "APPROVED" })}
                                                    className="text-xs px-3 py-1.5 rounded-lg bg-primary text-black font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => updateStatus({ membershipId: a._id, status: "REJECTED" })}
                                                    className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-text-grey hover:text-white transition-colors cursor-pointer"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {a.status === "APPROVED" && (
                                            <span className="text-xs text-text-grey">Active</span>
                                        )}
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
