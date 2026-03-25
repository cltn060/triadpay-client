"use client";

import { useState, Suspense } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function AffiliateSignUpPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
            <AffiliateSignUpContent />
        </Suspense>
    );
}

function AffiliateSignUpContent() {
    const { signUp, isLoaded, setActive } = useSignUp();
    const searchParams = useSearchParams();
    const router = useRouter();

    const storeSlug = searchParams.get("store") ?? "";
    const refSeller = searchParams.get("refSeller") ?? "";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Email verification state
    const [pendingVerification, setPendingVerification] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded || !signUp) return;

        setIsSubmitting(true);
        setError("");

        try {
            // Create the sign-up with unsafeMetadata injected
            await signUp.create({
                emailAddress: email,
                password,
                firstName,
                lastName,
                unsafeMetadata: {
                    role: "AFFILIATE",
                    ...(storeSlug ? { storeSlug } : {}),
                },
            });

            // Start email verification
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
            setPendingVerification(true);
        } catch (err: any) {
            const clerkError = err?.errors?.[0]?.longMessage || err?.message || "Sign-up failed. Please try again.";
            setError(clerkError);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded || !signUp) return;

        setIsSubmitting(true);
        setError("");

        try {
            const result = await signUp.attemptEmailAddressVerification({
                code: verificationCode,
            });

            if (result.status === "complete" && result.createdSessionId) {
                await setActive({ session: result.createdSessionId });
                // Route through /redirect on root domain — it resolves the correct subdomain + path
                router.push("/redirect");
            } else {
                setError("Verification incomplete. Please try again.");
            }
        } catch (err: any) {
            const clerkError = err?.errors?.[0]?.longMessage || err?.message || "Invalid code. Please try again.";
            setError(clerkError);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] font-sans p-6">
            {/* eslint-disable-next-line @next/next/no-page-custom-font */}
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0df20d]/10 border border-[#0df20d]/20 mb-4">
                        <span className="material-symbols-outlined text-[#0df20d] text-3xl">person_add</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        {pendingVerification ? "Verify Your Email" : "Affiliate Registration"}
                    </h1>
                    {storeSlug && !pendingVerification && (
                        <p className="text-gray-400 text-sm mt-2">
                            Applying to partner with{" "}
                            <span className="text-[#0df20d] font-bold">{storeSlug}</span>
                        </p>
                    )}
                    {pendingVerification && (
                        <p className="text-gray-400 text-sm mt-2">
                            We sent a code to <span className="text-white font-medium">{email}</span>
                        </p>
                    )}
                </div>

                {/* Card */}
                <div className="bg-[#121212] border border-[#2a2a2a] rounded-2xl p-8 shadow-2xl">

                    {/* Error */}
                    {error && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 flex items-start gap-3">
                            <span className="material-symbols-outlined text-red-400 text-lg flex-shrink-0 mt-0.5">error</span>
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {!pendingVerification ? (
                        /* --- Sign-Up Form --- */
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            {/* Name Fields */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 tracking-wider uppercase">First Name</label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                        className="w-full bg-[#050505] border border-[#2a2a2a] rounded-lg h-12 px-4 text-white text-sm focus:outline-none focus:border-[#0df20d] transition-colors"
                                        placeholder="John"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 tracking-wider uppercase">Last Name</label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                        className="w-full bg-[#050505] border border-[#2a2a2a] rounded-lg h-12 px-4 text-white text-sm focus:outline-none focus:border-[#0df20d] transition-colors"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 tracking-wider uppercase">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-[#050505] border border-[#2a2a2a] rounded-lg h-12 px-4 text-white text-sm focus:outline-none focus:border-[#0df20d] transition-colors"
                                    placeholder="you@example.com"
                                />
                            </div>

                            {/* Password */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 tracking-wider uppercase">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    className="w-full bg-[#050505] border border-[#2a2a2a] rounded-lg h-12 px-4 text-white text-sm focus:outline-none focus:border-[#0df20d] transition-colors"
                                    placeholder="Min 8 characters"
                                />
                            </div>

                            {/* Clerk CAPTCHA mount point */}
                            <div id="clerk-captcha" />

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-12 rounded-lg bg-[#0df20d] text-black text-sm font-bold hover:shadow-[0_0_15px_rgba(13,242,13,0.5)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Creating account...
                                    </>
                                ) : (
                                    "Create Affiliate Account"
                                )}
                            </button>
                        </form>
                    ) : (
                        /* --- Verification Form --- */
                        <form onSubmit={handleVerify} className="flex flex-col gap-5">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 tracking-wider uppercase">Verification Code</label>
                                <input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    required
                                    className="w-full bg-[#050505] border border-[#2a2a2a] rounded-lg h-12 px-4 text-white text-sm text-center tracking-[0.5em] font-mono focus:outline-none focus:border-[#0df20d] transition-colors"
                                    placeholder="• • • • • •"
                                    maxLength={6}
                                    autoFocus
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting || verificationCode.length < 6}
                                className="w-full h-12 rounded-lg bg-[#0df20d] text-black text-sm font-bold hover:shadow-[0_0_15px_rgba(13,242,13,0.5)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isSubmitting ? "Verifying..." : "Verify & Continue"}
                            </button>
                        </form>
                    )}

                    {/* Footer */}
                    <div className="mt-6 pt-6 border-t border-[#2a2a2a] text-center">
                        <p className="text-gray-500 text-xs">
                            Already have an account?{" "}
                            <Link href="/sign-in" className="text-[#0df20d] hover:brightness-110 font-bold">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Secured by badge */}
                <div className="text-center mt-6">
                    <p className="text-gray-600 text-xs">
                        Secured by <span className="text-gray-400 font-bold">Caruma</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
