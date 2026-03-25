"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useQuery, useAction } from "convex/react";
import { useSearchParams } from "next/navigation";
import { api } from "../../../../../../../convex/_generated/api";
import { TopNav } from "@/components/dashboard";
import { StripeLogo, MercadoPagoLogo, PagarMeLogo } from "@/components/dashboard/PaymentLogos";

type LogoComponent = React.ComponentType;

// ─── Skeleton Card (shown while loading) ────────────────────────────────────
function PSPCardSkeleton() {
    return (
        <div className="bg-[#0d0d0d] border border-white/5 rounded-2xl p-5 animate-pulse flex flex-col h-full">
            <div className="w-full aspect-[16/9] bg-white/5 rounded-xl mb-4" />
            <div className="h-5 w-24 bg-white/5 rounded mb-2" />
            <div className="h-3 w-full bg-white/5 rounded mb-1" />
            <div className="h-3 w-2/3 bg-white/5 rounded mb-4" />
            <div className="mt-auto space-y-3">
                <div className="flex justify-between"><div className="h-3 w-20 bg-white/5 rounded" /><div className="h-3 w-16 bg-white/5 rounded" /></div>
                <div className="flex justify-between"><div className="h-3 w-20 bg-white/5 rounded" /><div className="h-3 w-16 bg-white/5 rounded" /></div>
                <div className="border-t border-white/5 pt-3"><div className="h-10 w-full bg-white/5 rounded-xl" /></div>
            </div>
        </div>
    );
}

// ─── PSP Card ───────────────────────────────────────────────────────────────
function PSPCard({
    name,
    Logo,
    description,
    platformFee,
    payoutTime,
    region,
    connected,
    connectedLabel,
    comingSoon,
    isActive,
    setupIncomplete,
    onConnect,
    onDashboard,
    onFinishSetup,
}: {
    name: string;
    Logo: LogoComponent;
    description: string;
    platformFee: string;
    payoutTime: string;
    region: string;
    connected?: boolean;
    connectedLabel?: string;
    comingSoon?: boolean;
    isActive?: boolean;
    setupIncomplete?: boolean;
    onConnect?: () => void;
    onDashboard?: () => void;
    onFinishSetup?: () => void;
}) {
    return (
        <div className={`group bg-[#0d0d0d] border ${isActive ? "border-[#0df20d]/40 shadow-[0_0_20px_rgba(13,242,13,0.08)]" : "border-white/5 hover:border-white/10"} rounded-2xl p-5 transition-all duration-300 flex flex-col h-full ${comingSoon ? "opacity-70" : ""}`}>
            {/* Logo area */}
            <div className="relative w-full aspect-[16/9] bg-white rounded-xl mb-4 overflow-hidden flex items-center justify-center px-8 py-6">
                <Logo />
                <div className="absolute top-3 right-3">
                    {comingSoon ? (
                        <span className="bg-black/60 backdrop-blur-md text-gray-400 text-[10px] uppercase font-bold px-2 py-1 rounded border border-white/10">
                            Coming Soon
                        </span>
                    ) : isActive ? (
                        <span className="bg-black/60 backdrop-blur-md text-[#0df20d] text-[10px] uppercase font-bold px-2 py-1 rounded border border-[#0df20d]/30 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0df20d] animate-pulse inline-block" />
                            Store Provider
                        </span>
                    ) : setupIncomplete ? (
                        <span className="bg-black/60 backdrop-blur-md text-amber-500 text-[10px] uppercase font-bold px-2 py-1 rounded border border-amber-500/30 flex items-center gap-1">
                            Setup Incomplete
                        </span>
                    ) : connected ? (
                        <span className="bg-black/60 backdrop-blur-md text-blue-400 text-[10px] uppercase font-bold px-2 py-1 rounded border border-blue-400/30 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                            {connectedLabel || "Connected"}
                        </span>
                    ) : (
                        <span className="bg-black/60 backdrop-blur-md text-gray-400 text-[10px] uppercase font-bold px-2 py-1 rounded border border-white/10">
                            {region}
                        </span>
                    )}
                </div>
            </div>

            {/* Name */}
            <h3 className="text-white font-bold text-base leading-tight mb-1 group-hover:text-primary transition-colors">
                {name}
            </h3>

            {/* Description */}
            <p className="text-gray-500 text-xs mb-4 line-clamp-2">{description}</p>

            {/* Fee / payout details */}
            <div className="mt-auto space-y-3">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 flex items-center gap-1">
                        <span className="material-icons text-[13px]">percent</span>
                        Platform fee
                    </span>
                    <span className="text-white font-mono font-bold">{platformFee}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 flex items-center gap-1">
                        <span className="material-icons text-[13px]">schedule</span>
                        Payout speed
                    </span>
                    <span className="text-white font-mono font-bold">{payoutTime}</span>
                </div>

                <div className="border-t border-white/5 pt-3 space-y-2">
                    {isActive ? (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[#0df20d] text-xs font-bold">
                                <span className="w-2 h-2 rounded-full bg-[#0df20d] animate-pulse" />
                                Store payment provider
                            </div>
                            {connected && onDashboard && (
                                <button
                                    onClick={onDashboard}
                                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-xs font-medium transition-all cursor-pointer hover:bg-white/10 hover:text-white active:scale-95"
                                >
                                    <span className="material-icons text-xs">open_in_new</span>
                                    View Dashboard
                                </button>
                            )}
                            {!connected && onConnect && (
                                <button
                                    onClick={onConnect}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white text-black text-sm font-bold transition-all cursor-pointer hover:bg-gray-200 active:scale-95"
                                >
                                    <span className="material-icons text-sm">link</span>
                                    Connect {name}
                                </button>
                            )}
                        </div>
                    ) : setupIncomplete ? (
                        <button
                            onClick={onFinishSetup}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 text-black text-sm font-bold transition-all cursor-pointer hover:bg-amber-400 active:scale-95"
                        >
                            <span className="material-icons text-sm">build</span>
                            Finish Setup
                        </button>
                    ) : connected ? (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold">
                                <span className="w-2 h-2 rounded-full bg-blue-400" />
                                Connected
                            </div>
                            {onDashboard && (
                                <button
                                    onClick={onDashboard}
                                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-xs font-medium transition-all cursor-pointer hover:bg-white/10 hover:text-white active:scale-95"
                                >
                                    <span className="material-icons text-xs">open_in_new</span>
                                    View Dashboard
                                </button>
                            )}
                        </div>
                    ) : comingSoon ? (
                        <div className="text-gray-500 text-xs font-medium">Not yet available</div>
                    ) : (
                        <button
                            onClick={onConnect}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white text-black text-sm font-bold transition-all cursor-pointer hover:bg-gray-200 active:scale-95"
                        >
                            <span className="material-icons text-sm">link</span>
                            Connect {name}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Info Panel ─────────────────────────────────────────────────────────────
function HowItWorksPanel() {
    const steps = [
        { icon: "link", title: "Connect a Provider", desc: "Link your Stripe account to receive commission payouts." },
        { icon: "share", title: "Share Links", desc: "Promote products using your unique tracking links. Each click and conversion is tracked." },
        { icon: "payments", title: "Earn Commissions", desc: "When a customer buys through your link, your commission is automatically sent to your account." },
    ];

    return (
        <div className="bg-[#0d0d0d] border border-white/5 rounded-2xl p-6 h-fit sticky top-8">
            <div className="flex items-center gap-2 mb-5">
                <span className="material-icons text-[#0df20d] text-lg">info</span>
                <h3 className="text-white font-bold text-sm">How It Works</h3>
            </div>

            <div className="space-y-5">
                {steps.map((step, i) => (
                    <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center shrink-0">
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center">
                                <span className="material-icons text-[#0df20d] text-sm">{step.icon}</span>
                            </div>
                            {i < steps.length - 1 && (
                                <div className="w-px h-full bg-white/5 mt-1" />
                            )}
                        </div>
                        <div className="pb-4">
                            <p className="text-white text-sm font-bold mb-0.5">{step.title}</p>
                            <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-5 pt-5 border-t border-white/5 space-y-3">
                <div className="flex items-start gap-2.5">
                    <span className="material-icons text-[14px] text-[#0df20d] mt-0.5">verified_user</span>
                    <div>
                        <p className="text-white text-xs font-bold">Secure & Encrypted</p>
                        <p className="text-gray-600 text-[10px]">All credentials are stored securely. We never access your funds directly.</p>
                    </div>
                </div>
                <div className="flex items-start gap-2.5">
                    <span className="material-icons text-[14px] text-[#0df20d] mt-0.5">trending_up</span>
                    <div>
                        <p className="text-white text-xs font-bold">Track Performance</p>
                        <p className="text-gray-600 text-[10px]">See clicks, conversions, and earnings for every link variant you share.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Affiliate Payments Content ─────────────────────────────────────────────
function AffiliatePaymentsContent() {
    const paymentStatus = useQuery(api.paymentsHelpers.getAffiliatePaymentStatus);

    // Stripe actions (affiliate-specific)
    const onboardAffiliate = useAction(api.stripeActions.onboardAffiliate);
    const checkStripeStatus = useAction(api.stripeActions.checkAffiliateStripeStatus);
    const getStripeDashboard = useAction(api.stripeActions.getAffiliateStripeDashboardUrl);

    const searchParams = useSearchParams();
    const stripeReturn = searchParams.get("stripe_return");

    const [isConnecting, setIsConnecting] = useState(false);

    // Handle Stripe onboarding return
    useEffect(() => {
        if (stripeReturn === "success") {
            checkStripeStatus().catch(console.error);
            window.history.replaceState({}, "", window.location.pathname);
        }
    }, [stripeReturn, checkStripeStatus]);

    const handleConnectStripe = useCallback(async () => {
        try {
            setIsConnecting(true);
            const currentUrl = window.location.href.split("?")[0];
            const result = await onboardAffiliate({
                returnUrl: `${currentUrl}?stripe_return=success`,
                refreshUrl: `${currentUrl}?stripe_return=refresh`,
            });
            window.location.href = result.url;
        } catch (err) {
            console.error("[stripe] Failed to generate onboarding link:", err);
            setIsConnecting(false);
        }
    }, [onboardAffiliate]);

    const handleFinishStripeSetup = useCallback(async () => {
        try {
            setIsConnecting(true);
            const status = await checkStripeStatus();
            if (status.detailsSubmitted && status.chargesEnabled && status.payoutsEnabled) {
                setIsConnecting(false);
                return;
            }
            const currentUrl = window.location.href.split("?")[0];
            const result = await onboardAffiliate({
                returnUrl: `${currentUrl}?stripe_return=success`,
                refreshUrl: `${currentUrl}?stripe_return=refresh`,
            });
            window.location.href = result.url;
        } catch (err) {
            console.error("[stripe] Failed to verify or resume onboarding:", err);
            setIsConnecting(false);
        }
    }, [checkStripeStatus, onboardAffiliate]);

    const handleStripeDashboard = useCallback(async () => {
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
            console.error("[stripe] Failed to get dashboard link:", err);
        }
    }, [getStripeDashboard]);

    // Loading state
    const isLoading = paymentStatus === undefined;

    // Derive connection states
    const stripeConnectedData = paymentStatus?.connectedProviders?.find(
        (p) => p.provider === "STRIPE"
    );
    const stripeConnected = !!stripeConnectedData;
    const stripeSetupIncomplete = stripeConnectedData ? !stripeConnectedData.onboardingCompleted : false;

    const stripeAccountId = stripeConnectedData?.connectedAccountId;

    // Store-level PSP (read-only)
    const activePsp = paymentStatus?.activePsp;

    return (
        <div className="w-full">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white">Payment Providers</h2>
                <p className="text-gray-400 text-sm mt-1">
                    Connect your Stripe account to receive your affiliate commissions directly.
                </p>
            </div>

            {/* Store PSP Read-Only Banner */}
            {activePsp && (
                <div className="mb-6 p-4 rounded-xl bg-[#0df20d]/5 border border-[#0df20d]/20 flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0df20d] animate-pulse" />
                    <span className="text-[#0df20d] text-sm font-bold">
                        Store payment provider: {activePsp === "STRIPE" ? "Stripe" : "Mercado Pago"}
                    </span>
                    <span className="text-gray-500 text-xs ml-auto">Set by store owner</span>
                </div>
            )}

            {/* No PSP warning */}
            {paymentStatus && paymentStatus.connectedProviders.length === 0 && (
                <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-amber-400 text-sm">
                    <span className="material-icons">warning</span>
                    You have no payment provider connected. Connect one below to receive commissions from sales.
                </div>
            )}

            {isConnecting && (
                <div className="mb-6 p-4 rounded-xl text-sm flex items-center gap-3 bg-white/5 border border-white/10 text-gray-400">
                    <span className="material-icons">hourglass_empty</span>
                    Redirecting to payment provider...
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: PSP Cards */}
                <div className="lg:col-span-8">
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                            <PSPCardSkeleton />
                            <PSPCardSkeleton />
                            <PSPCardSkeleton />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                            <PSPCard
                                name="Stripe"
                                Logo={StripeLogo}
                                description={stripeConnected
                                    ? `Connected · Account: ${stripeAccountId}`
                                    : "Global payment processing. Receive commissions via cards, wallets and bank transfers."}
                                platformFee="2.9% + 30¢"
                                payoutTime="2 – 7 days"
                                region="Global"
                                connected={stripeConnected}
                                connectedLabel="Connected"
                                isActive={activePsp === "STRIPE"}
                                setupIncomplete={stripeSetupIncomplete}
                                onConnect={handleConnectStripe}
                                onFinishSetup={handleFinishStripeSetup}
                                onDashboard={stripeConnected && !stripeSetupIncomplete ? handleStripeDashboard : undefined}
                            />

                            <PSPCard
                                name="Mercado Pago"
                                Logo={MercadoPagoLogo}
                                description="Receive commissions across Latin America — Pix, Boleto, cards, and more."
                                platformFee="3.99%"
                                payoutTime="Instant – 30 days"
                                region="LATAM"
                                comingSoon
                            />

                            <PSPCard
                                name="Pagar.me"
                                Logo={PagarMeLogo}
                                description="High-conversion payment infrastructure purpose-built for the Brazilian market."
                                platformFee="~3.79% + R$0.39"
                                payoutTime="Instant – 30 days"
                                region="Brazil"
                                comingSoon
                            />
                        </div>
                    )}
                </div>

                {/* Right: How It Works */}
                <div className="lg:col-span-4">
                    <HowItWorksPanel />
                </div>
            </div>
        </div>
    );
}

// ─── Affiliate Payments Page ────────────────────────────────────────────────
export default function AffiliatePaymentsPage() {
    return (
        <>
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
            <TopNav title="Payments" />
            <div className="p-8 w-full">
                <Suspense fallback={<div className="text-gray-500 text-sm">Loading payments configuration...</div>}>
                    <AffiliatePaymentsContent />
                </Suspense>
            </div>
        </>
    );
}
