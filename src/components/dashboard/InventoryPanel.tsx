"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useTranslations } from "next-intl";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

export function InventoryPanel() {
    const t = useTranslations("InventoryPanel");
    const products = useQuery(api.products.getMyProducts);
    const isLoading = products === undefined;

    // Sort by most visits/active, take top 4
    const topProducts = [...(products ?? [])]
        .sort((a, b) => (b.visits ?? 0) - (a.visits ?? 0))
        .slice(0, 4);

    return (
        <SpotlightCard className="flex flex-col shadow-xl flex-1">
            <div className="relative z-10 flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-white tracking-tight">{t("topProducts")}</h2>
                <Link href="/seller/products" className="p-1 rounded-full hover:bg-white/5 text-gray-500 hover:text-white cursor-pointer transition-colors">
                    <span className="material-icons text-[20px]">open_in_new</span>
                </Link>
            </div>

            <div className="space-y-5 flex-1">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className="flex justify-between">
                                <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
                                <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full" />
                        </div>
                    ))
                ) : topProducts.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                        <span className="material-icons text-4xl opacity-20 mb-2">inventory_2</span>
                        <p className="text-sm text-gray-500">{t("noProducts")}</p>
                    </div>
                ) : (
                    topProducts.map((item) => {
                        const visits = item.visits ?? 0;
                        // Use max visits as 100% bar reference or at least 1
                        const maxVisits = Math.max(...topProducts.map((p) => p.visits ?? 0), 1);
                        const pct = Math.round((visits / maxVisits) * 100);
                        return (
                            <div key={item._id} className="group flex gap-4 p-2 -m-2 rounded-xl hover:bg-white/5 transition-all">
                                {/* Thumbnail */}
                                <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                    {item.coverImageUrl ? (
                                        <img src={item.coverImageUrl} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-icons text-xl opacity-20 text-white">inventory_2</span>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-bold text-white group-hover:text-primary transition-colors truncate">
                                            {item.name}
                                        </span>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="text-[10px] font-medium text-gray-500">
                                                {visits.toLocaleString()} {t("visits")}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Description */}
                                    <p className="text-[11px] text-gray-500 line-clamp-1 mb-2">
                                        {item.description || t("noDescription")}
                                    </p>

                                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full transition-all duration-500"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="relative z-10 mt-6">
                <Link
                    href="/seller/products"
                    className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 text-sm font-bold text-white transition-all cursor-pointer text-center block tracking-wide"
                >
                    {t("manageProducts")}
                </Link>
            </div>
        </SpotlightCard>
    );
}
