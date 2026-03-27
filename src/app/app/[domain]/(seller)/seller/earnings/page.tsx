"use client";

import { useQuery, useAction } from "convex/react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { api } from "../../../../../../../convex/_generated/api";
import { TopNav } from "@/components/dashboard";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/currency";

// ─── Status Badge ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const t = useTranslations("SellerEarnings.status");

    const config: Record<string, { label: string; icon: string; className: string }> = {
        PAID: { label: t("PAID"), icon: "check_circle", className: "text-primary bg-primary/10 border-primary/20" },
        SETTLED: { label: t("SETTLED"), icon: "check_circle", className: "text-primary bg-primary/10 border-primary/20" },
        PENDING: { label: t("PENDING"), icon: "", className: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
        AUTHORIZED: { label: t("AUTHORIZED"), icon: "", className: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
        IN_PROCESS: { label: t("IN_PROCESS"), icon: "", className: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
        FAILED: { label: t("FAILED"), icon: "cancel", className: "text-red-400 bg-red-500/10 border-red-500/20" },
        REFUNDED: { label: t("REFUNDED"), icon: "", className: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
    };

    const s = config[status] ?? { label: status, icon: "", className: "bg-white/10 text-white border-white/10" };

    return (
        <span className={cn("inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border", s.className)}>
            {s.icon && <span className="material-icons text-[10px]">{s.icon}</span>}
            {s.label}
        </span>
    );
}

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

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmt(cents: number) {
    return formatMoney(cents, "USD");
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

function Skeleton({ className }: { className?: string }) {
    return <div className={cn("animate-pulse bg-white/5 rounded", className)} />;
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function SellerEarningsPage() {
    const t = useTranslations("SellerEarnings");
    const data = useQuery(api.transactions.getSellerTransactions);
    const paymentStatus = useQuery(api.paymentsHelpers.getSellerPaymentStatus);
    const getStripeDashboard = useAction(api.stripeActions.getSellerStripeDashboardUrl);

    const [dashboardLoading, setDashboardLoading] = useState(false);

    const isLoading = data === undefined;
    const transactions = data?.transactions ?? [];

    const paidTxns = transactions.filter(
        (t) => t.status === "PAID" || t.status === "SETTLED"
    );
    const netEarningsCents = paidTxns.reduce((s, t) => s + t.netSellerCents, 0);
    const grossRevenueCents = paidTxns.reduce((s, t) => s + t.amountTotalCents, 0);
    const totalPlatformFees = paidTxns.reduce((s, t) => s + t.feePlatformCents, 0);
    const totalAffiliateCommissions = paidTxns.reduce((s, t) => s + t.feeAffiliateCents, 0);
    const successfulCount = paidTxns.length;

    const now = Date.now();
    const sevenDaysAgo = now - 7 * 86_400_000;
    const fourteenDaysAgo = now - 14 * 86_400_000;
    const recentNet = paidTxns
        .filter((t) => (t.createdAt ?? 0) >= sevenDaysAgo)
        .reduce((s, t) => s + t.netSellerCents, 0);
    const priorNet = paidTxns
        .filter((t) => {
            const ts = t.createdAt ?? 0;
            return ts >= fourteenDaysAgo && ts < sevenDaysAgo;
        })
        .reduce((s, t) => s + t.netSellerCents, 0);

    const trendPct = priorNet > 0
        ? (((recentNet - priorNet) / priorNet) * 100).toFixed(1)
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
        <div className="flex flex-col h-full bg-[#050505] overflow-y-auto custom-scrollbar">
            <TopNav title={t("title")} />
            <div className="p-8 w-full space-y-8 pb-24">

                {/* Page Header */}
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                        {t("netEarnings")}
                    </h2>
                    <p className="text-gray-400 mt-1 text-sm">
                        {t("netEarningsNote")}
                    </p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Net Earnings */}
                    <div className="group bg-[#121212] border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-500 text-sm font-medium mb-1">{t("netEarnings")}</p>
                                {isLoading ? (
                                    <Skeleton className="h-9 w-40 mt-1" />
                                ) : (
                                    <h3 className="text-3xl font-bold text-white tracking-tight">
                                        {fmt(netEarningsCents)}
                                    </h3>
                                )}
                            </div>
                            <div className="bg-primary/10 p-2 rounded-xl">
                                <span className="material-icons text-primary text-xl">account_balance_wallet</span>
                            </div>
                        </div>
                        <div className="flex items-end justify-between">
                            {isLoading ? (
                                <Skeleton className="h-6 w-20" />
                            ) : trendPct !== null ? (
                                <div className={cn(
                                    "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full border",
                                    parseFloat(trendPct) >= 0 ? "text-primary bg-primary/10 border-primary/20" : "text-red-400 bg-red-400/10 border-red-400/20"
                                )}>
                                    <span className="material-icons text-[14px]">{parseFloat(trendPct) >= 0 ? "arrow_upward" : "arrow_downward"}</span>
                                    <span>{Math.abs(parseFloat(trendPct))}% {t("vsLast7d")}</span>
                                </div>
                            ) : (
                                <span className="text-xs text-gray-500">{t("allTime")}</span>
                            )}
                        </div>
                    </div>

                    {/* Gross Revenue */}
                    <div className="group bg-[#121212] border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-500 text-sm font-medium mb-1">{t("grossRevenue")}</p>
                                {isLoading ? (
                                    <Skeleton className="h-9 w-32 mt-1" />
                                ) : (
                                    <h3 className="text-3xl font-bold text-white tracking-tight">
                                        {fmt(grossRevenueCents)}
                                    </h3>
                                )}
                            </div>
                            <div className="bg-white/5 p-2 rounded-xl">
                                <span className="material-icons text-gray-400 text-xl">trending_up</span>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500">
                            {isLoading ? (
                                <Skeleton className="h-4 w-28" />
                            ) : (
                                <span>{t("successfulSales", { count: successfulCount })}</span>
                            )}
                        </div>
                    </div>

                    {/* Platform Fees */}
                    <div className="group bg-[#121212] border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-500 text-sm font-medium mb-1">{t("platformFees")}</p>
                                {isLoading ? (
                                    <Skeleton className="h-9 w-28 mt-1" />
                                ) : (
                                    <h3 className="text-3xl font-bold text-red-400 tracking-tight">
                                        -{fmt(totalPlatformFees)}
                                    </h3>
                                )}
                            </div>
                            <div className="bg-red-500/10 p-2 rounded-xl">
                                <span className="material-icons text-red-400 text-xl">percent</span>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500">
                            {isLoading ? (
                                <Skeleton className="h-4 w-24" />
                            ) : (
                                <span>{t("deductedFromSales")}</span>
                            )}
                        </div>
                    </div>

                    {/* Affiliate Commissions */}
                    <div className="group bg-[#121212] border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-500 text-sm font-medium mb-1">{t("affiliatePayouts")}</p>
                                {isLoading ? (
                                    <Skeleton className="h-9 w-28 mt-1" />
                                ) : (
                                    <h3 className="text-3xl font-bold text-amber-400 tracking-tight">
                                        -{fmt(totalAffiliateCommissions)}
                                    </h3>
                                )}
                            </div>
                            <div className="bg-amber-500/10 p-2 rounded-xl">
                                <span className="material-icons text-amber-400 text-xl">group</span>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500">
                            {isLoading ? (
                                <Skeleton className="h-4 w-28" />
                            ) : (
                                <span>{t("paidToAffiliates")}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stripe Dashboard CTA */}
                <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="material-icons text-indigo-400 text-2xl">account_balance</span>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm">{t("viewOnStripe")}</h3>
                            <p className="text-gray-400 text-xs mt-0.5">
                                {t("stripeNote")}
                            </p>
                        </div>
                    </div>
                    {stripeConnected ? (
                        <button
                            onClick={handleStripeDashboard}
                            disabled={dashboardLoading}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-400 transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-wait flex-shrink-0"
                        >
                            <span className="material-icons text-sm">open_in_new</span>
                            {dashboardLoading ? t("opening") : t("openDashboard")}
                        </button>
                    ) : (
                        <span className="text-gray-500 text-xs font-medium flex-shrink-0 flex items-center gap-1.5">
                            <span className="material-icons text-sm">link_off</span>
                            {t("connectStripeFirst")}
                        </span>
                    )}
                </div>

                {/* Earnings Breakdown Table */}
                <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                    <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                        <h2 className="text-lg font-bold text-white tracking-tight">{t("earningsBreakdown")}</h2>
                        <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                            {isLoading ? "" : t("transactionsCount", { count: transactions.length })}
                        </span>
                    </div>

                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 text-gray-500 text-[10px] font-bold uppercase tracking-widest bg-white/[0.01]">
                        <div className="col-span-2">{t("colProduct")}</div>
                        <div className="col-span-2">{t("colGross")}</div>
                        <div className="col-span-2">{t("colPlatformFee")}</div>
                        <div className="col-span-2">{t("colAffiliate")}</div>
                        <div className="col-span-1">{t("colNet")}</div>
                        <div className="col-span-1">{t("colPsp")}</div>
                        <div className="col-span-1">{t("colStatus")}</div>
                        <div className="col-span-1 text-right">{t("colDate")}</div>
                    </div>

                    {isLoading ? (
                        <div className="px-6 py-4 space-y-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="grid grid-cols-12 gap-4 items-center">
                                    <div className="col-span-2"><Skeleton className="h-5 w-full" /></div>
                                    <div className="col-span-2"><Skeleton className="h-5 w-16" /></div>
                                    <div className="col-span-2"><Skeleton className="h-5 w-14" /></div>
                                    <div className="col-span-2"><Skeleton className="h-5 w-14" /></div>
                                    <div className="col-span-1"><Skeleton className="h-5 w-16" /></div>
                                    <div className="col-span-1"><Skeleton className="h-5 w-12" /></div>
                                    <div className="col-span-1"><Skeleton className="h-5 w-14" /></div>
                                    <div className="col-span-1"><Skeleton className="h-5 w-20 ml-auto" /></div>
                                </div>
                            ))}
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="px-6 py-20 text-center">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5">
                                <span className="material-icons text-3xl text-gray-600">receipt_long</span>
                            </div>
                            <p className="text-white font-bold mb-1">{t("noEarnings")}</p>
                            <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
                                {t("startSellingNote")}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {transactions.map((txn) => (
                                <div
                                    key={txn._id}
                                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors group"
                                >
                                    <div className="col-span-2 flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                            <span className="material-icons text-gray-500 text-sm">inventory_2</span>
                                        </div>
                                        <p className="text-sm text-white font-medium truncate">{txn.productName}</p>
                                    </div>

                                    <div className="col-span-2 text-sm text-gray-400 font-mono">
                                        {fmt(txn.amountTotalCents)}
                                    </div>

                                    <div className="col-span-2 text-sm text-red-400/70 font-mono">
                                        -{fmt(txn.feePlatformCents)}
                                    </div>

                                    <div className="col-span-2 text-sm text-amber-400/70 font-mono">
                                        -{fmt(txn.feeAffiliateCents)}
                                    </div>

                                    <div className="col-span-1 text-sm text-primary font-mono font-bold">
                                        {fmt(txn.netSellerCents)}
                                    </div>

                                    <div className="col-span-1">
                                        <PSPBadge provider={txn.pspProvider} />
                                    </div>

                                    <div className="col-span-1">
                                        <StatusBadge status={txn.status} />
                                    </div>

                                    <div className="col-span-1 text-[10px] text-gray-500 font-bold uppercase text-right">
                                        {formatDate(txn.createdAt)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
