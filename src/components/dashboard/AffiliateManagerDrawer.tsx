"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useTranslations } from "next-intl";

export function AffiliateManagerDrawer({
    isOpen,
    onClose,
    productId,
    productName,
}: {
    isOpen: boolean;
    onClose: () => void;
    productId: Id<"products"> | null;
    productName: string;
}) {
    const t = useTranslations("AffiliateManagerDrawer");
    const [commissionPercent, setCommissionPercent] = useState("10");
    const [selectedAffiliateId, setSelectedAffiliateId] = useState<string>("");
    const [isAdding, setIsAdding] = useState(false);
    const [copiedLink, setCopiedLink] = useState<string | null>(null);

    // Dynamic checkout URL base
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const checkoutBase = productId
        ? `${protocol}://${rootDomain}/checkout/${productId}`
        : "";

    const drawerRef = useRef<HTMLDivElement>(null);

    // Fetch affiliates currently attached to this product
    const productAffiliates = useQuery(
        api.affiliates.getProductAffiliates,
        productId ? { productId } : "skip"
    );

    // Fetch all APPROVED affiliates from the seller's store
    const storeSlug = useQuery(api.memberships.getMyStoreSlug);
    const storeAffiliates = useQuery(
        api.memberships.getStoreAffiliates,
        storeSlug ? { storeSlug } : "skip"
    );

    // Check if seller has PSP configured (resolved from store level)
    const myPspStatus = useQuery(api.paymentsHelpers.getSellerPaymentStatus);
    const myPsp = myPspStatus?.activePsp ?? null;

    // Only show approved affiliates that are NOT already attached to this product
    const availableAffiliates = storeAffiliates
        ?.filter((a) => a.status === "APPROVED")
        ?.filter((a) => !productAffiliates?.some((pa) => pa.affiliateId === a.userId))
        ?? [];

    const addAffiliate = useMutation(api.affiliates.addAffiliateToProduct);
    const removeAffiliate = useMutation(api.affiliates.removeAffiliateFromProduct);

    // Handle clicking outside the drawer
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
                onClose();
            }
        }
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    const handleAdd = async () => {
        if (!selectedAffiliateId || !productId) return;
        setIsAdding(true);
        try {
            await addAffiliate({
                productId,
                affiliateUserId: selectedAffiliateId as Id<"users">,
                commissionPercent: parseFloat(commissionPercent),
            });
            setSelectedAffiliateId("");
            setCommissionPercent("10");
        } catch (error: any) {
            alert(error.message || "Failed to add affiliate.");
        } finally {
            setIsAdding(false);
        }
    };

    const handleRemove = async (linkId: Id<"productAffiliates">) => {
        try {
            await removeAffiliate({ linkId });
        } catch (error: any) {
            alert(error.message || "Failed to remove affiliate.");
        }
    };

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopiedLink(url);
        setTimeout(() => setCopiedLink(null), 2000);
    };

    if (!isOpen || !productId) return null;

    return (
        <div
            ref={drawerRef}
            className="fixed top-20 right-0 bottom-0 w-full max-w-[480px] bg-[#121212] border-l border-[#2a2a2a] flex flex-col animate-in slide-in-from-right duration-300 z-40 font-sans"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#2a2a2a] shrink-0">
                <div>
                    <h2 className="text-white text-lg font-bold tracking-tight">{t("title")}</h2>
                    <p className="text-gray-500 text-xs mt-0.5">{t("subtitle", { name: productName })}</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#2a2a2a] cursor-pointer">
                    <span className="material-icons">close</span>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">

                {/* Add Affiliate Section */}
                <div className="bg-[#050505] border border-[#2a2a2a] rounded-xl p-5 space-y-4">
                    <h3 className="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                        <span className="material-icons text-[16px] text-primary">person_add</span>
                        {t("assignAffiliate")}
                    </h3>

                    {availableAffiliates.length === 0 ? (
                        <p className="text-gray-500 text-xs">
                            {storeAffiliates === undefined
                                ? t("loadingAffiliates")
                                : t("noAffiliatesAvailable")}
                        </p>
                    ) : (
                        <>
                            {/* Affiliate Selector */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-500 tracking-wider uppercase">{t("selectAffiliate")}</label>
                                <select
                                    value={selectedAffiliateId}
                                    onChange={(e) => setSelectedAffiliateId(e.target.value)}
                                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded-lg h-11 px-4 text-white text-sm focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                                >
                                    <option value="">{t("chooseAffiliate")}</option>
                                    {availableAffiliates.map((a) => (
                                        <option
                                            key={a.userId}
                                            value={a.userId}
                                            disabled={!a.hasPspConnected}
                                        >
                                            {a.affiliateEmail}{!a.hasPspConnected ? ` · ${t("noPspWarning")}` : ""}
                                        </option>
                                    ))}
                                </select>
                                {availableAffiliates.some((a) => !a.hasPspConnected) && (
                                    <p className="text-amber-400/80 text-[10px] flex items-center gap-1">
                                        <span className="material-icons text-[11px]">info</span>
                                        {t("greyedOutNote")}
                                    </p>
                                )}
                            </div>

                            {/* Commission Input */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-500 tracking-wider uppercase">{t("commissionPercent")}</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        step="1"
                                        value={commissionPercent}
                                        onChange={(e) => setCommissionPercent(e.target.value)}
                                        className="w-full bg-[#121212] border border-[#2a2a2a] rounded-lg h-11 px-4 pr-10 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                                </div>
                            </div>

                            {/* Add Button */}
                            <button
                                onClick={handleAdd}
                                disabled={!selectedAffiliateId || isAdding}
                                className="w-full px-6 py-2.5 rounded-lg bg-primary text-black text-sm font-bold shadow-glow hover:shadow-glow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span className="material-icons text-[16px]">add</span>
                                {isAdding ? t("adding") : t("assignToProduct")}
                            </button>
                        </>
                    )}
                </div>

                {/* Checkout Links Section */}
                <div className="bg-[#050505] border border-[#2a2a2a] rounded-xl p-5 space-y-4">
                    <h3 className="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                        <span className="material-icons text-[16px] text-primary">link</span>
                        {t("checkoutLinks")}
                    </h3>

                    {/* PSP Warning */}
                    {myPsp === null && (
                        <a
                            href="/seller/payments"
                            className="flex items-center gap-2.5 bg-amber-500/[0.06] border border-amber-500/20 rounded-lg px-3.5 py-3 hover:brightness-110 transition-all cursor-pointer"
                        >
                            <span className="material-icons text-amber-400 text-xl flex-shrink-0">warning</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-amber-400 text-xs font-bold">{t("linksNotFunctional")}</p>
                                <p className="text-gray-500 text-[10px] mt-0.5">{t("connectPspNote")}</p>
                            </div>
                            <span className="material-icons text-gray-500 text-[14px] flex-shrink-0">arrow_forward</span>
                        </a>
                    )}

                    {/* Default Product Link */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 tracking-wider uppercase">{t("defaultLink")}</label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-[#121212] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-gray-400 font-mono truncate">
                                {checkoutBase}
                            </div>
                            <button
                                onClick={() => copyToClipboard(checkoutBase)}
                                className="flex-shrink-0 px-3 py-2 rounded-lg bg-white/5 border border-[#2a2a2a] text-gray-400 hover:text-white hover:border-primary/30 transition-all cursor-pointer"
                                title={t("copyLink")}
                            >
                                <span className="material-icons text-[14px]">
                                    {copiedLink === checkoutBase ? "check" : "content_copy"}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Per-Affiliate Links */}
                    {productAffiliates && productAffiliates.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-[#2a2a2a]">
                            <label className="text-xs font-bold text-gray-500 tracking-wider uppercase">{t("affiliateTrackingLinks")}</label>
                            {productAffiliates.map((link) => {
                                const affiliateUrl = `${checkoutBase}?ref=${link.affiliateId}`;
                                return (
                                    <div key={link._id} className="space-y-1">
                                        <p className="text-xs text-gray-500">{link.affiliateEmail} ({link.commissionPercent}%)</p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-[#121212] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-gray-400 font-mono truncate">
                                                {affiliateUrl}
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard(affiliateUrl)}
                                                className="flex-shrink-0 px-3 py-2 rounded-lg bg-white/5 border border-[#2a2a2a] text-gray-400 hover:text-white hover:border-primary/30 transition-all cursor-pointer"
                                                title={t("copyLink")}
                                            >
                                                <span className="material-icons text-[14px]">
                                                    {copiedLink === affiliateUrl ? "check" : "content_copy"}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Current Affiliates List */}
                <div>
                    <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="material-icons text-[16px] text-white/50">group</span>
                        {t("attachedAffiliates")}
                        <span className="text-xs font-normal text-gray-500 ml-auto">{t("totalAffiliates", { count: productAffiliates?.length ?? 0 })}</span>
                    </h3>

                    {productAffiliates === undefined && (
                        <div className="text-center py-8 text-gray-500">
                            <span className="material-icons text-3xl mb-2 block animate-pulse">sync</span>
                            <p className="text-xs">{t("loading")}</p>
                        </div>
                    )}

                    {productAffiliates && productAffiliates.length === 0 && (
                        <div className="text-center py-8 bg-[#050505] rounded-xl border border-[#2a2a2a]">
                            <span className="material-icons text-3xl text-gray-600 mb-2 block">person_off</span>
                            <p className="text-gray-500 text-xs">{t("noAffiliatesAssigned")}</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        {productAffiliates?.map((link) => (
                            <div
                                key={link._id}
                                className="flex items-center gap-3 bg-[#050505] border border-[#2a2a2a] rounded-xl px-4 py-3 hover:border-white/10 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                                    <span className="material-icons text-gray-500 text-sm">person</span>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-sm text-white font-medium truncate">{link.affiliateEmail}</p>
                                    <p className="text-xs text-primary">{t("commissionLabel", { percent: link.commissionPercent })}</p>
                                </div>
                                <button
                                    onClick={() => handleRemove(link._id)}
                                    className="text-gray-500 hover:text-red-400 transition-colors cursor-pointer p-1 rounded-full hover:bg-red-500/10"
                                    title={t("removeAffiliate")}
                                >
                                    <span className="material-icons text-[18px]">delete_outline</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
