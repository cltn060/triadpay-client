"use client";

import { useQuery, useAction } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "../../../../../../../convex/_generated/api";
import { TopNav } from "@/components/dashboard";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function PaymentsPage() {
    const t = useTranslations("SellerPayments");
    const myPsp = useQuery(api.paymentsHelpers.getSellerPaymentStatus);
    const connectStripe = useAction(api.stripeActions.onboardSeller);

    const [isRedirecting, setIsRedirecting] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const getStripeDashboard = useAction(api.stripeActions.getSellerStripeDashboardUrl);
    const checkStatus = useAction(api.stripeActions.checkStripeOnboardingStatus);

    const handleFinishSetup = async () => {
        setIsRedirecting("stripe");
        setError(null);
        try {
            const status = await checkStatus();
            if (status.detailsSubmitted && status.chargesEnabled && status.payoutsEnabled) {
                setIsRedirecting(null);
                return;
            }
            const returnUrl = window.location.href;
            const refreshUrl = window.location.href;
            const result = await connectStripe({ returnUrl, refreshUrl });
            if (result.url) window.location.href = result.url;
        } catch (err) {
            console.error("Verification error:", err);
            setError(t("connectionFailed"));
            setIsRedirecting(null);
        }
    };

    const handleConnect = async () => {
        setIsRedirecting("stripe");
        setError(null);
        try {
            const returnUrl = window.location.href;
            const refreshUrl = window.location.href;
            const result = await connectStripe({ returnUrl, refreshUrl });
            if (result.url) window.location.href = result.url;
        } catch (err) {
            console.error("Connection error:", err);
            setError(t("connectionFailed"));
            setIsRedirecting(null);
        }
    };

    const handleStripeDashboard = async () => {
        try {
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
            console.error("Dashboard error:", err);
        }
    };

    // Derive connection state
    const stripeConnectedData = myPsp?.connectedProviders.find(cp => cp.provider === "STRIPE");
    const isConnected = !!stripeConnectedData;
    const isOnboardingCompleted = stripeConnectedData?.onboardingCompleted ?? false;
    const storePsp = myPsp?.activePsp;

    return (
        <div className="flex flex-col h-full bg-[#050505] overflow-y-auto custom-scrollbar">
            <TopNav title={t("title")} />
            <div className="p-8 relative z-0 max-w-5xl mx-auto w-full">

                {/* Header Section */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-white tracking-tight mb-3">{t("paymentProviders")}</h2>
                    <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
                        {storePsp
                            ? t("activeProvider", { provider: storePsp === "STRIPE" ? "Stripe" : "Mercado Pago" })
                            : t("connectProviderNote")}
                    </p>
                </div>

                {/* Store PSP Read-Only Label */}
                {storePsp && (
                    <div className="mb-8 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-primary text-sm font-bold">
                            Store payment provider: {storePsp === "STRIPE" ? "Stripe" : "Mercado Pago"}
                        </span>
                        <span className="text-gray-500 text-xs ml-auto">Set by store owner</span>
                    </div>
                )}

                {error && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <span className="material-icons text-red-400">error_outline</span>
                        <p className="text-red-400 text-sm font-medium">{error}</p>
                    </div>
                )}

                {isRedirecting && (
                    <div className="mb-8 p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3 animate-pulse">
                        <span className="material-icons text-primary animate-spin">sync</span>
                        <p className="text-primary text-sm font-medium">{t("redirecting")}</p>
                    </div>
                )}

                {/* Stripe Card */}
                <div className="max-w-lg mb-16">
                    {myPsp === undefined ? (
                        <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden animate-pulse min-h-[400px]">
                            <div className="p-8 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5" />
                                    <div className="w-20 h-6 rounded-full bg-white/5" />
                                </div>
                                <div className="mb-8 space-y-3">
                                    <div className="w-32 h-6 bg-white/10 rounded" />
                                    <div className="w-full h-3 bg-white/5 rounded" />
                                    <div className="w-2/3 h-3 bg-white/5 rounded" />
                                </div>
                                <div className="mt-auto">
                                    <div className="w-full h-[54px] rounded-xl bg-white/5" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div
                            className={cn(
                                "group relative bg-[#121212] border transition-all duration-500 rounded-2xl overflow-hidden",
                                isConnected && isOnboardingCompleted
                                    ? "border-primary/50 shadow-2xl shadow-primary/5"
                                    : "border-white/5 hover:border-white/20"
                            )}
                        >
                            <div className={cn(
                                "absolute inset-0 bg-gradient-to-br transition-opacity duration-500",
                                isConnected && isOnboardingCompleted
                                    ? "from-primary/10 via-transparent to-transparent opacity-100"
                                    : "from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100"
                            )} />

                            <div className="relative p-8 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-8">
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center",
                                        isConnected && isOnboardingCompleted ? "bg-primary text-black" : "bg-white/5 text-gray-400"
                                    )}>
                                        <span className="material-icons text-3xl">payments</span>
                                    </div>
                                    {isConnected && isOnboardingCompleted ? (
                                        <span className="px-3 py-1 bg-primary/20 border border-primary/30 text-primary text-[10px] font-bold uppercase tracking-wider rounded-full">
                                            {t("connectedLabel")}
                                        </span>
                                    ) : isConnected && !isOnboardingCompleted ? (
                                        <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-wider rounded-full">
                                            {t("setupIncomplete")}
                                        </span>
                                    ) : null}
                                </div>

                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-white mb-2">Stripe</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        Standard choice for global commerce. High reliability and express dashboard.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">{t("platformFee")}</p>
                                        <p className="text-white font-mono text-lg">2.9% + 30¢</p>
                                    </div>
                                    <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">{t("payoutSpeed")}</p>
                                        <p className="text-white font-mono text-lg">2 days</p>
                                    </div>
                                </div>

                                <div className="mt-auto">
                                    {isConnected && isOnboardingCompleted ? (
                                        <button
                                            onClick={handleStripeDashboard}
                                            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-white/10 transition-all cursor-pointer"
                                        >
                                            <span className="material-icons text-lg">open_in_new</span>
                                            {t("viewDashboard")}
                                        </button>
                                    ) : isConnected && !isOnboardingCompleted ? (
                                        <button
                                            onClick={handleFinishSetup}
                                            disabled={!!isRedirecting}
                                            className="w-full py-4 px-6 rounded-xl bg-amber-500 text-black text-sm font-bold hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2"
                                        >
                                            {isRedirecting ? <span className="material-icons text-lg animate-spin">sync</span> : <span className="material-icons text-lg">build</span>}
                                            {t("finishSetup")}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleConnect}
                                            disabled={!!isRedirecting}
                                            className="w-full py-4 px-6 rounded-xl bg-white text-black text-sm font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <span className="material-icons text-lg">add_link</span>
                                            {t("connectWithName", { name: "Stripe" })}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Integration Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-white/5 pt-16 mb-16">
                    <div>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                            <span className="material-icons text-primary">security</span>
                        </div>
                        <h4 className="text-white font-bold mb-3">{t("secureEncrypted")}</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            {t("secureNote")}
                        </p>
                    </div>
                    <div>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                            <span className="material-icons text-primary">auto_graph</span>
                        </div>
                        <h4 className="text-white font-bold mb-3">{t("automaticSplits")}</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            {t("splitsNote")}
                        </p>
                    </div>
                    <div>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                            <span className="material-icons text-primary">payments</span>
                        </div>
                        <h4 className="text-white font-bold mb-3">{t("paymentProviders")}</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Your payment provider is set at the store level by the platform owner.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
