"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { TopNav } from "@/components/dashboard";

/* ────── Platform config ────── */
const PLATFORMS: Record<string, { icon: string; color: string; label: string }> = {
    default: { icon: "link", color: "#0df20d", label: "Default" },
    instagram: { icon: "photo_camera", color: "#E1306C", label: "Instagram" },
    twitter: { icon: "tag", color: "#1DA1F2", label: "Twitter / X" },
    youtube: { icon: "play_circle", color: "#FF0000", label: "YouTube" },
    tiktok: { icon: "music_note", color: "#69C9D0", label: "TikTok" },
    facebook: { icon: "thumb_up", color: "#1877F2", label: "Facebook" },
};

export default function MyLinksPage() {
    const storeGroups = useQuery(api.affiliates.getMyProductLinks);

    const [selectedStore, setSelectedStore] = useState<string | null>(null);
    const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
    const [copiedLink, setCopiedLink] = useState<string | null>(null);

    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

    const selectedGroup = storeGroups?.find((g) => g.storeSlug === selectedStore);

    // Auto-select first store
    if (storeGroups && storeGroups.length > 0 && !selectedStore) {
        setSelectedStore(storeGroups[0].storeSlug);
    }

    const copyToClipboard = (link: string) => {
        navigator.clipboard.writeText(link);
        setCopiedLink(link);
        setTimeout(() => setCopiedLink(null), 2000);
    };

    const aggregateStats = (items: any[]) => {
        let clicks = 0, conversions = 0, earnings = 0, revenue = 0;
        for (const v of items) {
            clicks += v.clicks ?? 0;
            conversions += v.conversions ?? 0;
            earnings += v.commissionEarnedCents ?? 0;
            revenue += v.revenueGeneratedCents ?? 0;
        }
        return { clicks, conversions, earnings, revenue };
    };

    const getStoreStats = (products: any[]) =>
        aggregateStats(products.flatMap((p) => p.variants ?? []));

    const getProductStats = (variants: any[]) =>
        aggregateStats(variants ?? []);

    return (
        <>
            <TopNav title="My Links" />
            {/* eslint-disable-next-line @next/next/no-page-custom-font */}
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

            <style>{`
                .frost {
                    background: rgba(18, 18, 18, 0.6);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                }
                .frost-light {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                }
                .glow-border {
                    box-shadow: inset 0 0 0 1px rgba(13, 242, 13, 0.15), 0 0 20px rgba(13, 242, 13, 0.05);
                }
                .stat-glow {
                    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
                }
                .link-row:hover .link-copy-btn {
                    opacity: 1;
                }
                .shimmer {
                    background: linear-gradient(135deg, rgba(13, 242, 13, 0.05) 0%, transparent 50%, rgba(13, 242, 13, 0.03) 100%);
                }
                .scrollzone::-webkit-scrollbar { width: 4px; }
                .scrollzone::-webkit-scrollbar-track { background: transparent; }
                .scrollzone::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
                .scrollzone::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
            `}</style>

            {/* Loading */}
            {storeGroups === undefined && (
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="flex flex-col items-center gap-4">
                        <div className="size-16 rounded-2xl frost glow-border flex items-center justify-center animate-pulse">
                            <span className="material-symbols-outlined text-3xl text-primary">link</span>
                        </div>
                        <span className="text-sm font-medium text-slate-500">Loading your links...</span>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {storeGroups && storeGroups.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <div className="size-24 rounded-3xl frost glow-border flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-slate-500 text-5xl">link_off</span>
                    </div>
                    <h2 className="text-white text-2xl font-black mb-2 tracking-tight">No Links Yet</h2>
                    <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
                        Once a seller adds you to their products, your tracking links will appear here.
                    </p>
                </div>
            )}

            {/* Main Layout */}
            {storeGroups && storeGroups.length > 0 && (
                <main className="flex-1 w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden" style={{ height: "calc(100vh - 80px)" }}>

                    {/* ─── Left: Store Sidebar ─── */}
                    <aside className="lg:col-span-3 flex flex-col h-full overflow-hidden">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-base font-bold text-white tracking-tight">Stores</h3>
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full frost border border-white/10 text-slate-400 uppercase tracking-widest">
                                {storeGroups.length}
                            </span>
                        </div>
                        <div className="flex flex-col gap-2 overflow-y-auto scrollzone pr-1 pb-10">
                            {storeGroups.map((group) => {
                                const isActive = selectedStore === group.storeSlug;
                                const stats = getStoreStats(group.products);

                                return (
                                    <button
                                        key={group.storeSlug}
                                        onClick={() => { setSelectedStore(group.storeSlug); setExpandedProduct(null); }}
                                        className={`group relative flex items-center gap-3.5 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200 text-left ${isActive
                                            ? "frost glow-border"
                                            : "hover:bg-white/[0.03] border border-transparent hover:border-white/5"
                                            }`}
                                    >
                                        {/* Active indicator bar */}
                                        {isActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-r-full bg-primary shadow-[0_0_8px_rgba(13,242,13,0.5)]" />
                                        )}

                                        <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 transition-all ${isActive
                                            ? "bg-primary/10 border border-primary/20"
                                            : "bg-white/[0.03] border border-white/5 group-hover:border-white/10"
                                            }`}>
                                            <span className={`material-symbols-outlined text-xl transition-colors ${isActive ? "text-primary" : "text-slate-600 group-hover:text-slate-400"
                                                }`}>storefront</span>
                                        </div>

                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span className={`text-sm font-semibold truncate transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                                                }`}>{group.storeName}</span>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <span className="text-[11px] text-slate-600">{group.products.length} product{group.products.length !== 1 ? "s" : ""}</span>
                                                {stats.clicks > 0 && (
                                                    <span className="text-[11px] text-slate-600">· {stats.clicks} clicks</span>
                                                )}
                                            </div>
                                        </div>

                                        {isActive && stats.earnings > 0 && (
                                            <span className="text-xs font-bold text-primary">${(stats.earnings / 100).toFixed(0)}</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </aside>

                    {/* ─── Right: Detail Panel ─── */}
                    {selectedGroup && (() => {
                        const storeStats = getStoreStats(selectedGroup.products);
                        return (
                            <section className="lg:col-span-9 flex flex-col h-full overflow-hidden">

                                {/* Store Header */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="size-14 rounded-2xl frost glow-border flex items-center justify-center">
                                        <span className="material-symbols-outlined text-3xl text-primary">storefront</span>
                                    </div>
                                    <div className="flex-1">
                                        <h1 className="text-2xl font-black text-white tracking-tight">{selectedGroup.storeName}</h1>
                                        <p className="text-slate-500 text-xs mt-0.5">
                                            {selectedGroup.products.length} product{selectedGroup.products.length !== 1 ? "s" : ""} · {selectedGroup.storeSlug}
                                        </p>
                                    </div>
                                </div>

                                {/* ─── PSP Warning / Link Status Banner ─── */}
                                {!selectedGroup.products[0]?.sellerHasPsp ? (
                                    <div
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6 border"
                                        style={{
                                            background: "rgba(251, 191, 36, 0.06)",
                                            borderColor: "rgba(251, 191, 36, 0.2)",
                                        }}
                                    >
                                        <span
                                            className="material-symbols-outlined text-2xl shrink-0"
                                            style={{ color: "#fbbf24" }}
                                        >
                                            warning
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold" style={{ color: "#fbbf24" }}>
                                                Links not functional yet
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                This seller hasn&apos;t connected a payment provider. Your links will start working once they do.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6 border"
                                        style={{
                                            background: "rgba(13, 242, 13, 0.04)",
                                            borderColor: "rgba(13, 242, 13, 0.15)",
                                        }}
                                    >
                                        <span
                                            className="material-symbols-outlined text-2xl shrink-0"
                                            style={{ color: "#0df20d" }}
                                        >
                                            check_circle
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold" style={{ color: "#0df20d" }}>
                                                Links are now functional
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                This seller has a payment provider connected. Clicks on your links will track and convert.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0df20d] opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0df20d]"></span>
                                            </span>
                                            <span className="text-[10px] font-bold text-[#0df20d] uppercase tracking-wider">Live</span>
                                        </div>
                                    </div>
                                )}

                                {/* Stats Row */}
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="frost rounded-2xl p-4 border border-white/5 stat-glow relative overflow-hidden group">
                                        <div className="absolute -top-4 -right-4 size-20 rounded-full bg-white/[0.02] group-hover:bg-white/[0.04] transition-colors" />
                                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Clicks</p>
                                        <p className="text-2xl font-black text-white mt-1 tabular-nums">{storeStats.clicks.toLocaleString()}</p>
                                    </div>
                                    <div className="frost rounded-2xl p-4 border border-white/5 stat-glow relative overflow-hidden group">
                                        <div className="absolute -top-4 -right-4 size-20 rounded-full bg-white/[0.02] group-hover:bg-white/[0.04] transition-colors" />
                                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Conversions</p>
                                        <p className="text-2xl font-black text-white mt-1 tabular-nums">{storeStats.conversions.toLocaleString()}</p>
                                    </div>
                                    <div className="frost rounded-2xl p-4 border border-primary/10 stat-glow shimmer relative overflow-hidden group">
                                        <div className="absolute -top-4 -right-4 size-20 rounded-full bg-primary/[0.03] group-hover:bg-primary/[0.06] transition-colors" />
                                        <p className="text-[11px] font-semibold text-primary/60 uppercase tracking-wider">Earned</p>
                                        <p className="text-2xl font-black text-primary mt-1 tabular-nums">${(storeStats.earnings / 100).toFixed(2)}</p>
                                    </div>
                                </div>

                                {/* Product Cards */}
                                <div className="flex-1 overflow-y-auto scrollzone pr-1 pb-10">
                                    <div className="flex flex-col gap-3">
                                        {selectedGroup.products.map((product) => {
                                            const variants = product.variants ?? [];
                                            const isExpanded = expandedProduct === product._id;
                                            const prodStats = getProductStats(variants);

                                            return (
                                                <div key={product._id} className={`rounded-2xl overflow-hidden transition-all duration-300 ${isExpanded
                                                    ? "frost glow-border"
                                                    : "frost border border-white/5 hover:border-white/10"
                                                    }`}>
                                                    {/* Product Row */}
                                                    <div
                                                        className="flex items-center gap-4 p-4 cursor-pointer select-none"
                                                        onClick={() => setExpandedProduct(isExpanded ? null : product._id)}
                                                    >
                                                        {/* Product thumb */}
                                                        <div className="size-14 rounded-xl overflow-hidden shrink-0 bg-white/[0.03] border border-white/5 flex items-center justify-center relative">
                                                            {product.coverImageUrl ? (
                                                                <img src={product.coverImageUrl} alt={product.productName} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="material-symbols-outlined text-2xl text-slate-700">inventory_2</span>
                                                            )}
                                                        </div>

                                                        {/* Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="text-sm font-bold text-white truncate">{product.productName}</h4>
                                                                <span className="text-[10px] font-bold text-primary/70 bg-primary/[0.08] px-2 py-0.5 rounded-full border border-primary/10 shrink-0">
                                                                    {product.commissionPercent}%
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-4 mt-1">
                                                                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-[13px]">ads_click</span>
                                                                    {prodStats.clicks.toLocaleString()}
                                                                </span>
                                                                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-[13px]">shopping_cart</span>
                                                                    {prodStats.conversions.toLocaleString()}
                                                                </span>
                                                                <span className="text-[11px] text-primary font-semibold flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-[13px]">payments</span>
                                                                    ${(prodStats.earnings / 100).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Expand chevron */}
                                                        <span className={`material-symbols-outlined text-lg text-slate-600 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
                                                            expand_more
                                                        </span>
                                                    </div>

                                                    {/* Expanded: Platform Links */}
                                                    {isExpanded && (
                                                        <div className="border-t border-white/5">
                                                            <div className="p-4 space-y-1">
                                                                {variants.length === 0 && (
                                                                    <p className="text-slate-600 text-xs text-center py-6">No links available.</p>
                                                                )}
                                                                {variants.map((variant) => {
                                                                    const checkoutLink = variant.isDefault
                                                                        ? `${protocol}://${rootDomain}/checkout/${product.productId}?ref=${product.affiliateId}`
                                                                        : `${protocol}://${rootDomain}/checkout/${product.productId}?ref=${product.affiliateId}&v=${variant.variantSlug}`;
                                                                    const isCopied = copiedLink === checkoutLink;
                                                                    const platform = PLATFORMS[variant.variantSlug] || { icon: "link", color: "#888", label: variant.name };

                                                                    return (
                                                                        <div
                                                                            key={variant._id}
                                                                            className="link-row flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/[0.03] transition-colors group/row"
                                                                        >
                                                                            {/* Platform icon */}
                                                                            <div
                                                                                className="size-8 rounded-lg flex items-center justify-center shrink-0 border border-white/5"
                                                                                style={{ backgroundColor: `${platform.color}10` }}
                                                                            >
                                                                                <span
                                                                                    className="material-symbols-outlined text-[16px]"
                                                                                    style={{ color: platform.color }}
                                                                                >{platform.icon}</span>
                                                                            </div>

                                                                            {/* Label */}
                                                                            <span className="text-xs font-semibold text-slate-400 w-20 shrink-0 truncate">
                                                                                {platform.label}
                                                                            </span>

                                                                            {/* URL */}
                                                                            <div className="flex-1 min-w-0 bg-black/30 rounded-lg px-3 py-1.5 border border-white/5">
                                                                                <p className="text-[11px] text-slate-500 font-mono truncate">{checkoutLink}</p>
                                                                            </div>

                                                                            {/* Mini stats */}
                                                                            <div className="flex items-center gap-2 text-[10px] text-slate-600 shrink-0 tabular-nums">
                                                                                <span>{variant.clicks} clicks</span>
                                                                                <span className="text-white/10">·</span>
                                                                                <span>{variant.conversions} conv</span>
                                                                            </div>

                                                                            {/* Copy button */}
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); copyToClipboard(checkoutLink); }}
                                                                                className={`shrink-0 size-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${isCopied
                                                                                    ? "bg-primary text-black"
                                                                                    : "bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white border border-white/5"
                                                                                    }`}
                                                                            >
                                                                                <span className="material-symbols-outlined text-[14px]">
                                                                                    {isCopied ? "check" : "content_copy"}
                                                                                </span>
                                                                            </button>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </section>
                        );
                    })()}

                    {/* No store selected */}
                    {!selectedGroup && (
                        <section className="lg:col-span-9 flex flex-col items-center justify-center h-full">
                            <div className="size-20 rounded-3xl frost glow-border flex items-center justify-center mb-5">
                                <span className="material-symbols-outlined text-4xl text-slate-600">touch_app</span>
                            </div>
                            <p className="text-white font-bold mb-1">Select a store</p>
                            <p className="text-slate-600 text-sm">Pick a store from the left to view links.</p>
                        </section>
                    )}
                </main>
            )}
        </>
    );
}
