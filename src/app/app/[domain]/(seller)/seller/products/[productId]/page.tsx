"use client";

import { use, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../../convex/_generated/dataModel";
import { TopNav, AffiliateManagerDrawer, StripeLogo, MercadoPagoLogo, ProductDrawer } from "@/components/dashboard";
import { useDragScroll } from "@/hooks/useDragScroll";

// Platform metadata for icons and labels
const PLATFORM_META: Record<string, { icon: string; color: string; label: string }> = {
    default: { icon: "link", color: "#a0a0a0", label: "Default" },
    direct: { icon: "storefront", color: "#0df20d", label: "Direct" },
    instagram: { icon: "photo_camera", color: "#E4405F", label: "Instagram" },
    twitter: { icon: "tag", color: "#1DA1F2", label: "Twitter / X" },
    youtube: { icon: "play_circle", color: "#FF0000", label: "YouTube" },
    tiktok: { icon: "music_note", color: "#69C9D0", label: "TikTok" },
    facebook: { icon: "thumb_up", color: "#1877F2", label: "Facebook" },
};

function getPlatform(slug: string | null) {
    return PLATFORM_META[slug ?? "direct"] ?? { icon: "link", color: "#a0a0a0", label: slug ?? "Unknown" };
}

function formatCents(cents: number) {
    return `$${(cents / 100).toFixed(2)}`;
}

function timeAgo(timestamp: number) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { bg: string; text: string; dot: string }> = {
        PAID: { bg: "bg-[#0df20d]/10", text: "text-[#0df20d]", dot: "bg-[#0df20d]" },
        SETTLED: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
        PENDING: { bg: "bg-yellow-500/10", text: "text-yellow-400", dot: "bg-yellow-400" },
        FAILED: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
        REFUNDED: { bg: "bg-purple-500/10", text: "text-purple-400", dot: "bg-purple-400" },
    };
    const c = config[status] ?? config.PENDING;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${c.bg} ${c.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
            {status}
        </span>
    );
}

export default function ProductDetailPage({
    params,
}: {
    params: Promise<{ domain: string; productId: string }>;
}) {
    const resolvedParams = use(params);
    const [activeTab, setActiveTab] = useState<"affiliates" | "transactions" | "platforms">("affiliates");
    const [expandedAffiliate, setExpandedAffiliate] = useState<string | null>(null);
    const [isAffiliateDrawerOpen, setIsAffiliateDrawerOpen] = useState(false);
    const [isProductDrawerOpen, setIsProductDrawerOpen] = useState(false);
    
    // Gallery state
    const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
    const { scrollRef, hasDragged, events } = useDragScroll();

    const data = useQuery(api.products.getProductDetail, {
        productId: resolvedParams.productId as Id<"products">,
    });

    // Loading state
    if (data === undefined) {
        return (
            <div className="flex flex-col h-full bg-[#050505]">
                <TopNav title="Product Details" />
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 rounded-full border-2 border-[#0df20d]/30 border-t-[#0df20d] animate-spin"></div>
                        <span className="text-gray-500 text-sm">Loading product intel...</span>
                    </div>
                </div>
            </div>
        );
    }

    const { product, affiliates, transactions, platformLeaderboard, stats } = data;

    return (
        <div className="flex flex-col h-full bg-[#050505] overflow-hidden">
            <TopNav title="Product Details" />
            <div className={`flex-1 overflow-y-auto custom-scrollbar transition-[padding] duration-300 ease-in-out ${isAffiliateDrawerOpen ? "pr-[480px]" : "pr-0"}`}>
                <div className="p-8 space-y-8">

                    {/* ─── Product Header ─── */}
                    <div className="flex items-start gap-6">
                        <div className="flex items-start gap-5 flex-1">
                            {/* Product Image Gallery */}
                            <div className="flex flex-col gap-4 flex-shrink-0 w-64 md:w-80 lg:w-96">
                                <div 
                                    onClick={() => {
                                        const allImages = [product.coverImageUrl, ...(product.mediaUrls || [])].filter(Boolean);
                                        if (allImages.length > 0) {
                                            setActiveImageIndex((prev) => (prev + 1) % allImages.length);
                                        }
                                    }}
                                    className="w-full aspect-square rounded-2xl bg-[#121212] border border-[#2a2a2a] overflow-hidden flex items-center justify-center relative group cursor-pointer"
                                    >
                                    {/* Main Image */}
                                    {(() => {
                                        const allImages = [product.coverImageUrl, ...(product.mediaUrls || [])].filter(Boolean);
                                        const currentImg = allImages[activeImageIndex];
                                        if (currentImg) {
                                            return <img src={currentImg as string} alt={product.name} className="w-full h-full object-cover transition-all" />;
                                        }
                                        return <span className="material-icons text-6xl text-white/10">inventory_2</span>;
                                    })()}
                                </div>
                                
                                {/* Thumbnails */}
                                {product.mediaUrls && product.mediaUrls.length > 0 && (
                                    <div 
                                        ref={scrollRef}
                                        {...events}
                                        className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                                    >
                                        {[product.coverImageUrl, ...product.mediaUrls].filter(Boolean).map((url, idx) => (
                                            <button
                                                key={idx}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (!hasDragged) setActiveImageIndex(idx);
                                                }}
                                                className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${activeImageIndex === idx ? "border-[#0df20d] shadow-sm" : "border-transparent hover:border-white/20 opacity-60 hover:opacity-100"}`}
                                            >
                                                <img src={url as string} alt={`Thumb ${idx}`} className="w-full h-full object-cover transition-all" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="text-2xl font-bold text-white tracking-tight truncate">{product.name}</h1>
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${product.isActive ? "text-primary bg-primary/10 border-primary/20" : "text-gray-400 bg-white/5 border-white/10"}`}>
                                        {product.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm mb-2 line-clamp-2 max-w-xl">{product.description || "No description."}</p>
                                <span className="text-xl font-mono font-bold text-white">{formatCents(product.price)}</span>
                                <span className="text-gray-500 text-xs ml-1 uppercase">{product.currency}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <button
                                id="edit-product-trigger"
                                onClick={() => setIsProductDrawerOpen(true)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all cursor-pointer flex-shrink-0 self-start mt-1"
                            >
                                <span className="material-icons text-sm">edit</span>
                                Edit Product
                            </button>
                            <button
                                onClick={() => setIsAffiliateDrawerOpen(true)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 hover:border-primary/40 transition-all cursor-pointer flex-shrink-0 self-start mt-1"
                            >
                                <span className="material-icons text-sm">group_add</span>
                                Add Affiliate
                            </button>
                        </div>
                    </div>

                    {/* ─── Summary Stats Strip ─── */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {[
                            { label: "Affiliates", value: stats.totalAffiliates, icon: "group", color: "text-blue-400", bg: "bg-blue-400/10" },
                            { label: "Transactions", value: stats.totalTransactions, icon: "receipt_long", color: "text-primary", bg: "bg-primary/10" },
                            { label: "Total Revenue", value: formatCents(stats.totalRevenueCents), icon: "payments", color: "text-emerald-400", bg: "bg-emerald-400/10" },
                            { label: "Direct Sales", value: stats.directSales, icon: "storefront", color: "text-yellow-400", bg: "bg-yellow-400/10" },
                            { label: "Affiliate Sales", value: stats.affiliateSales, icon: "share", color: "text-purple-400", bg: "bg-purple-400/10" },
                        ].map((s) => (
                            <div key={s.label} className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-4 hover:border-white/10 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-500 text-xs font-medium">{s.label}</span>
                                    <div className={`${s.bg} p-1.5 rounded-full`}>
                                        <span className={`material-icons ${s.color} text-sm`}>{s.icon}</span>
                                    </div>
                                </div>
                                <span className="text-xl font-bold text-white">{s.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* ─── Tab Navigation ─── */}
                    <div className="flex gap-1 p-1 bg-[#121212] border border-[#2a2a2a] rounded-full w-fit">
                        {([
                            { key: "affiliates" as const, label: "Affiliates", icon: "group" },
                            { key: "transactions" as const, label: "Transactions", icon: "receipt_long" },
                            { key: "platforms" as const, label: "Platform Leaderboard", icon: "leaderboard" },
                        ]).map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${activeTab === tab.key ? "bg-white/10 text-white shadow-sm" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                            >
                                <span className="material-icons text-sm">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* ─── Tab: Affiliates ─── */}
                    {activeTab === "affiliates" && (
                        <div className="space-y-3">
                            {affiliates.length === 0 ? (
                                <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-12 text-center">
                                    <span className="material-icons text-4xl text-gray-600 mb-3 block">group_off</span>
                                    <p className="text-gray-400 text-sm font-medium">No affiliates linked yet.</p>
                                    <p className="text-gray-600 text-xs mt-1">Attach affiliates from the Products page to start tracking.</p>
                                </div>
                            ) : (
                                affiliates.map((aff) => (
                                    <div key={aff._id} className="bg-[#121212] border border-[#2a2a2a] rounded-xl overflow-hidden hover:border-white/10 transition-colors">
                                        {/* Affiliate Row */}
                                        <button
                                            onClick={() => setExpandedAffiliate(expandedAffiliate === aff._id ? null : aff._id)}
                                            className="w-full flex items-center gap-4 p-5 cursor-pointer text-left hover:bg-white/[0.02] transition-colors"
                                        >
                                            {/* Avatar */}
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                                                <span className="text-white text-sm font-bold">{aff.affiliateEmail[0]?.toUpperCase()}</span>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white font-bold text-sm truncate">{aff.affiliateEmail}</span>
                                                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${aff.isActive ? "text-primary bg-primary/10 border-primary/20" : "text-gray-500 bg-white/5 border-white/10"}`}>
                                                        {aff.isActive ? "Active" : "Inactive"}
                                                    </span>
                                                </div>
                                                <span className="text-gray-500 text-xs">{aff.commissionPercent}% commission</span>
                                            </div>

                                            {/* Summary stats */}
                                            <div className="hidden md:flex items-center gap-6 text-center">
                                                <div>
                                                    <p className="text-white font-bold text-sm">{aff.totalClicks.toLocaleString()}</p>
                                                    <p className="text-gray-500 text-[10px]">Clicks</p>
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold text-sm">{aff.totalConversions}</p>
                                                    <p className="text-gray-500 text-[10px]">Conv.</p>
                                                </div>
                                                <div>
                                                    <p className="text-primary font-bold text-sm">{formatCents(aff.totalRevenueCents)}</p>
                                                    <p className="text-gray-500 text-[10px]">Revenue</p>
                                                </div>
                                                <div>
                                                    <p className="text-purple-400 font-bold text-sm">{formatCents(aff.totalCommissionCents)}</p>
                                                    <p className="text-gray-500 text-[10px]">Earned</p>
                                                </div>
                                            </div>

                                            <span className={`material-icons text-gray-500 transition-transform ${expandedAffiliate === aff._id ? "rotate-180" : ""}`}>
                                                expand_more
                                            </span>
                                        </button>

                                        {/* Expanded: Per-platform breakdown */}
                                        {expandedAffiliate === aff._id && (
                                            <div className="border-t border-[#2a2a2a] bg-[#0a0a0a]">
                                                <div className="p-4">
                                                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-3 px-1">Platform Breakdown</p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                                        {aff.variants.map((v) => {
                                                            const pm = getPlatform(v.variantSlug);
                                                            return (
                                                                <div key={v._id} className="flex items-center gap-3 bg-[#121212] border border-[#1a1a1a] rounded-lg px-4 py-3 hover:border-white/10 transition-colors">
                                                                    <span className="material-icons text-lg" style={{ color: pm.color }}>{pm.icon}</span>
                                                                    <div className="flex-1 min-w-0">
                                                                        <span className="text-white text-xs font-bold block">{pm.label}</span>
                                                                        <span className="text-gray-500 text-[10px]">{v.clicks} clicks · {v.conversions} conv.</span>
                                                                    </div>
                                                                    <span className="text-primary text-xs font-bold">{formatCents(v.revenueGeneratedCents)}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* ─── Tab: Transactions ─── */}
                    {activeTab === "transactions" && (
                        <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl overflow-hidden">
                            {transactions.length === 0 ? (
                                <div className="p-12 text-center">
                                    <span className="material-icons text-4xl text-gray-600 mb-3 block">receipt_long</span>
                                    <p className="text-gray-400 text-sm font-medium">No transactions yet.</p>
                                    <p className="text-gray-600 text-xs mt-1">Transactions will appear here once customers purchase this product.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-[#2a2a2a]">
                                                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">Customer</th>
                                                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">Source</th>
                                                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">Platform</th>
                                                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">Provider</th>
                                                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">Total</th>
                                                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">Net</th>
                                                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">Status</th>
                                                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">When</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.map((txn) => {
                                                const pm = getPlatform(txn.variantSlug);
                                                return (
                                                    <tr key={txn._id} className="border-b border-[#1a1a1a] hover:bg-white/[0.02] transition-colors">
                                                        <td className="px-5 py-4">
                                                            <span className="text-white text-sm font-medium">{txn.customerEmail}</span>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            {txn.affiliateEmail ? (
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-6 h-6 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                                                        <span className="text-purple-400 text-[9px] font-bold">{txn.affiliateEmail[0]?.toUpperCase()}</span>
                                                                    </div>
                                                                    <span className="text-purple-400 text-xs font-medium truncate max-w-[120px]">{txn.affiliateEmail}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 text-gray-400 text-xs font-medium">
                                                                    Store Link
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                                                                <span className="material-icons text-sm" style={{ color: pm.color }}>{pm.icon}</span>
                                                                <span className="text-gray-300">{pm.label}</span>
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center">
                                                                {txn.pspProvider === "STRIPE" ? (
                                                                    <StripeLogo size="sm" />
                                                                ) : (
                                                                    <MercadoPagoLogo size="sm" />
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <span className="text-white text-sm font-bold">{formatCents(txn.amountTotalCents)}</span>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <span className="text-primary text-sm font-bold">{formatCents(txn.netSellerCents)}</span>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <StatusBadge status={txn.status} />
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <span className="text-gray-500 text-xs">{timeAgo(txn.createdAt)}</span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ─── Tab: Platform Leaderboard ─── */}
                    {activeTab === "platforms" && (
                        <div className="space-y-3">
                            {platformLeaderboard.length === 0 ? (
                                <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-12 text-center">
                                    <span className="material-icons text-4xl text-gray-600 mb-3 block">leaderboard</span>
                                    <p className="text-gray-400 text-sm font-medium">No platform data yet.</p>
                                    <p className="text-gray-600 text-xs mt-1">Platform stats will appear once transactions are recorded with platform attribution.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Top / Bottom callout */}
                                    {platformLeaderboard.length >= 2 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {/* Top Platform */}
                                            {(() => {
                                                const top = platformLeaderboard[0];
                                                const pm = getPlatform(top.platform);
                                                return (
                                                    <div className="bg-[#121212] border border-primary/20 rounded-xl p-6 relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <span className="material-icons text-primary text-sm">arrow_upward</span>
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Top Platform</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: pm.color + "15" }}>
                                                                <span className="material-icons text-2xl" style={{ color: pm.color }}>{pm.icon}</span>
                                                            </div>
                                                            <div>
                                                                <p className="text-white font-bold text-lg">{pm.label}</p>
                                                                <p className="text-gray-400 text-xs">{top.sales} sales · {formatCents(top.revenueCents)} revenue</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            {/* Bottom Platform */}
                                            {(() => {
                                                const bottom = platformLeaderboard[platformLeaderboard.length - 1];
                                                const pm = getPlatform(bottom.platform);
                                                return (
                                                    <div className="bg-[#121212] border border-red-500/10 rounded-xl p-6 relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <span className="material-icons text-red-400 text-sm">arrow_downward</span>
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">Least Performing</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: pm.color + "15" }}>
                                                                <span className="material-icons text-2xl" style={{ color: pm.color }}>{pm.icon}</span>
                                                            </div>
                                                            <div>
                                                                <p className="text-white font-bold text-lg">{pm.label}</p>
                                                                <p className="text-gray-400 text-xs">{bottom.sales} sales · {formatCents(bottom.revenueCents)} revenue</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}

                                    {/* Full Ranking List */}
                                    <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl overflow-hidden">
                                        <div className="px-5 py-4 border-b border-[#2a2a2a]">
                                            <p className="text-white font-bold text-sm">All Platforms — Universal Ranking</p>
                                            <p className="text-gray-500 text-xs mt-0.5">Aggregated across all affiliates for this product</p>
                                        </div>
                                        {platformLeaderboard.map((entry, idx) => {
                                            const pm = getPlatform(entry.platform);
                                            const maxSales = platformLeaderboard[0]?.sales ?? 1;
                                            const barWidth = maxSales > 0 ? (entry.sales / maxSales) * 100 : 0;

                                            return (
                                                <div key={entry.platform} className="flex items-center gap-4 px-5 py-4 border-b border-[#1a1a1a] last:border-0 hover:bg-white/[0.02] transition-colors">
                                                    {/* Rank */}
                                                    <span className={`w-6 text-center font-bold text-sm ${idx === 0 ? "text-primary" : "text-gray-500"}`}>
                                                        {idx + 1}
                                                    </span>

                                                    {/* Platform Icon */}
                                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: pm.color + "15" }}>
                                                        <span className="material-icons text-lg" style={{ color: pm.color }}>{pm.icon}</span>
                                                    </div>

                                                    {/* Name + bar */}
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-white text-sm font-bold block mb-1">{pm.label}</span>
                                                        <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full rounded-full transition-all duration-500"
                                                                style={{ width: `${barWidth}%`, backgroundColor: pm.color }}
                                                            ></div>
                                                        </div>
                                                    </div>

                                                    {/* Stats */}
                                                    <div className="text-right">
                                                        <p className="text-white font-bold text-sm">{entry.sales} sales</p>
                                                        <p className="text-primary text-xs font-medium">{formatCents(entry.revenueCents)}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                </div>
            </div>

            {/* Affiliate Manager Drawer */}
            <AffiliateManagerDrawer
                isOpen={isAffiliateDrawerOpen}
                onClose={() => setIsAffiliateDrawerOpen(false)}
                productId={resolvedParams.productId as Id<"products">}
                productName={product.name}
            />

            {/* Edit Product Drawer */}
            <ProductDrawer 
                isOpen={isProductDrawerOpen}
                onClose={() => setIsProductDrawerOpen(false)}
                initialData={product}
            />
        </div>
    );
}
