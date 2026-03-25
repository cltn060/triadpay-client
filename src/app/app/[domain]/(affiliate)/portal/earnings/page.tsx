"use client";

import { useQuery, useAction } from "convex/react";
import { useCallback, useState } from "react";
import { api } from "../../../../../../../convex/_generated/api";
import { TopNav } from "@/components/dashboard";

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmt(cents: number) {
    return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function formatDate(ts?: number) {
    if (!ts) return "—";
    return new Date(ts).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// ─── Skeleton ───────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-white/5 rounded ${className ?? ""}`} />;
}

// ─── Status Badge ───────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; icon: string; className: string }> = {
    PAID: { label: "Paid", icon: "check_circle", className: "text-primary bg-primary/10 border-primary/20" },
    SETTLED: { label: "Settled", icon: "check_circle", className: "text-primary bg-primary/10 border-primary/20" },
    PENDING: { label: "Pending", icon: "", className: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    AUTHORIZED: { label: "Auth", icon: "", className: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    IN_PROCESS: { label: "Processing", icon: "", className: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    FAILED: { label: "Failed", icon: "cancel", className: "text-red-400 bg-red-500/10 border-red-500/20" },
    REFUNDED: { label: "Refunded", icon: "", className: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
};

// ─── PSP Badge ──────────────────────────────────────────────────────────────

function PSPBadge({ provider }: { provider: string }) {
    if (provider === "STRIPE") {
        return (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 uppercase tracking-wider">
                Stripe
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20 uppercase tracking-wider">
            MP
        </span>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function AffiliateEarningsPage() {
    const earnings = useQuery(api.transactions.getAffiliateEarnings);
    const paymentStatus = useQuery(api.paymentsHelpers.getAffiliatePaymentStatus);
    const getStripeDashboard = useAction(api.stripeActions.getAffiliateStripeDashboardUrl);

    const [dashboardLoading, setDashboardLoading] = useState(false);

    const isLoading = earnings === undefined;

    // Computed stats
    const totalEarnings = earnings?.totalEarningsCents ?? 0;
    const conversions = earnings?.conversions ?? 0;
    const avgCommission = conversions > 0 ? Math.round(totalEarnings / conversions) : 0;
    const transactions = earnings?.transactions ?? [];

    // Period stats (last 7 days vs prior 7 days)
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 86_400_000;
    const fourteenDaysAgo = now - 14 * 86_400_000;
    const recentEarnings = transactions
        .filter((t) => (t.status === "PAID" || t.status === "SETTLED") && (t.createdAt ?? 0) >= sevenDaysAgo)
        .reduce((s, t) => s + t.feeAffiliateCents, 0);
    const priorEarnings = transactions
        .filter((t) => {
            const ts = t.createdAt ?? 0;
            return (t.status === "PAID" || t.status === "SETTLED") && ts >= fourteenDaysAgo && ts < sevenDaysAgo;
        })
        .reduce((s, t) => s + t.feeAffiliateCents, 0);
    const trendPct = priorEarnings > 0
        ? (((recentEarnings - priorEarnings) / priorEarnings) * 100).toFixed(1)
        : null;

    const stripeConnected = paymentStatus?.connectedProviders?.some(
        (p) => p.provider === "STRIPE"
    ) ?? false;

    const handleStripeDashboard = useCallback(async () => {
        try {
            setDashboardLoading(true);
            const currentUrl = window.location.href.split("?")[0];
            const result = await getStripeDashboard({
                returnUrl: `${currentUrl}?stripe_return=success`,
                refreshUrl: `${currentUrl}?stripe_return=refresh`,
            });
            if (result.needsOnboarding) {
                window.location.href = result.url;
            } else {
                window.open(result.url, "_blank");
            }
        } catch (err) {
            console.error("[stripe] Failed to get dashboard link:", err);
        } finally {
            setDashboardLoading(false);
        }
    }, [getStripeDashboard]);

    return (
        <>
            <TopNav title="Earnings" />
            <div className="flex-1 overflow-y-auto relative z-0 p-8 pt-6 space-y-8 w-full">

                {/* Page Header */}
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                        Commission Earnings
                    </h2>
                    <p className="text-text-grey mt-1 text-sm">
                        Track your commissions across all products and stores.
                    </p>
                </div>

                {/* ── Stat Cards ─────────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Total Earnings */}
                    <div className="group bg-surface-dark border border-white/5 p-6 rounded-lg hover:border-white/10 transition-colors duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-text-grey text-sm font-medium mb-1">Total Earnings</p>
                                {isLoading ? (
                                    <Skeleton className="h-9 w-40 mt-1" />
                                ) : (
                                    <h3 className="text-3xl font-bold text-white tracking-tight">
                                        {fmt(totalEarnings)}
                                    </h3>
                                )}
                            </div>
                            <div className="bg-primary/10 p-2 rounded-full">
                                <span className="material-icons text-primary text-xl">payments</span>
                            </div>
                        </div>
                        <div className="flex items-end justify-between">
                            {isLoading ? (
                                <Skeleton className="h-6 w-20" />
                            ) : trendPct !== null ? (
                                <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full border ${parseFloat(trendPct) >= 0 ? "text-primary bg-primary/10 border-primary/20" : "text-red-400 bg-red-400/10 border-red-400/20"}`}>
                                    <span className="material-icons text-[14px]">{parseFloat(trendPct) >= 0 ? "arrow_upward" : "arrow_downward"}</span>
                                    <span>{Math.abs(parseFloat(trendPct))}% vs last 7d</span>
                                </div>
                            ) : (
                                <span className="text-xs text-text-grey">All time</span>
                            )}
                            <svg className="w-32 h-10 text-primary drop-shadow-[0_0_8px_rgba(0,255,0,0.4)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 100 30">
                                <path d="M0 25 L10 20 L20 22 L30 15 L40 18 L50 10 L60 14 L70 5 L80 12 L90 8 L100 2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                            </svg>
                        </div>
                    </div>

                    {/* Conversions */}
                    <div className="group bg-surface-dark border border-white/5 p-6 rounded-lg hover:border-white/10 transition-colors duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-text-grey text-sm font-medium mb-1">Conversions</p>
                                {isLoading ? (
                                    <Skeleton className="h-9 w-20 mt-1" />
                                ) : (
                                    <h3 className="text-3xl font-bold text-white tracking-tight">
                                        {conversions}
                                    </h3>
                                )}
                            </div>
                            <div className="bg-white/5 p-2 rounded-full">
                                <span className="material-icons text-slate-400 text-xl">shopping_cart</span>
                            </div>
                        </div>
                        <div className="text-xs text-text-grey">
                            {isLoading ? (
                                <Skeleton className="h-4 w-28" />
                            ) : (
                                <span>Sales completed via your links</span>
                            )}
                        </div>
                    </div>

                    {/* Avg Commission */}
                    <div className="group bg-surface-dark border border-white/5 p-6 rounded-lg hover:border-white/10 transition-colors duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-text-grey text-sm font-medium mb-1">Avg. Commission</p>
                                {isLoading ? (
                                    <Skeleton className="h-9 w-28 mt-1" />
                                ) : (
                                    <h3 className="text-3xl font-bold text-white tracking-tight">
                                        {conversions > 0 ? fmt(avgCommission) : "—"}
                                    </h3>
                                )}
                            </div>
                            <div className="bg-white/5 p-2 rounded-full">
                                <span className="material-icons text-slate-400 text-xl">insights</span>
                            </div>
                        </div>
                        <div className="text-xs text-text-grey">
                            {isLoading ? (
                                <Skeleton className="h-4 w-24" />
                            ) : (
                                <span>Per conversion</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Stripe Dashboard CTA ───────────────────────────────── */}
                <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/5 border border-indigo-500/20 rounded-xl p-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="material-icons text-indigo-400 text-2xl">account_balance</span>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm">View Full Payout Details on Stripe</h3>
                            <p className="text-gray-400 text-xs mt-0.5">
                                See your balance, upcoming bank transfers, payout history, and tax documents.
                            </p>
                        </div>
                    </div>
                    {stripeConnected ? (
                        <button
                            onClick={handleStripeDashboard}
                            disabled={dashboardLoading}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-400 transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-wait flex-shrink-0"
                        >
                            <span className="material-icons text-sm">open_in_new</span>
                            {dashboardLoading ? "Opening..." : "Open Dashboard"}
                        </button>
                    ) : (
                        <span className="text-gray-500 text-xs font-medium flex-shrink-0 flex items-center gap-1.5">
                            <span className="material-icons text-sm">link_off</span>
                            Connect Stripe in Payments first
                        </span>
                    )}
                </div>

                {/* ── Earnings History Table ─────────────────────────────── */}
                <div className="bg-surface-dark border border-white/5 rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white tracking-tight">Earnings History</h2>
                        <span className="text-text-grey text-sm font-medium">
                            {isLoading ? "" : `${transactions.length} transaction${transactions.length !== 1 ? "s" : ""}`}
                        </span>
                    </div>

                    {/* Column Headers */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 text-text-grey text-xs font-medium uppercase tracking-widest">
                        <div className="col-span-3">Product</div>
                        <div className="col-span-2">Sale Amount</div>
                        <div className="col-span-2">Your Commission</div>
                        <div className="col-span-1">Provider</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2 text-right">Date</div>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="px-6 py-4 space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="grid grid-cols-12 gap-4 items-center">
                                    <div className="col-span-3"><Skeleton className="h-5 w-full" /></div>
                                    <div className="col-span-2"><Skeleton className="h-5 w-20" /></div>
                                    <div className="col-span-2"><Skeleton className="h-5 w-16" /></div>
                                    <div className="col-span-1"><Skeleton className="h-5 w-12" /></div>
                                    <div className="col-span-2"><Skeleton className="h-5 w-16" /></div>
                                    <div className="col-span-2"><Skeleton className="h-5 w-20 ml-auto" /></div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && transactions.length === 0 && (
                        <div className="px-6 py-16 text-center">
                            <span className="material-icons text-4xl text-text-grey mb-3 block opacity-30">receipt_long</span>
                            <p className="text-white font-medium mb-1">No earnings yet</p>
                            <p className="text-text-grey text-sm">
                                Share your affiliate links to start earning commissions.
                            </p>
                        </div>
                    )}

                    {/* Transaction Rows */}
                    {!isLoading && transactions.map((txn) => {
                        const status = statusConfig[txn.status] ?? { label: txn.status, icon: "", className: "bg-white/10 text-white border-white/10" };
                        return (
                            <div
                                key={txn._id}
                                className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 items-center hover:bg-white/[0.02] transition-colors"
                            >
                                {/* Product */}
                                <div className="col-span-3 flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                                        <span className="material-icons text-text-grey text-sm">inventory_2</span>
                                    </div>
                                    <p className="text-sm text-white font-medium truncate">{txn.productName}</p>
                                </div>

                                {/* Sale Amount */}
                                <div className="col-span-2 text-sm text-text-grey font-mono">
                                    {fmt(txn.amountTotalCents)}
                                </div>

                                {/* Commission */}
                                <div className="col-span-2 text-sm text-primary font-mono font-bold">
                                    +{fmt(txn.feeAffiliateCents)}
                                </div>

                                {/* Provider */}
                                <div className="col-span-1">
                                    <PSPBadge provider={txn.pspProvider} />
                                </div>

                                {/* Status */}
                                <div className="col-span-2">
                                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${status.className}`}>
                                        {status.icon && (
                                            <span className="material-icons text-[12px]">{status.icon}</span>
                                        )}
                                        {status.label}
                                    </span>
                                </div>

                                {/* Date */}
                                <div className="col-span-2 text-sm text-text-grey text-right">
                                    {formatDate(txn.createdAt)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
