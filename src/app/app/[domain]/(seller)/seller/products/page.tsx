"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { TopNav, ProductDrawer, AffiliateManagerDrawer } from "@/components/dashboard";

export default function ProductsPage() {
    const t = useTranslations("SellerProducts");
    const products = useQuery(api.products.getMyProducts);
    const deleteProduct = useMutation(api.products.deleteProduct);
    const router = useRouter();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Affiliate Manager state
    const [affiliateDrawerProductId, setAffiliateDrawerProductId] = useState<Id<"products"> | null>(null);
    const [affiliateDrawerProductName, setAffiliateDrawerProductName] = useState("");

    // Three-dots menu state
    const [menuOpenFor, setMenuOpenFor] = useState<Id<"products"> | null>(null);
    const [confirmDeleteFor, setConfirmDeleteFor] = useState<Id<"products"> | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const openAffiliateManager = (productId: Id<"products">, productName: string) => {
        setAffiliateDrawerProductId(productId);
        setAffiliateDrawerProductName(productName);
        setIsDrawerOpen(false);
    };

    const closeAffiliateManager = () => {
        setAffiliateDrawerProductId(null);
        setAffiliateDrawerProductName("");
    };

    const isAffiliateManagerOpen = affiliateDrawerProductId !== null;

    // Close menu on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpenFor(null);
                setConfirmDeleteFor(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDelete = async (productId: Id<"products">) => {
        setIsDeleting(true);
        try {
            await deleteProduct({ productId });
            setMenuOpenFor(null);
            setConfirmDeleteFor(null);
        } catch (err: any) {
            alert(err.message || "Failed to delete product.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#050505] overflow-hidden relative">
            <TopNav title={t("title")} />

            <div className={`flex-1 flex overflow-hidden relative z-0 transition-[padding] duration-300 ease-in-out ${isDrawerOpen || isAffiliateManagerOpen ? "pr-[480px]" : "pr-0"}`}>
                <div className="flex flex-col flex-1 overflow-y-auto custom-scrollbar">
                    {/* Header Area */}
                    <div className="p-8 pb-0">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">{t("inventory")}</h2>
                                <p className="text-gray-400 text-sm mt-1">{t("manageDigitalPhysical")}</p>
                            </div>
                            <div className="flex gap-2 p-1 bg-[#121212] border border-[#2a2a2a] rounded-full">
                                <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-white/10 text-white shadow-sm transition-all cursor-pointer">{t("allProducts")}</button>
                                <button className="px-4 py-1.5 rounded-full text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer">{t("digital")}</button>
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="p-6 pt-0 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">

                        {products === undefined ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-3 flex flex-col h-[320px] shadow-lg relative animate-pulse">
                                    <div className="w-full aspect-square bg-[#1a1a1a] rounded-lg mb-3" />
                                    <div className="h-4 bg-[#1a1a1a] rounded w-3/4 mb-2" />
                                    <div className="h-3 bg-[#1a1a1a] rounded w-full mb-1" />
                                    <div className="h-3 bg-[#1a1a1a] rounded w-2/3 mb-3" />
                                    <div className="mt-auto flex justify-between items-center mb-2">
                                        <div className="h-5 w-16 bg-[#1a1a1a] rounded" />
                                        <div className="h-4 w-12 bg-[#1a1a1a] rounded" />
                                    </div>
                                    <div className="flex gap-1.5 h-7">
                                        <div className="flex-1 rounded-lg bg-[#1a1a1a]" />
                                        <div className="flex-1 rounded-lg bg-[#1a1a1a]" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <>
                                {products.map((product) => (
                                    <div key={product._id} className="group bg-[#121212] border border-[#2a2a2a] hover:border-primary/50 rounded-xl p-3 transition-all duration-300 flex flex-col h-full shadow-lg relative">

                                    {/* Image Container */}
                                    <div className="relative w-full aspect-square bg-[#1a1a1a] rounded-lg mb-3 overflow-hidden group-hover:bg-[#222] transition-colors flex items-center justify-center">
                                        {product.coverImageUrl ? (
                                            <img
                                                src={product.coverImageUrl}
                                                alt={product.name}
                                                className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500"
                                            />
                                        ) : (
                                            <span className="material-icons text-4xl text-white/10 group-hover:text-white/20 transition-colors">
                                                inventory_2
                                            </span>
                                        )}

                                        {/* Badge */}
                                        <div className="absolute top-2 right-2">
                                            <span className="bg-black/60 backdrop-blur-md text-white text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border border-white/10">
                                                {t("digital")}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Title & Menu */}
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-white font-bold text-sm leading-tight group-hover:text-primary transition-colors truncate">{product.name}</h3>
                                        <div className="relative" ref={menuOpenFor === product._id ? menuRef : undefined}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setMenuOpenFor(menuOpenFor === product._id ? null : product._id); setConfirmDeleteFor(null); }}
                                                className="text-gray-400 hover:text-white transition-colors cursor-pointer ml-1 flex-shrink-0"
                                            >
                                                <span className="material-icons text-[16px]">more_vert</span>
                                            </button>

                                            {/* Dropdown Menu */}
                                            {menuOpenFor === product._id && (
                                                <div className="absolute right-0 top-6 z-50 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-2xl overflow-hidden min-w-[160px] animate-in fade-in zoom-in-95 duration-150">
                                                    {confirmDeleteFor !== product._id ? (
                                                        <>
                                                            <button
                                                                onClick={() => { router.push(`/seller/products/${product._id}`); setMenuOpenFor(null); }}
                                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer text-left"
                                                            >
                                                                <span className="material-icons text-[14px]">analytics</span>
                                                                {t("productDetails")}
                                                            </button>
                                                            <div className="border-t border-white/5" />
                                                            <button
                                                                onClick={() => { openAffiliateManager(product._id, product.name); setMenuOpenFor(null); }}
                                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer text-left"
                                                            >
                                                                <span className="material-icons text-[14px]">group_add</span>
                                                                {t("manageAffiliates")}
                                                            </button>
                                                            <div className="border-t border-white/5" />
                                                            <button
                                                                onClick={() => setConfirmDeleteFor(product._id)}
                                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer text-left"
                                                            >
                                                                <span className="material-icons text-[14px]">delete_outline</span>
                                                                {t("deleteProduct")}
                                                            </button>
                                                        </>
                                                    ) : (
                                                        /* Confirm Delete */
                                                        <div className="p-3 space-y-2">
                                                            <p className="text-xs text-gray-300 font-medium">{t("deleteConfirm", { name: product.name })}</p>
                                                            <p className="text-[10px] text-gray-500 leading-relaxed">{t("deleteWarning")}</p>
                                                            <div className="flex gap-2 pt-1">
                                                                <button
                                                                    onClick={() => handleDelete(product._id)}
                                                                    disabled={isDeleting}
                                                                    className="flex-1 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1"
                                                                >
                                                                    {isDeleting ? (
                                                                        <span className="material-icons text-[12px] animate-spin">sync</span>
                                                                    ) : (
                                                                        <span className="material-icons text-[12px]">delete</span>
                                                                    )}
                                                                    {isDeleting ? t("deleting") : t("confirm")}
                                                                </button>
                                                                <button
                                                                    onClick={() => { setConfirmDeleteFor(null); setMenuOpenFor(null); }}
                                                                    className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 text-xs font-medium hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                                                >
                                                                    {t("cancel")}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-400 text-[11px] mb-3 line-clamp-2">{product.description || t("noDescription")}</p>

                                    <div className="mt-auto space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-base font-mono text-white font-bold">${product.price.toFixed(2)}</span>
                                            <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 font-medium">
                                                {t("active")}
                                            </span>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-1.5">
                                            <button
                                                onClick={() => router.push(`/seller/products/${product._id}`)}
                                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold hover:bg-primary/20 hover:border-primary/40 transition-all cursor-pointer"
                                            >
                                                <span className="material-icons text-[12px]">analytics</span>
                                                {t("details")}
                                            </button>
                                            <button
                                                onClick={() => openAffiliateManager(product._id, product.name)}
                                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-gray-400 text-[11px] font-bold hover:text-white hover:border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                                            >
                                                <span className="material-icons text-[12px]">group_add</span>
                                                {t("affiliates")}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                ))}

                                {/* Add New Product Trigger Card */}
                                <div
                                    id="add-product-trigger"
                                    onClick={() => { setIsDrawerOpen(prev => !prev); closeAffiliateManager(); }}
                                    className="group border border-dashed border-[#2a2a2a] hover:border-primary/50 hover:bg-primary/5 rounded-xl p-3 transition-all duration-300 flex flex-col h-full items-center justify-center cursor-pointer min-h-[200px]"
                                >
                                    <div className="w-12 h-12 rounded-full bg-[#121212] border border-[#2a2a2a] flex items-center justify-center mb-3 group-hover:border-primary/50 transition-colors shadow-lg">
                                        <span className="material-icons text-2xl text-gray-500 group-hover:text-primary transition-colors">add</span>
                                    </div>
                                    <h3 className="text-white font-bold text-sm mb-1">{t("addNewProduct")}</h3>
                                    <p className="text-gray-500 text-[11px] text-center">{t("createItem")}</p>
                                </div>
                            </>
                        )}

                    </div>
                </div>


            </div>

            {/* Drawers */}
            <ProductDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
            <AffiliateManagerDrawer
                isOpen={isAffiliateManagerOpen}
                onClose={closeAffiliateManager}
                productId={affiliateDrawerProductId}
                productName={affiliateDrawerProductName}
            />
        </div>
    );
}
