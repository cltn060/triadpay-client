"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { TopNav } from "@/components/dashboard";
import { useTranslations } from "next-intl";

// ─── Available trust badges ─────────────────────────────────────────────────
const BADGE_OPTIONS = [
    { key: "secure_payment", icon: "lock" },
    { key: "money_back", icon: "currency_exchange" },
    { key: "fast_shipping", icon: "local_shipping" },
    { key: "24_7_support", icon: "support_agent" },
] as const;

export default function CheckoutBuilderPage() {
    const t = useTranslations("CheckoutBuilder");
    const config = useQuery(api.checkoutConfig.getMyCheckoutConfig);
    const saveConfig = useMutation(api.checkoutConfig.saveCheckoutConfig);

    // ─── Local form state ───────────────────────────────────────────────────
    const [trustBadgesEnabled, setTrustBadgesEnabled] = useState(true);
    const [trustBadges, setTrustBadges] = useState<string[]>(["secure_payment", "money_back"]);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // ─── Hydrate from DB ────────────────────────────────────────────────────
    useEffect(() => {
        if (config) {
            setTrustBadgesEnabled(config.trustBadgesEnabled);
            setTrustBadges(config.trustBadges ?? ["secure_payment", "money_back"]);
        }
    }, [config]);

    // ─── Toggle a trust badge ───────────────────────────────────────────────
    const toggleBadge = useCallback((key: string) => {
        setTrustBadges((prev) =>
            prev.includes(key) ? prev.filter((b) => b !== key) : [...prev, key]
        );
    }, []);

    // ─── Save ───────────────────────────────────────────────────────────────
    const handleSave = async () => {
        setSaving(true);
        try {
            await saveConfig({
                orderBumpEnabled: false,
                trustBadgesEnabled,
                trustBadges,
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error("[checkout-builder] Save failed:", err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
            <TopNav title={t("title")} />

            {/* Header with actions */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-[#262626]">
                <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-bold text-white tracking-tight">{t("customizeTitle")}</h2>
                    <p className="text-gray-500 text-sm">{t("customizeNote")}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center justify-center gap-2 h-10 px-6 rounded-lg bg-primary hover:brightness-110 text-black text-sm font-bold shadow-glow transition-all disabled:opacity-50 cursor-pointer"
                    >
                        <span className="material-icons text-[18px]">{saved ? "check" : "save"}</span>
                        {saving ? t("saving") : saved ? t("saved") : t("saveChanges")}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">

                    {/* ─── Left Column: Configuration ──────────────────────────── */}
                    <div className="lg:col-span-5 flex flex-col gap-6">

                        {/* Trust Badges Card */}
                        <div className="bg-[#121212] border border-[#262626] rounded-xl overflow-hidden">
                            <div className="p-5 border-b border-[#262626] flex items-center justify-between bg-white/[0.02]">
                                <div className="flex items-center gap-3">
                                    <span className="material-icons text-primary text-[24px]">verified_user</span>
                                    <h3 className="text-lg font-bold text-white">{t("trustBadges")}</h3>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        checked={trustBadgesEnabled}
                                        onChange={(e) => setTrustBadgesEnabled(e.target.checked)}
                                        className="sr-only peer"
                                        type="checkbox"
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                            <div className="p-5">
                                <p className="text-sm text-gray-400 mb-4">{t("trustBadgesNote")}</p>
                                <div className="flex flex-wrap gap-2">
                                    {BADGE_OPTIONS.map((badge) => {
                                        const active = trustBadges.includes(badge.key);
                                        return (
                                            <button
                                                key={badge.key}
                                                onClick={() => toggleBadge(badge.key)}
                                                className={`px-3 py-2 rounded-lg border text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${active
                                                    ? "border-primary bg-primary/10 text-white"
                                                    : "border-[#262626] bg-[#050505] text-gray-400 hover:border-gray-500 hover:text-white"
                                                    }`}
                                            >
                                                <span className={`material-icons text-[16px] ${active ? "text-primary" : ""}`}>{badge.icon}</span>
                                                {t(`badges.${badge.key}`)}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Future features hint */}
                        <div className="bg-[#121212] border border-[#262626] rounded-xl overflow-hidden">
                            <div className="p-5 border-b border-[#262626] flex items-center justify-between bg-white/[0.02]">
                                <div className="flex items-center gap-3">
                                    <span className="material-icons text-primary text-[24px]">local_offer</span>
                                    <h3 className="text-lg font-bold text-white">{t("coupons")}</h3>
                                </div>
                                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t("comingSoon")}</span>
                            </div>
                            <div className="p-5">
                                <p className="text-sm text-gray-500">{t("couponsNote")}</p>
                            </div>
                        </div>
                    </div>

                    {/* ─── Right Column: Live Preview ──────────────────────────── */}
                    <div className="lg:col-span-7 flex flex-col sticky top-6">
                        <div className="flex items-center justify-between mb-3 px-1">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t("livePreview")}</span>
                            <div className="flex items-center gap-2">
                                <button className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                                    <span className="material-icons text-[16px]">desktop_windows</span>
                                </button>
                                <button className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                                    <span className="material-icons text-[16px]">smartphone</span>
                                </button>
                            </div>
                        </div>

                        {/* Browser Window Frame */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col min-h-[600px] border-4 border-gray-800 relative">
                            {/* Fake Browser Bar */}
                            <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center gap-4">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                </div>
                                <div className="bg-white border border-gray-200 rounded px-3 py-1 text-xs text-gray-400 flex-1 text-center font-mono">
                                    checkout.yourstore.com
                                </div>
                            </div>

                            {/* Preview Content — matches new white single-column checkout */}
                            <div className="flex-1 bg-gray-50 p-6 overflow-y-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mx-auto">
                                        
                                        {/* Left Column (Info) */}
                                        <div className="flex flex-col gap-4">
                                            {/* Store Header */}
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-md bg-gray-900 flex items-center justify-center">
                                                    <span className="material-icons text-white text-sm">storefront</span>
                                                </div>
                                                <span className="text-sm font-bold text-gray-900">{t("yourStore")}</span>
                                            </div>

                                            {/* Product Card */}
                                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                                <div className="flex flex-col gap-3">
                                                    <div className="w-full aspect-video bg-gray-100 rounded-md shrink-0 flex items-center justify-center">
                                                        <span className="material-icons text-gray-300 text-lg">image</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <h4 className="font-semibold text-gray-900 text-xs">Premium Widget X</h4>
                                                        <span className="font-bold text-gray-900 text-sm mt-1">$49.00</span>
                                                        <p className="text-[10px] text-gray-500 mt-1">{t("digitalProduct")}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Trust Badges Preview */}
                                            {trustBadgesEnabled && trustBadges.length > 0 && (
                                                <div className="flex flex-col items-start gap-2 mt-2">
                                                    <div className="flex gap-4">
                                                        {trustBadges.map((badgeKey) => {
                                                            const badge = BADGE_OPTIONS.find((b) => b.key === badgeKey);
                                                            if (!badge) return null;
                                                            return (
                                                                <div key={badgeKey} className="flex flex-col items-start gap-0.5">
                                                                    <span className="material-icons text-gray-400 text-[16px]">{badge.icon}</span>
                                                                    <span className="text-[8px] text-gray-500 font-medium uppercase tracking-wider">{t(`badges.${badgeKey}`)}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Column (Payment) */}
                                        <div className="flex flex-col">
                                            {/* Payment Form Mock */}
                                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
                                                <h4 className="font-bold text-gray-900 text-xs mb-3">{t("paymentDetails")}</h4>
                                                
                                                <div className="space-y-2 mb-4">
                                                    {/* Email */}
                                                    <div>
                                                        <label className="text-[10px] font-medium text-gray-600 block mb-1">{t("emailAddress")}</label>
                                                        <div className="h-8 bg-white border border-gray-300 rounded w-full"></div>
                                                    </div>
                                                    {/* Card */}
                                                    <div>
                                                        <label className="text-[10px] font-medium text-gray-600 block mb-1">{t("cardInformation")}</label>
                                                        <div className="h-8 bg-white border border-gray-300 rounded-t w-full"></div>
                                                        <div className="flex -mt-[1px]">
                                                            <div className="h-8 bg-white border border-gray-300 rounded-bl w-1/2 border-t-0 border-r-0"></div>
                                                            <div className="h-8 bg-white border border-gray-300 rounded-br w-1/2 border-t-0"></div>
                                                        </div>
                                                    </div>
                                                    {/* Name */}
                                                    <div>
                                                        <label className="text-[10px] font-medium text-gray-600 block mb-1">{t("nameOnCard")}</label>
                                                        <div className="h-8 bg-white border border-gray-300 rounded w-full"></div>
                                                    </div>
                                                </div>

                                                <div className="mt-auto">
                                                    {/* CTA */}
                                                    <button className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-md">
                                                        <span className="material-icons text-sm">lock</span>
                                                        {t("payAmount", { amount: "$49.00" })}
                                                    </button>
                                                    
                                                    {/* Footer */}
                                                    <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-[9px] text-gray-400">
                                                        <span>{t("securedBy", { brand: "Caruma" })}</span>
                                                        <span className="flex items-center gap-0.5"><span className="material-icons text-[10px]">lock</span> {t("sslEncrypted")}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                    </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
