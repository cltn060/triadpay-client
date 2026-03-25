"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { TopNav } from "@/components/dashboard/TopNav";
import { useStoreContext } from "@/providers/store-context";
import { useState, useEffect, useRef } from "react";
import { cn, getErrorMessage } from "@/lib/utils";

export default function WLSettingsPage() {
    const { store } = useStoreContext();

    // ── Branding state ─────────────────────────────────────────────────
    const updateStore = useMutation(api.stores.updateStoreBasicInfo);
    const generateLogoUploadUrl = useMutation(api.stores.generateLogoUploadUrl);
    const storeLogoUrl = useQuery(
        api.stores.getLogoUrl,
        store?._id ? { storeId: store._id } : "skip"
    );

    const [storeName, setStoreName] = useState("");
    const [supportEmail, setSupportEmail] = useState("");
    const [brandColor, setBrandColor] = useState("#0df20d");
    const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
    const [logoHasWhiteBg, setLogoHasWhiteBg] = useState(false);
    const [brandingSaving, setBrandingSaving] = useState(false);
    const [brandingSaved, setBrandingSaved] = useState(false);
    const [brandingError, setBrandingError] = useState("");
    const logoInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (store) {
            setStoreName(store.name || "");
            setSupportEmail(store.supportEmail || "");
            setBrandColor(store.themeColor || "#0df20d");
            setLogoHasWhiteBg(store.logoHasWhiteBg ?? false);
        }
    }, [store]);

    const handleSaveBranding = async () => {
        if (!store) return;
        setBrandingSaving(true);
        setBrandingError("");
        setBrandingSaved(false);
        try {
            let logoStorageId = store.logoStorageId;
            if (selectedLogo) {
                const postUrl = await generateLogoUploadUrl();
                const result = await fetch(postUrl, {
                    method: "POST",
                    headers: { "Content-Type": selectedLogo.type },
                    body: selectedLogo,
                });
                if (!result.ok) throw new Error("Failed to upload logo.");
                const { storageId } = await result.json();
                logoStorageId = storageId;
            }
            await updateStore({
                storeId: store._id,
                name: storeName,
                supportEmail,
                themeColor: brandColor,
                logoStorageId,
                logoHasWhiteBg,
            });
            setBrandingSaved(true);
            setSelectedLogo(null);
            setTimeout(() => setBrandingSaved(false), 3000);
        } catch (e: unknown) {
            setBrandingError(getErrorMessage(e));
        } finally {
            setBrandingSaving(false);
        }
    };

    // ── Fee state ──────────────────────────────────────────────────────
    const commission = useQuery(
        api.storeCommission.getStoreCommission,
        store?._id ? { storeId: store._id } : "skip"
    );
    const upsert = useMutation(api.storeCommission.upsertStoreCommission);

    const [wlFee, setWlFee] = useState("");
    const [platformFee, setPlatformFee] = useState("");
    const [affiliateFee, setAffiliateFee] = useState("");
    const [feeSaving, setFeeSaving] = useState(false);
    const [feeSaved, setFeeSaved] = useState(false);
    const [feeError, setFeeError] = useState("");

    useEffect(() => {
        if (commission) {
            setWlFee(String(commission.wlOwnerFeePercent));
            setPlatformFee(String(commission.platformFeePercent));
            setAffiliateFee(String(commission.defaultAffiliatePercent));
        }
    }, [commission]);

    const handleSaveFees = async () => {
        if (!store) return;
        setFeeSaving(true);
        setFeeError("");
        setFeeSaved(false);
        try {
            await upsert({
                storeId: store._id,
                wlOwnerFeePercent: parseFloat(wlFee) || 0,
                platformFeePercent: parseFloat(platformFee) || 0,
                defaultAffiliatePercent: parseFloat(affiliateFee) || 0,
            });
            setFeeSaved(true);
            setTimeout(() => setFeeSaved(false), 3000);
        } catch (e: unknown) {
            setFeeError(getErrorMessage(e));
        } finally {
            setFeeSaving(false);
        }
    };

    // ── PSP state ──────────────────────────────────────────────────────
    const connectPsp = useMutation(api.stores.connectStorePsp);
    const verifyPsp = useMutation(api.stores.verifyStorePsp);
    const onboardOwner = useAction(api.stripeActions.onboardSeller);
    const checkStripeStatus = useAction(api.stripeActions.checkStripeOnboardingStatus);
    const pspStatus = useQuery(api.paymentsHelpers.getSellerPaymentStatus);

    const [isConnecting, setIsConnecting] = useState(false);
    const [pspError, setPspError] = useState("");
    const [stripeProgress, setStripeProgress] = useState<{
        chargesEnabled: boolean;
        payoutsEnabled: boolean;
        detailsSubmitted: boolean;
        requirementsDue: number;
        requirementsComplete: number;
        percent: number;
    } | null>(null);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);
    const [isOpeningStripeDash, setIsOpeningStripeDash] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1024);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);
    const getStripeDashboardUrl = useAction(api.stripeActions.getSellerStripeDashboardUrl);

    const stripeCreds = pspStatus?.connectedProviders.find((c) => c.provider === "STRIPE");

    const handleConnectStripe = async () => {
        if (!store) return;
        setIsConnecting(true);
        setPspError("");
        try {
            if (!store.pspProvider) {
                await connectPsp({ storeId: store._id, pspProvider: "STRIPE" });
            }
            const returnUrl = window.location.href;
            const result = await onboardOwner({ returnUrl, refreshUrl: returnUrl });
            if (result.url) window.location.href = result.url;
        } catch (e: unknown) {
            setPspError(getErrorMessage(e));
            setIsConnecting(false);
        }
    };

    const handleCheckProgress = async () => {
        if (!store) return;
        setIsCheckingStatus(true);
        setPspError("");
        try {
            const status = await checkStripeStatus();
            const total = status.requirementsComplete + status.requirementsDue;
            const percent = total > 0 ? Math.round((status.requirementsComplete / total) * 100) : 0;
            setStripeProgress({ ...status, percent });
            if (status.detailsSubmitted && status.chargesEnabled && status.payoutsEnabled) {
                await verifyPsp({ storeId: store._id });
            }
        } catch (e: unknown) {
            setPspError(getErrorMessage(e));
        } finally {
            setIsCheckingStatus(false);
        }
    };

    const handleContinueOnboarding = async () => {
        if (!store) return;
        setIsConnecting(true);
        setPspError("");
        try {
            const returnUrl = window.location.href;
            const result = await onboardOwner({ returnUrl, refreshUrl: returnUrl });
            if (result.url) window.location.href = result.url;
        } catch (e: unknown) {
            setPspError(getErrorMessage(e));
            setIsConnecting(false);
        }
    };

    useEffect(() => {
        if (stripeCreds && store?.pspStatus !== "CONNECTED" && !stripeProgress && !isCheckingStatus) {
            handleCheckProgress();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stripeCreds, store?.pspStatus]);

    // ── Preset colors ──────────────────────────────────────────────────
    const presetColors = [
        { color: "#0df20d", label: "Neon" },
        { color: "#3b82f6", label: "Blue" },
        { color: "#8b5cf6", label: "Purple" },
        { color: "#ec4899", label: "Pink" },
        { color: "#f97316", label: "Orange" },
        { color: "#ef4444", label: "Red" },
        { color: "#14b8a6", label: "Teal" },
        { color: "#eab308", label: "Gold" },
    ];

    return (
        <>
            <TopNav title="Settings" />
            <div className="relative z-0 w-full overflow-y-auto pb-24" style={{ padding: isMobile ? "16px" : "32px" }}>

                {/* Responsive: two columns on desktop, single column on mobile */}
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "1.5rem" : "2rem", alignItems: "start" }}>

                    {/* ═══════════ LEFT COLUMN: Store Branding ═══════════ */}
                    <section className="bg-surface-dark border border-white/5 rounded-2xl p-6 space-y-6">
                        <div>
                            <h3 className="text-white font-bold text-lg">Store Branding</h3>
                            <p className="text-text-grey text-sm mt-1">
                                Customize how your platform looks to sellers and customers.
                            </p>
                        </div>

                        {/* Store Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-grey uppercase tracking-widest">
                                Store Name
                            </label>
                            <input
                                type="text"
                                value={storeName}
                                onChange={(e) => setStoreName(e.target.value)}
                                placeholder="My Awesome Platform"
                                className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-grey/40 focus:outline-none focus:border-primary/50 transition-colors"
                            />
                            <p className="text-xs text-text-grey">
                                Displayed in the sidebar, checkout pages, and emails.
                            </p>
                        </div>

                        {/* Support Email */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-grey uppercase tracking-widest">
                                Support Email
                            </label>
                            <input
                                type="email"
                                value={supportEmail}
                                onChange={(e) => setSupportEmail(e.target.value)}
                                placeholder="support@yourstore.com"
                                className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-grey/40 focus:outline-none focus:border-primary/50 transition-colors"
                            />
                            <p className="text-xs text-text-grey">
                                Shown to customers on receipts and checkout pages.
                            </p>
                        </div>

                        {/* Logo */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-text-grey uppercase tracking-widest">
                                Store Logo
                            </label>

                            <input
                                type="file"
                                ref={logoInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => setSelectedLogo(e.target.files?.[0] || null)}
                            />

                            <div className="flex items-start gap-5">
                                <div
                                    onClick={() => logoInputRef.current?.click()}
                                    className="relative group w-28 h-28 shrink-0 rounded-2xl bg-background-dark border border-dashed border-white/10 hover:border-white/30 hover:bg-white/5 flex flex-col items-center justify-center transition-all overflow-hidden cursor-pointer"
                                >
                                    {(selectedLogo || storeLogoUrl) ? (
                                        <div className={cn(
                                            "absolute inset-1 rounded-xl flex items-center justify-center p-2 group-hover:scale-105 transition-all overflow-hidden border",
                                            logoHasWhiteBg ? "bg-white border-white/20" : "bg-transparent border-transparent"
                                        )}>
                                            <img
                                                src={selectedLogo ? URL.createObjectURL(selectedLogo) : (storeLogoUrl as string)}
                                                alt="Store Logo"
                                                className="w-full h-full object-contain"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="material-icons text-white">edit</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="material-icons text-text-grey group-hover:text-white transition-colors text-[28px] mb-1">add_photo_alternate</span>
                                            <p className="text-text-grey/50 text-[9px]">Upload</p>
                                        </>
                                    )}
                                </div>

                                <div className="space-y-2 pt-1">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={logoHasWhiteBg}
                                                onChange={(e) => setLogoHasWhiteBg(e.target.checked)}
                                                className="sr-only"
                                            />
                                            <div className={cn(
                                                "w-9 h-5 rounded-full transition-colors duration-200",
                                                logoHasWhiteBg ? "bg-primary" : "bg-white/10"
                                            )} />
                                            <div className={cn(
                                                "absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 shadow-sm",
                                                logoHasWhiteBg ? "translate-x-4" : "translate-x-0"
                                            )} />
                                        </div>
                                        <span className="text-xs text-text-grey group-hover:text-white transition-colors font-medium">
                                            White background
                                        </span>
                                    </label>
                                    <p className="text-xs text-text-grey/60">
                                        Square PNG recommended, 100x100px+
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Accent Color */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-text-grey uppercase tracking-widest">
                                    Accent Color
                                </label>
                                <button
                                    onClick={() => setBrandColor("#0df20d")}
                                    className="text-[10px] text-text-grey hover:text-white transition-colors cursor-pointer"
                                >
                                    Reset default
                                </button>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-background-dark border border-white/5 rounded-xl">
                                <div className="relative w-10 h-10 shrink-0">
                                    <input
                                        type="color"
                                        value={brandColor}
                                        onChange={(e) => setBrandColor(e.target.value)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div
                                        className="w-full h-full rounded-lg border-2 border-white/10"
                                        style={{ backgroundColor: brandColor }}
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={brandColor}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (/^#[0-9a-fA-F]{0,6}$/.test(val)) setBrandColor(val);
                                    }}
                                    className="w-20 bg-transparent border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-primary/50"
                                />
                                <div className="flex gap-1.5 flex-wrap">
                                    {presetColors.map((p) => (
                                        <button
                                            key={p.color}
                                            onClick={() => setBrandColor(p.color)}
                                            title={p.label}
                                            className={cn(
                                                "w-6 h-6 rounded-full border border-white/10 transition-all active:scale-90 cursor-pointer hover:scale-110",
                                                brandColor === p.color && "ring-2 ring-white ring-offset-1 ring-offset-background-dark"
                                            )}
                                            style={{ backgroundColor: p.color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] text-text-grey uppercase font-bold tracking-widest">Preview</span>
                                <div
                                    className="px-3 py-1 rounded-full text-[10px] font-bold text-black"
                                    style={{ backgroundColor: brandColor }}
                                >
                                    Button
                                </div>
                                <div
                                    className="px-3 py-1 rounded-full text-[10px] font-bold border"
                                    style={{ borderColor: brandColor, color: brandColor }}
                                >
                                    Outline
                                </div>
                                <span className="text-xs font-semibold" style={{ color: brandColor }}>Link</span>
                            </div>
                        </div>

                        {/* Sidebar Preview */}
                        <div className="p-4 bg-background-dark border border-white/5 rounded-xl">
                            <p className="text-[10px] text-text-grey uppercase font-bold tracking-widest mb-3">
                                Sidebar Preview
                            </p>
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden shrink-0",
                                    (selectedLogo || storeLogoUrl) ? (logoHasWhiteBg ? "bg-white" : "bg-transparent") : "bg-white"
                                )}>
                                    {(selectedLogo || storeLogoUrl) ? (
                                        <img
                                            src={selectedLogo ? URL.createObjectURL(selectedLogo) : (storeLogoUrl as string)}
                                            alt="Preview"
                                            className="w-full h-full object-contain p-0.5"
                                        />
                                    ) : (
                                        <span className="font-bold text-black text-sm">
                                            {(storeName || "S").charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm leading-tight">
                                        {storeName || "Store Name"}
                                    </p>
                                    <span
                                        className="text-[10px] font-semibold uppercase tracking-widest"
                                        style={{ color: brandColor }}
                                    >
                                        White-Label
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Save */}
                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                            <div>
                                {brandingError && <p className="text-red-400 text-sm">{brandingError}</p>}
                                {brandingSaved && (
                                    <div className="flex items-center gap-2 text-primary">
                                        <span className="material-icons text-sm">check_circle</span>
                                        <p className="text-sm font-semibold">Saved</p>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleSaveBranding}
                                disabled={brandingSaving}
                                className="flex items-center gap-2 bg-primary text-black font-bold text-sm px-6 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer active:scale-95"
                            >
                                <span className="material-icons text-[18px]">
                                    {brandingSaving ? "sync" : "save"}
                                </span>
                                {brandingSaving ? "Saving..." : "Save Branding"}
                            </button>
                        </div>
                    </section>

                    {/* ═══════════ RIGHT COLUMN: Payments + Fees ═══════════ */}
                    <div className="space-y-6">

                        {/* Payment Provider */}
                        <section className="bg-surface-dark border border-white/5 rounded-2xl p-6 space-y-4">
                            <h3 className="text-white font-semibold text-base">Payment Provider</h3>

                            {/* State A: Fully connected */}
                            {store?.pspProvider && store.pspStatus === "CONNECTED" && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className="material-icons text-green-400">check_circle</span>
                                        <div>
                                            <p className="text-white font-medium">Stripe connected</p>
                                            <p className="text-xs text-text-grey mt-0.5">
                                                Locked in — cannot be changed. Your platform can process payments.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            setIsOpeningStripeDash(true);
                                            try {
                                                const returnUrl = window.location.href;
                                                const result = await getStripeDashboardUrl({ returnUrl, refreshUrl: returnUrl });
                                                if (result.url) window.open(result.url, "_blank");
                                            } catch (e: unknown) {
                                                setPspError(getErrorMessage(e));
                                            } finally {
                                                setIsOpeningStripeDash(false);
                                            }
                                        }}
                                        disabled={isOpeningStripeDash}
                                        className="flex items-center gap-2 text-sm text-primary hover:underline font-medium cursor-pointer disabled:opacity-50"
                                    >
                                        <span className="material-icons text-[16px]">
                                            {isOpeningStripeDash ? "sync" : "open_in_new"}
                                        </span>
                                        {isOpeningStripeDash ? "Opening..." : "Open Stripe Dashboard"}
                                    </button>
                                </div>
                            )}

                            {/* State B: PSP chosen, onboarding incomplete */}
                            {store?.pspProvider && store.pspStatus !== "CONNECTED" && (
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center flex-shrink-0">
                                            <span className="material-icons text-yellow-400 text-xl">pending</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-white font-semibold text-sm">
                                                {stripeCreds ? "Onboarding In Progress" : "Connect Stripe"}
                                            </h4>
                                            <p className="text-text-grey text-xs mt-0.5">
                                                {stripeCreds
                                                    ? "Complete your Stripe setup to start accepting payments."
                                                    : "Set up Stripe to enable payments for your sellers."}
                                            </p>
                                        </div>
                                    </div>

                                    {stripeCreds && stripeProgress && (
                                        <div className="rounded-xl bg-background-dark border border-white/5 p-4 space-y-3">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-text-grey font-semibold uppercase tracking-widest">Progress</span>
                                                    <span className="text-sm font-bold text-white">{stripeProgress.percent}%</span>
                                                </div>
                                                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${stripeProgress.percent}%`,
                                                            backgroundColor: stripeProgress.percent === 100 ? "#4ade80" : "#facc15",
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {[
                                                    { key: "detailsSubmitted", label: "Details submitted" },
                                                    { key: "chargesEnabled", label: "Charges enabled" },
                                                    { key: "payoutsEnabled", label: "Payouts enabled" },
                                                ].map((item) => (
                                                    <div
                                                        key={item.key}
                                                        className={cn(
                                                            "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium",
                                                            stripeProgress[item.key as keyof typeof stripeProgress]
                                                                ? "bg-green-400/10 text-green-400"
                                                                : "bg-white/5 text-text-grey"
                                                        )}
                                                    >
                                                        <span className="material-icons text-[14px]">
                                                            {stripeProgress[item.key as keyof typeof stripeProgress] ? "check_circle" : "radio_button_unchecked"}
                                                        </span>
                                                        {item.label}
                                                    </div>
                                                ))}
                                            </div>
                                            {stripeProgress.requirementsDue > 0 && (
                                                <p className="text-xs text-text-grey">
                                                    {stripeProgress.requirementsDue} requirement{stripeProgress.requirementsDue !== 1 ? "s" : ""} remaining.
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {stripeCreds && isCheckingStatus && !stripeProgress && (
                                        <div className="rounded-xl bg-background-dark border border-white/5 p-4 flex items-center justify-center gap-2">
                                            <span className="material-icons text-text-grey text-[16px] animate-spin">sync</span>
                                            <span className="text-xs text-text-grey">Checking Stripe status...</span>
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={stripeCreds ? handleContinueOnboarding : handleConnectStripe}
                                            disabled={isConnecting}
                                            className="flex items-center justify-center gap-2 bg-primary text-black font-semibold text-sm px-5 py-3 rounded-xl hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                                        >
                                            <span className="material-icons text-[18px]">
                                                {isConnecting ? "sync" : stripeCreds ? "arrow_forward" : "payments"}
                                            </span>
                                            {isConnecting
                                                ? "Redirecting..."
                                                : stripeCreds
                                                    ? "Continue in Stripe"
                                                    : "Connect Stripe"}
                                        </button>
                                        {stripeCreds && (
                                            <button
                                                onClick={handleCheckProgress}
                                                disabled={isCheckingStatus}
                                                className="flex items-center justify-center gap-2 bg-white/5 text-white font-semibold text-sm px-5 py-3 rounded-xl hover:bg-white/10 transition-colors cursor-pointer border border-white/10 disabled:opacity-50"
                                            >
                                                <span className="material-icons text-[16px]">refresh</span>
                                                {isCheckingStatus ? "Checking..." : "Refresh Status"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* State C: No PSP chosen */}
                            {store && !store.pspProvider && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="material-icons text-yellow-400 text-[20px]">warning</span>
                                        <p className="text-text-grey text-sm">
                                            No payment provider connected yet.
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={handleConnectStripe}
                                            disabled={isConnecting}
                                            className="flex items-center justify-center gap-2 bg-primary text-black font-semibold text-sm px-5 py-3 rounded-xl hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                                        >
                                            <span className="material-icons text-[18px]">
                                                {isConnecting ? "sync" : "payments"}
                                            </span>
                                            {isConnecting ? "Connecting..." : "Connect Stripe"}
                                        </button>
                                        <div className="flex items-center justify-center gap-2 bg-white/5 text-text-grey font-semibold text-sm px-5 py-3 rounded-xl cursor-not-allowed border border-white/5 opacity-50">
                                            <span className="material-icons text-[18px]">account_balance_wallet</span>
                                            Mercado Pago
                                            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full ml-1">Soon</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {pspError && <p className="text-red-400 text-sm">{pspError}</p>}
                        </section>

                        {/* Fee Configuration */}
                        <section className="bg-surface-dark border border-white/5 rounded-2xl p-6 space-y-5">
                            <div>
                                <h3 className="text-white font-semibold text-base">Fee Configuration</h3>
                                <p className="text-text-grey text-sm mt-0.5">
                                    Set fee distribution for every transaction.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs text-text-grey uppercase tracking-widest font-semibold">
                                        Your Platform Fee (%)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            max="50"
                                            step="0.1"
                                            value={wlFee}
                                            onChange={(e) => setWlFee(e.target.value)}
                                            placeholder="e.g. 10"
                                            className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-grey/40 focus:outline-none focus:border-primary/50 transition-colors"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-grey text-sm">%</span>
                                    </div>
                                    <p className="text-xs text-text-grey">Your cut from every seller transaction.</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs text-text-grey uppercase tracking-widest font-semibold">
                                        Triadpay Fee (%)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            max="20"
                                            step="0.1"
                                            value={platformFee}
                                            onChange={(e) => setPlatformFee(e.target.value)}
                                            placeholder="e.g. 5"
                                            className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-grey/40 focus:outline-none focus:border-primary/50 transition-colors"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-grey text-sm">%</span>
                                    </div>
                                    <p className="text-xs text-text-grey">Infrastructure fee — shown for reference.</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs text-text-grey uppercase tracking-widest font-semibold">
                                        Default Affiliate Commission (%)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            max="80"
                                            step="0.1"
                                            value={affiliateFee}
                                            onChange={(e) => setAffiliateFee(e.target.value)}
                                            placeholder="e.g. 30"
                                            className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-grey/40 focus:outline-none focus:border-primary/50 transition-colors"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-grey text-sm">%</span>
                                    </div>
                                    <p className="text-xs text-text-grey">Applied when sellers create affiliate links.</p>
                                </div>
                            </div>

                            {feeError && <p className="text-red-400 text-sm">{feeError}</p>}
                            {feeSaved && <p className="text-green-400 text-sm">Fee settings saved.</p>}

                            <button
                                onClick={handleSaveFees}
                                disabled={feeSaving}
                                className="flex items-center gap-2 bg-primary text-black font-semibold text-sm px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                            >
                                <span className="material-icons text-[16px]">
                                    {feeSaving ? "sync" : "save"}
                                </span>
                                {feeSaving ? "Saving..." : "Save Fees"}
                            </button>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}
