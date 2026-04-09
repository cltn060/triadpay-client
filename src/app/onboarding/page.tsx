"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/utils";

const DEFAULT_COLOR = "#0df20d";

export default function OnboardingPage() {
    const { user, isLoaded: isClerkLoaded } = useUser();
    const router = useRouter();

    // ── All hooks MUST be declared before any early returns ────────
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [companyName, setCompanyName] = useState("");
    const [storeSlug, setStoreSlug] = useState("");
    const [themeColor, setThemeColor] = useState(DEFAULT_COLOR);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
    const [logoStorageId, setLogoStorageId] = useState<Id<"_storage"> | null>(null);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const [selectedPsp, setSelectedPsp] = useState<"STRIPE" | null>(null);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const updateStoreDetails = useMutation(api.users.updateStoreDetails);
    const generateLogoUploadUrl = useMutation(api.stores.generateLogoUploadUrl);

    // ── Role Guard: only WL Owners can access onboarding ─────────
    if (isClerkLoaded && user) {
        const role = user.unsafeMetadata?.role as string | undefined;
        if (role && role !== "WL_OWNER") {
            const redirect = role === "AFFILIATE" ? "/portal" : "/seller";
            router.replace(redirect);
            return null;
        }
    }

    if (!isClerkLoaded) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="animate-pulse text-[#0df20d] flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#0df20d] flex items-center justify-center text-black font-bold text-lg">T</div>
                    <span className="text-sm font-medium text-gray-400">Loading...</span>
                </div>
            </div>
        );
    }


    // ── Handlers ───────────────────────────────────────────────────
    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = e.target.value
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "")
            .replace(/-+/g, "-");
        setStoreSlug(formatted);
        setError("");
    };

    const handleStep1Submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!companyName || !storeSlug) {
            setError("Please fill out all fields.");
            return;
        }
        setError("");
        setStep(2);
    };

    const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setError("Please upload a PNG or image file.");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setError("Logo must be under 2MB.");
            return;
        }
        setError("");
        setLogoFile(file);
        setLogoPreviewUrl(URL.createObjectURL(file));

        // Upload immediately
        setIsUploadingLogo(true);
        try {
            const uploadUrl = await generateLogoUploadUrl();
            const result = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            const { storageId } = await result.json();
            setLogoStorageId(storageId);
        } catch (err) {
            console.error("Logo upload failed:", err);
            setError("Logo upload failed. You can try again or skip.");
            setLogoFile(null);
            setLogoPreviewUrl(null);
        } finally {
            setIsUploadingLogo(false);
        }
    };

    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            await updateStoreDetails({
                storeName: companyName,
                storeSlug: storeSlug,
                logoStorageId: logoStorageId ?? undefined,
                themeColor: themeColor !== DEFAULT_COLOR ? themeColor : undefined,
                pspProvider: selectedPsp ?? undefined,
            });

            // ── Stamp WL Owner role in Clerk metadata ───────────────────
            // This allows the traffic cop (dashboard/page.tsx) to instantly
            // route this user to the WL Owner dashboard on every future login,
            // without needing a Convex DB query on each page load.
            await user?.update({
                unsafeMetadata: {
                    ...user.unsafeMetadata,
                    dashboardRole: "WL_OWNER",
                    storeSlug: storeSlug,
                },
            });

            const isMultiTenant = process.env.NEXT_PUBLIC_MULTI_TENANT === "true";
            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
            const protocol = window.location.protocol;

            if (isMultiTenant) {
                window.location.href = `${protocol}//${storeSlug}.${rootDomain}/dashboard`;
            } else {
                window.location.href = `/dashboard`;
            }
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            setIsSubmitting(false);
        }

    };

    return (
        <div className="bg-[#050505] text-white font-sans h-screen flex flex-col items-center justify-center relative selection:bg-[#0df20d] selection:text-black">
            {/* Grid Background */}
            <div
                className="fixed inset-0 pointer-events-none z-0"
                style={{
                    backgroundSize: "40px 40px",
                    backgroundImage: "linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)"
                }}
            />

            <main className="relative z-10 w-full max-w-md px-6">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-[#0df20d] flex items-center justify-center text-black font-bold text-lg">T</div>
                        <span className="font-bold text-xl tracking-tight text-white">Triadpay</span>
                    </div>
                </div>

                {/* Progress dots */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 1 ? "w-8 bg-[#0df20d]" : "w-8 bg-[#0df20d]/40"}`} />
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 2 ? "w-8 bg-[#0df20d]" : step > 2 ? "w-8 bg-[#0df20d]/40" : "w-4 bg-white/20"}`} />
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 3 ? "w-8 bg-[#0df20d]" : "w-4 bg-white/20"}`} />
                </div>

                {/* Form Card */}
                <div className="rounded-2xl p-8 shadow-2xl w-full border border-white/10 backdrop-blur-md bg-[#121212]/60">

                    {/* ── Step 1: Workspace ── */}
                    {step === 1 && (
                        <>
                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-bold text-white mb-2">Set up your workspace</h1>
                                <p className="text-gray-400 text-sm">What should we call your white-label platform?</p>
                            </div>

                            <form className="space-y-6" onSubmit={handleStep1Submit}>
                                <div className="space-y-2">
                                    <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 pl-1" htmlFor="companyName">
                                        Company Name
                                    </label>
                                    <input
                                        id="companyName"
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="e.g. Acme Corp"
                                        className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-[#0df20d] focus:border-[#0df20d] transition-all text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 pl-1" htmlFor="workspaceUrl">
                                        Workspace URL
                                    </label>
                                    <div className="flex items-center w-full bg-[#121212] border border-[#2a2a2a] rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-[#0df20d] focus-within:border-[#0df20d] transition-all">
                                        <span className="pl-4 pr-1 py-3 text-gray-500 text-sm select-none">pay.</span>
                                        <input
                                            id="workspaceUrl"
                                            type="text"
                                            value={storeSlug}
                                            onChange={handleSlugChange}
                                            placeholder="your-slug"
                                            className="flex-1 bg-[#121212] border-none p-0 text-white placeholder-gray-600 focus:ring-0 text-sm h-full outline-none py-3"
                                        />
                                        <span className="pr-4 pl-1 py-3 text-gray-500 text-sm select-none">.triadpay.com</span>
                                    </div>
                                </div>

                                {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}

                                <div className="h-2" />

                                <button
                                    type="submit"
                                    className="w-full bg-[#0df20d] hover:bg-[#0df20d]/90 text-black font-bold py-3.5 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(13,242,13,0.2)] hover:shadow-[0_0_25px_rgba(13,242,13,0.4)] flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    Continue →
                                </button>
                            </form>
                        </>
                    )}

                    {/* ── Step 2: Branding ── */}
                    {step === 2 && (
                        <>
                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-bold text-white mb-2">Brand your platform</h1>
                                <p className="text-gray-400 text-sm">Add your logo and pick your accent color. (Optional — you can set these later.)</p>
                            </div>

                            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
                                {/* Logo Upload */}
                                <div className="space-y-2">
                                    <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 pl-1">
                                        Platform Logo
                                    </label>
                                    <input
                                        ref={logoInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleLogoSelect}
                                    />
                                    <div
                                        onClick={() => logoInputRef.current?.click()}
                                        className="group flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#2a2a2a] bg-[#0a0a0a] py-8 hover:border-[#0df20d]/40 hover:bg-[#0d0d0d] cursor-pointer transition-all"
                                    >
                                        {logoPreviewUrl ? (
                                            <div className="flex flex-col items-center gap-2">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={logoPreviewUrl} alt="Logo preview" className="h-16 object-contain rounded" />
                                                <span className="text-xs text-gray-400">{logoFile?.name}</span>
                                                {isUploadingLogo && <span className="text-xs text-[#0df20d] animate-pulse">Uploading…</span>}
                                                {!isUploadingLogo && logoStorageId && <span className="text-xs text-[#0df20d]">✓ Uploaded</span>}
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                                                    <span className="material-icons text-gray-400">cloud_upload</span>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm text-white font-medium">Click to upload logo</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">PNG recommended · max 2MB</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Color Picker */}
                                <div className="space-y-2">
                                    <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 pl-1">
                                        Accent Color
                                    </label>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0a0a0a] border border-[#2a2a2a]">
                                        <input
                                            type="color"
                                            value={themeColor}
                                            onChange={(e) => setThemeColor(e.target.value)}
                                            className="cursor-pointer w-10 h-10 rounded-full border-0 p-0 flex-shrink-0"
                                            style={{ WebkitAppearance: "none", overflow: "hidden", borderRadius: "50%" }}
                                        />
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={themeColor.toUpperCase()}
                                                onChange={(e) => setThemeColor(e.target.value)}
                                                className="w-full bg-transparent border-none text-white font-mono uppercase text-sm focus:outline-none focus:ring-0 p-0"
                                            />
                                        </div>
                                        {/* Live preview */}
                                        <div
                                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-black transition-all"
                                            style={{ backgroundColor: themeColor }}
                                        >
                                            Preview
                                        </div>
                                        {themeColor !== DEFAULT_COLOR && (
                                            <button
                                                type="button"
                                                onClick={() => setThemeColor(DEFAULT_COLOR)}
                                                className="text-xs text-gray-500 hover:text-white transition-colors"
                                            >
                                                Reset
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}

                                <div className="h-1" />

                                <button
                                    type="submit"
                                    disabled={isUploadingLogo}
                                    className="w-full font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(13,242,13,0.2)] hover:shadow-[0_0_25px_rgba(13,242,13,0.35)]"
                                    style={{ backgroundColor: themeColor, color: "black" }}
                                >
                                    Continue →
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="w-full text-gray-500 text-sm hover:text-white transition-colors py-1 cursor-pointer"
                                >
                                    ← Back
                                </button>
                            </form>
                        </>
                    )}
                    {/* ── Step 3: Payment Provider ── */}
                    {step === 3 && (
                        <>
                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-bold text-white mb-2">Choose your payment provider</h1>
                                <p className="text-gray-400 text-sm">How will your platform process payments?</p>
                            </div>

                            <form className="space-y-6" onSubmit={handleFinalSubmit}>
                                <div className="space-y-3">
                                    {/* Stripe Card */}
                                    <button
                                        type="button"
                                        onClick={() => setSelectedPsp("STRIPE")}
                                        className={`w-full text-left rounded-xl border-2 p-5 transition-all ${selectedPsp === "STRIPE"
                                                ? "border-[#0df20d] bg-[#0df20d]/5"
                                                : "border-[#2a2a2a] bg-[#0a0a0a] hover:border-[#0df20d]/40"
                                            } cursor-pointer`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selectedPsp === "STRIPE" ? "border-[#0df20d]" : "border-gray-600"
                                                }`}>
                                                {selectedPsp === "STRIPE" && (
                                                    <div className="w-2.5 h-2.5 rounded-full bg-[#0df20d]" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-white font-bold text-base">Stripe</h3>
                                                <p className="text-gray-400 text-xs mt-0.5">Global payments · High reliability · Automatic payouts</p>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Mercado Pago Card — Coming Soon */}
                                    <div className="w-full text-left rounded-xl border-2 border-[#2a2a2a] bg-[#0a0a0a] p-5 opacity-50 relative overflow-hidden cursor-not-allowed">
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full border-2 border-gray-600 flex-shrink-0" />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-white font-bold text-base">Mercado Pago</h3>
                                                    <span className="text-[10px] uppercase tracking-wider bg-white/10 text-gray-400 px-2 py-0.5 rounded-full font-semibold">Coming Soon</span>
                                                </div>
                                                <p className="text-gray-400 text-xs mt-0.5">Latin America · Instant payouts · Local payment methods</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}

                                <div className="h-1" />

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !selectedPsp}
                                    className="w-full bg-[#0df20d] hover:bg-[#0df20d]/90 text-black font-bold py-3.5 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(13,242,13,0.2)] hover:shadow-[0_0_25px_rgba(13,242,13,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? "Launching…" : "Launch Platform →"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="w-full text-gray-500 text-sm hover:text-white transition-colors py-1 cursor-pointer"
                                >
                                    ← Back
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
