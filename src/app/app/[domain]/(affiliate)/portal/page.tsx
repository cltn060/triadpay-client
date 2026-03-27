"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { TopNav, PspWarning } from "@/components/dashboard";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function AffiliatePortalPage() {
    const memberships = useQuery(api.memberships.getMyMemberships);
    const earnings = useQuery(api.transactions.getAffiliateEarnings);
    const paymentStatus = useQuery(api.paymentsHelpers.getAffiliatePaymentStatus);
    const params = useParams();
    const domain = params.domain as string;

    // Dynamic base domain from env
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

    // Derive status counts
    const approvedCount = memberships?.filter((m) => m.status === "APPROVED").length ?? 0;
    const pendingCount = memberships?.filter((m) => m.status === "PENDING").length ?? 0;

    // Earnings data
    import { formatMoney } from "@/lib/currency";
    const totalEarnings = earnings ? formatMoney(earnings.totalEarningsCents, "USD") : "$0.00";
    const conversions = earnings?.conversions ?? 0;

    // Onboarding check — nudge if incomplete
    const hasPsp = paymentStatus?.connectedProviders?.some((p) => p.onboardingCompleted) ?? false;
    const hasApproved = approvedCount > 0;
    const onboardingComplete = hasPsp && hasApproved;

    return (
        <>
            <TopNav title="Partner Dashboard" />
            <div className="p-8 relative z-0 space-y-8 w-full">
                <PspWarning type="affiliate" />

                {/* Onboarding nudge banner */}
                {!onboardingComplete && memberships !== undefined && (
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="material-icons text-primary text-xl">rocket_launch</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-white text-sm font-bold">Complete your onboarding</p>
                            <p className="text-text-grey text-xs mt-0.5">
                                {!hasPsp && "Connect a payment provider to start receiving commissions. "}
                                {!hasApproved && "Wait for a seller to approve your partnership request."}
                            </p>
                        </div>
                        <Link
                            href={`/app/${domain}/portal/settings`}
                            className="px-4 py-2 rounded-lg bg-primary text-black text-xs font-bold hover:bg-primary/90 transition-all active:scale-95"
                        >
                            View Settings
                        </Link>
                    </div>
                )}


                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Active Partnerships */}
                    <div className="group bg-surface-dark border border-white/5 p-6 rounded-lg relative overflow-hidden hover:border-white/10 transition-colors duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-text-grey text-sm font-medium mb-1">Active Partnerships</p>
                                <h3 className="text-3xl font-bold text-white tracking-tight">{approvedCount}</h3>
                            </div>
                            <div className="bg-primary/10 p-2 rounded-full">
                                <span className="material-icons text-primary text-xl">verified</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-primary text-sm font-medium">
                            <span>Approved stores</span>
                        </div>
                    </div>

                    {/* Pending Applications */}
                    <div className="group bg-surface-dark border border-white/5 p-6 rounded-lg relative overflow-hidden hover:border-white/10 transition-colors duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-text-grey text-sm font-medium mb-1">Pending Applications</p>
                                <h3 className="text-3xl font-bold text-white tracking-tight">{pendingCount}</h3>
                            </div>
                            <div className="bg-amber-500/10 p-2 rounded-full">
                                <span className="material-icons text-amber-400 text-xl">hourglass_empty</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-amber-400 text-sm font-medium">
                            <span>Awaiting seller approval</span>
                        </div>
                    </div>

                    {/* Total Earnings */}
                    <div className="group bg-surface-dark border border-white/5 p-6 rounded-lg relative overflow-hidden hover:border-white/10 transition-colors duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-text-grey text-sm font-medium mb-1">Total Earnings</p>
                                <h3 className="text-3xl font-bold text-white tracking-tight">{totalEarnings}</h3>
                            </div>
                            <div className="bg-primary/10 p-2 rounded-full">
                                <span className="material-icons text-primary text-xl">payments</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-primary text-sm font-medium">
                            <span>{conversions} conversion{conversions !== 1 ? "s" : ""}</span>
                        </div>
                    </div>
                </div>

                {/* My Store Memberships Table */}
                <div className="bg-surface-dark border border-white/5 rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white tracking-tight">My Store Memberships</h2>
                        <span className="text-text-grey text-sm font-medium">
                            {memberships?.length ?? 0} total
                        </span>
                    </div>

                    {/* Column Headers */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 text-text-grey text-xs font-medium uppercase tracking-widest">
                        <div className="col-span-5">Store</div>
                        <div className="col-span-2">Role</div>
                        <div className="col-span-3">Status</div>
                        <div className="col-span-2">Joined</div>
                    </div>

                    {/* Loading State */}
                    {memberships === undefined && (
                        <div className="px-6 py-12 text-center text-text-grey">
                            <span className="material-icons text-4xl mb-2 block animate-pulse">sync</span>
                            <p className="text-sm">Loading memberships...</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {memberships && memberships.length === 0 && (
                        <div className="px-6 py-16 text-center">
                            <span className="material-icons text-4xl text-text-grey mb-3 block">storefront</span>
                            <p className="text-white font-medium mb-1">No memberships yet</p>
                            <p className="text-text-grey text-sm">Apply to join a seller&apos;s affiliate program from their store page.</p>
                        </div>
                    )}

                    {/* Membership Rows */}
                    {memberships?.map((membership) => (
                        <div
                            key={membership._id}
                            className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 items-center hover:bg-white/[0.02] transition-colors"
                        >
                            {/* Store Name */}
                            <div className="col-span-5 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                                    <span className="material-icons text-text-grey text-lg">storefront</span>
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm text-white font-medium truncate">{membership.storeName}</p>
                                </div>
                            </div>

                            {/* Role */}
                            <div className="col-span-2">
                                <span className="text-xs font-medium text-text-grey bg-white/5 px-2 py-1 rounded-full">
                                    {membership.role}
                                </span>
                            </div>

                            {/* Status Badge */}
                            <div className="col-span-3">
                                {membership.status === "PENDING" && (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                                        <span className="relative flex h-1.5 w-1.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400"></span>
                                        </span>
                                        Pending
                                    </span>
                                )}
                                {membership.status === "APPROVED" && (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                                        <span className="material-icons text-[12px]">check_circle</span>
                                        Approved
                                    </span>
                                )}
                                {membership.status === "REJECTED" && (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                                        <span className="material-icons text-[12px]">cancel</span>
                                        Rejected
                                    </span>
                                )}
                                {!membership.status && (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-text-grey bg-white/5 px-3 py-1 rounded-full">
                                        Legacy
                                    </span>
                                )}
                            </div>

                            {/* Joined Date */}
                            <div className="col-span-2 text-sm text-text-grey">
                                {new Date(membership.joinedAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </div>

                        </div>
                    ))}
                </div>

                {/* Recent Earnings Table */}
                {earnings && earnings.transactions.length > 0 && (
                    <div className="bg-surface-dark border border-white/5 rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white tracking-tight">Recent Earnings</h2>
                            <span className="text-text-grey text-sm font-medium">
                                Last {earnings.transactions.length} transactions
                            </span>
                        </div>

                        {/* Column Headers */}
                        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 text-text-grey text-xs font-medium uppercase tracking-widest">
                            <div className="col-span-4">Product</div>
                            <div className="col-span-2">Sale Amount</div>
                            <div className="col-span-2">Your Commission</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-2 text-right">Date</div>
                        </div>

                        {earnings.transactions.map((txn) => (
                            <div
                                key={txn._id}
                                className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 items-center hover:bg-white/[0.02] transition-colors"
                            >
                                <div className="col-span-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                                        <span className="material-icons text-text-grey text-sm">inventory_2</span>
                                    </div>
                                    <p className="text-sm text-white font-medium truncate">{txn.productName}</p>
                                </div>

                                <div className="col-span-2 text-sm text-text-grey font-mono">
                                    ${(txn.amountTotalCents / 100).toFixed(2)}
                                </div>

                                <div className="col-span-2 text-sm text-primary font-mono font-bold">
                                    +${(txn.feeAffiliateCents / 100).toFixed(2)}
                                </div>

                                <div className="col-span-2">
                                    {(txn.status === "PAID" || txn.status === "SETTLED") && (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                                            <span className="material-icons text-[12px]">check_circle</span>
                                            {txn.status}
                                        </span>
                                    )}
                                    {txn.status === "PENDING" && (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                                            Pending
                                        </span>
                                    )}
                                    {(txn.status === "FAILED" || txn.status === "REFUNDED") && (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                                            {txn.status}
                                        </span>
                                    )}
                                </div>

                                <div className="col-span-2 text-sm text-text-grey text-right">
                                    {new Date(txn.createdAt).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
