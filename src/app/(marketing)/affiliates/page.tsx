"use client";

import { useEffect, useState, Suspense } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function AffiliatePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
            <AffiliatePageContent />
        </Suspense>
    );
}

function AffiliatePageContent() {
    const { user, isLoaded: isClerkLoaded } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();

    // The single source of context: ?sellerRef=pantheon
    const sellerRef = searchParams.get("sellerRef") ?? "";
    const isTenantMode = sellerRef.length > 0;

    // Fetch store data only when a sellerRef is present
    const store = useQuery(
        api.stores.getStoreBySlug,
        isTenantMode ? { slug: sellerRef } : "skip"
    );

    // Determine role from Clerk metadata
    const role = user?.unsafeMetadata?.role as string | undefined;
    const isAffiliate = role === "AFFILIATE";
    const isSeller = role === "SELLER";

    // The "magic join" mutation
    const requestMembership = useMutation(api.memberships.requestStoreMembership);
    const [joinState, setJoinState] = useState<"idle" | "joining" | "done" | "error">("idle");

    // --- The Smart Traffic Cop (only fires in tenant mode) ---
    useEffect(() => {
        if (!isClerkLoaded || !isTenantMode) return;
        if (store === undefined) return; // Still loading

        // Seller clicked an affiliate link — bounce
        if (user && isSeller) {
            router.replace("/seller");
            return;
        }

        // Affiliate is logged in — fire the magic join
        if (user && isAffiliate && joinState === "idle" && store) {
            setJoinState("joining");
            requestMembership({ storeSlug: sellerRef })
                .then(() => {
                    setJoinState("done");
                    router.replace("/portal");
                })
                .catch((err) => {
                    console.error("Failed to join store:", err);
                    setJoinState("error");
                });
        }
    }, [isClerkLoaded, user, store, isAffiliate, isSeller, joinState, sellerRef, isTenantMode, requestMembership, router]);

    // --- Loading state (tenant mode only, waiting for store data) ---
    if (isTenantMode && (!isClerkLoaded || store === undefined)) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center font-sans">
                {/* eslint-disable-next-line @next/next/no-page-custom-font */}
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
                <div className="animate-pulse text-[#0df20d] flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined text-4xl">storefront</span>
                    <span className="text-sm font-medium text-gray-500">Loading...</span>
                </div>
            </div>
        );
    }

    // --- Tenant mode: store not found ---
    if (isTenantMode && store === null) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center font-sans">
                {/* eslint-disable-next-line @next/next/no-page-custom-font */}
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
                <div className="text-center">
                    <span className="material-symbols-outlined text-5xl text-gray-600 mb-4 block">error_outline</span>
                    <h1 className="text-white text-2xl font-bold mb-2">Store Not Found</h1>
                    <p className="text-gray-500 text-sm">The store &ldquo;{sellerRef}&rdquo; doesn&apos;t exist.</p>
                </div>
            </div>
        );
    }

    // --- Affiliate is logged in + tenant mode: show "connecting" spinner ---
    if (isTenantMode && user && isAffiliate && joinState !== "error") {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center font-sans">
                {/* eslint-disable-next-line @next/next/no-page-custom-font */}
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
                <div className="flex flex-col items-center gap-6 text-center max-w-md px-6">
                    <div className="w-20 h-20 rounded-full bg-[#0df20d]/10 border-2 border-[#0df20d]/30 flex items-center justify-center animate-pulse">
                        <span className="material-symbols-outlined text-[#0df20d] text-3xl">handshake</span>
                    </div>
                    <div>
                        <h2 className="text-white text-xl font-bold tracking-tight mb-2">
                            Connecting to {store?.name}
                        </h2>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Setting up your partnership request...
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-[#0df20d] text-xs font-bold">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                    </div>
                </div>
            </div>
        );
    }

    // --- The Marketing Page (both modes) ---
    const displayName = isTenantMode && store ? store.name : "Caruma";
    const signUpUrl = isTenantMode
        ? `/sign-up/affiliate?store=${sellerRef}`
        : `/sign-up/affiliate`;

    return (
        <div className="relative flex flex-col min-h-screen w-full overflow-x-hidden bg-[#050505] font-sans text-white" style={{
            backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
        }}>
            {/* eslint-disable-next-line @next/next/no-page-custom-font */}
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

            {/* Header */}
            <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-[#2a2a2a]">
                <div className="flex items-center gap-3">
                    <div className="bg-[#0df20d] p-1.5 rounded-lg">
                        <span className="material-symbols-outlined text-black font-bold text-2xl">sports_esports</span>
                    </div>
                    <h2 className="text-xl font-extrabold tracking-tight text-white uppercase italic">
                        {displayName}
                    </h2>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="/sign-in" className="border border-[#2a2a2a] hover:border-[#0df20d]/50 text-white px-6 py-2 rounded-full text-sm font-semibold transition-all">
                        Login
                    </Link>
                </div>
            </header>

            {/* Hero */}
            <main className="flex-grow flex flex-col items-center justify-center px-6 py-20 text-center relative z-10">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0df20d]/10 border border-[#0df20d]/20 text-[#0df20d] text-xs font-bold tracking-widest uppercase mb-4">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0df20d] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0df20d]"></span>
                        </span>
                        Now accepting partners
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tighter">
                        Partner with <br />
                        <span className="text-[#0df20d] italic">{displayName}</span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Join our high-performance affiliate program and earn a <span className="text-white font-semibold">recurring commission</span> on every sale you generate.
                    </p>

                    <div className="pt-4">
                        <Link href={signUpUrl}>
                            <button className="bg-[#0df20d] text-black px-10 py-5 rounded-full text-lg font-black tracking-wide shadow-[0_0_20px_rgba(13,242,13,0.3)] hover:shadow-[0_0_30px_rgba(13,242,13,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all">
                                Become an Affiliate
                            </button>
                        </Link>
                        <p className="mt-4 text-xs text-gray-500 font-medium">No credit card required • Instant account setup</p>
                    </div>
                </div>
            </main>

            {/* Value Props */}
            <section className="w-full max-w-7xl mx-auto px-6 py-24 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-6 p-8 rounded-lg bg-[#121212] border border-[#2a2a2a] hover:border-[#0df20d]/30 transition-all group">
                        <div className="w-14 h-14 rounded-full bg-[#0df20d]/5 flex items-center justify-center border border-[#0df20d]/20 group-hover:bg-[#0df20d]/10 transition-colors">
                            <span className="material-symbols-outlined text-[#0df20d] text-3xl">payments</span>
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-xl font-bold text-white tracking-tight">Instant Payouts</h3>
                            <p className="text-gray-400 leading-relaxed">Get paid directly to your wallet or bank account. No minimum thresholds or delays for our top tier partners.</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-6 p-8 rounded-lg bg-[#121212] border border-[#2a2a2a] hover:border-[#0df20d]/30 transition-all group">
                        <div className="w-14 h-14 rounded-full bg-[#0df20d]/5 flex items-center justify-center border border-[#0df20d]/20 group-hover:bg-[#0df20d]/10 transition-colors">
                            <span className="material-symbols-outlined text-[#0df20d] text-3xl">monitoring</span>
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-xl font-bold text-white tracking-tight">Real-time Tracking</h3>
                            <p className="text-gray-400 leading-relaxed">Watch your clicks and conversions update live. Our futuristic dashboard provides deep insights into your audience.</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-6 p-8 rounded-lg bg-[#121212] border border-[#2a2a2a] hover:border-[#0df20d]/30 transition-all group">
                        <div className="w-14 h-14 rounded-full bg-[#0df20d]/5 flex items-center justify-center border border-[#0df20d]/20 group-hover:bg-[#0df20d]/10 transition-colors">
                            <span className="material-symbols-outlined text-[#0df20d] text-3xl">link</span>
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-xl font-bold text-white tracking-tight">Custom Links</h3>
                            <p className="text-gray-400 leading-relaxed">Generate unique tracking links for your campaigns. A/B test different landing pages to maximize your earnings.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Error toast */}
            {joinState === "error" && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-500/10 border border-red-500/20 rounded-xl px-6 py-4 flex items-center gap-3 z-50 max-w-md">
                    <span className="material-symbols-outlined text-red-400">error</span>
                    <div>
                        <p className="text-red-400 text-sm font-bold">Something went wrong</p>
                        <p className="text-red-400/70 text-xs">Please try signing up below instead.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
