"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { TopNav } from "@/components/dashboard/TopNav";
import { useStoreContext } from "@/providers/store-context";
import Image from "next/image";

function formatCents(cents: number) {
    return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export default function WLProductsPage() {
    const { store } = useStoreContext();
    const products = useQuery(
        api.wlOwnerQueries.getStoreProducts,
        store?._id ? { storeId: store._id } : "skip"
    );

    return (
        <>
            <TopNav title="Products" />
            <div className="p-8 relative z-0 space-y-6 w-full">
                <div>
                    <h2 className="text-white font-bold text-lg">All Products</h2>
                    <p className="text-text-grey text-sm mt-0.5">
                        Read-only view of all products across your sellers.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {!products && (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-surface-dark border border-white/5 rounded-2xl h-48 animate-pulse" />
                        ))
                    )}
                    {products?.length === 0 && (
                        <p className="col-span-3 text-center text-text-grey py-16">
                            No products yet. Sellers will add their products here.
                        </p>
                    )}
                    {products?.map((p) => (
                        <div
                            key={String(p._id)}
                            className="bg-surface-dark border border-white/5 rounded-2xl overflow-hidden flex flex-col"
                        >
                            {/* Cover Image */}
                            <div className="w-full h-36 bg-white/5 relative overflow-hidden">
                                {p.coverImageUrl ? (
                                    <Image
                                        src={p.coverImageUrl}
                                        alt={p.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <span className="material-icons text-white/10 text-[48px]">image</span>
                                    </div>
                                )}
                                {/* Status badge */}
                                <span className={`absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full ${
                                    p.isActive
                                        ? "bg-green-400/20 text-green-400 border border-green-400/20"
                                        : "bg-red-400/20 text-red-400 border border-red-400/20"
                                }`}>
                                    {p.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                            <div className="p-4 flex flex-col gap-1 flex-1">
                                <p className="text-white font-semibold truncate">{p.name}</p>
                                <p className="text-xs text-text-grey truncate">by {p.sellerEmail}</p>
                                <div className="flex items-center justify-between mt-auto pt-3">
                                    <span className="text-primary font-bold">{formatCents(p.price)}</span>
                                    <span className="text-xs text-text-grey">{p.visits} visits</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
