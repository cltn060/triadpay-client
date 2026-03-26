"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { TopNav, PspWarning } from "@/components/dashboard";
import { useUser } from "@clerk/nextjs";

const ONBOARDING_STEPS = [
    { key: "profile", label: "Complete Profile", icon: "person", description: "Add your display name and bio" },
    { key: "psp", label: "Connect Payment", icon: "account_balance", description: "Link Stripe to receive commissions" },
    { key: "links", label: "Generate First Link", icon: "link", description: "Get your first tracking link" },
    { key: "share", label: "Share a Link", icon: "share", description: "Post your link on social media" },
];

type OnboardingStatus = {
    profileCompleted: boolean;
    pspConnected: boolean;
    hasGeneratedLink: boolean;
    hasSharedLink: boolean;
    completedAt?: string;
};

export default function AffiliateSettingsPage() {
    const { user } = useUser();
    const paymentStatus = useQuery(api.paymentsHelpers.getAffiliatePaymentStatus);
    const memberships = useQuery(api.memberships.getMyMemberships);
    const storeGroups = useQuery(api.affiliates.getMyProductLinks);
    const updateProfile = useMutation(api.memberships.updateAffiliateProfile);
    const checkStripeStatus = useAction(api.stripeActions.checkAffiliateStripeStatus);

    const [displayName, setDisplayName] = useState("");
    const [bio, setBio] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [notifyOnSale, setNotifyOnSale] = useState(true);
    const [notifyOnApproval, setNotifyOnApproval] = useState(true);
    const [autoGenerateLinks, setAutoGenerateLinks] = useState(false);

    // Derive onboarding progress
    const hasProfile = !!(displayName && displayName.length > 2);
    const hasPsp = paymentStatus?.connectedProviders?.some((p) => p.onboardingCompleted) ?? false;
    const hasLinks = (storeGroups?.flatMap((g) => g.products).length ?? 0) > 0;
    const hasApprovedMembership = memberships?.some((m) => m.status === "APPROVED") ?? false;

    const onboardingProgress = [hasProfile, hasPsp, hasLinks, false].filter(Boolean).length;
    const onboardingTotal = ONBOARDING_STEPS.length;
    const progressPercent = Math.round((onboardingProgress / onboardingTotal) * 100);

    // Load user profile on mount
    useEffect(() => {
        if (user) {
            setDisplayName(user.fullName || user.firstName || "");
            setBio((user.unsafeMetadata?.bio as string) || "");
        }
    }, [user]);

    const handleSaveProfile = useCallback(async () => {
        if (!displayName.trim()) return;
        setSaving(true);
        try {
            await updateProfile({
                displayName: displayName.trim(),
                bio: bio.trim(),
                notifyOnSale,
                notifyOnApproval,
                autoGenerateLinks,
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error("[settings] Failed to update profile:", err);
        } finally {
            setSaving(false);
        }
    }, [displayName, bio, notifyOnSale, notifyOnApproval, autoGenerateLinks, updateProfile]);

    return (
        <>
            <TopNav title="Settings" />
            <div className="p-8 w-full max-w-4xl space-y-8">
                <PspWarning type="affiliate" />

                {/* Onboarding Progress */}
                <div className="bg-surface-dark border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-bold text-white tracking-tight">Onboarding Progress</h2>
                            <p className="text-text-grey text-sm mt-0.5">
                                Complete these steps to start earning commissions
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-primary">{progressPercent}%</span>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 bg-white/5 rounded-full mb-6 overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>

                    {/* Steps */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {ONBOARDING_STEPS.map((step, i) => {
                            const completed = [hasProfile, hasPsp, hasLinks, false][i];
                            return (
                                <div
                                    key={step.key}
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                        completed
                                            ? "border-primary/20 bg-primary/5"
                                            : "border-white/5 bg-white/[0.02]"
                                    }`}
                                >
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                        completed ? "bg-primary/20" : "bg-white/5"
                                    }`}>
                                        <span className={`material-icons text-lg ${
                                            completed ? "text-primary" : "text-text-grey"
                                        }`}>
                                            {completed ? "check_circle" : step.icon}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${completed ? "text-primary" : "text-white"}`}>
                                            {step.label}
                                        </p>
                                        <p className="text-xs text-text-grey truncate">{step.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Profile Settings */}
                <div className="bg-surface-dark border border-white/5 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-white tracking-tight mb-1">Profile</h2>
                    <p className="text-text-grey text-sm mb-5">How sellers and customers see you</p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-text-grey mb-1.5">Display Name</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Your public name"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-text-grey/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-text-grey mb-1.5">Bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Tell sellers a bit about yourself and your audience..."
                                rows={3}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-text-grey/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Notification Preferences */}
                <div className="bg-surface-dark border border-white/5 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-white tracking-tight mb-1">Notifications</h2>
                    <p className="text-text-grey text-sm mb-5">Choose what you want to be notified about</p>

                    <div className="space-y-4">
                        <label className="flex items-center justify-between cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <span className="material-icons text-text-grey text-lg">notifications_active</span>
                                <div>
                                    <p className="text-sm text-white font-medium">Sale notifications</p>
                                    <p className="text-xs text-text-grey">Get notified when someone purchases through your link</p>
                                </div>
                            </div>
                            <div
                                onClick={() => setNotifyOnSale(!notifyOnSale)}
                                className={`w-11 h-6 rounded-full transition-colors cursor-pointer flex items-center ${
                                    notifyOnSale ? "bg-primary" : "bg-white/10"
                                }`}
                            >
                                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                                    notifyOnSale ? "translate-x-[22px]" : "translate-x-[2px]"
                                }`} />
                            </div>
                        </label>

                        <label className="flex items-center justify-between cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <span className="material-icons text-text-grey text-lg">how_to_reg</span>
                                <div>
                                    <p className="text-sm text-white font-medium">Approval updates</p>
                                    <p className="text-xs text-text-grey">Get notified when a seller approves or rejects your application</p>
                                </div>
                            </div>
                            <div
                                onClick={() => setNotifyOnApproval(!notifyOnApproval)}
                                className={`w-11 h-6 rounded-full transition-colors cursor-pointer flex items-center ${
                                    notifyOnApproval ? "bg-primary" : "bg-white/10"
                                }`}
                            >
                                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                                    notifyOnApproval ? "translate-x-[22px]" : "translate-x-[2px]"
                                }`} />
                            </div>
                        </label>

                        <label className="flex items-center justify-between cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <span className="material-icons text-text-grey text-lg">auto_fix_high</span>
                                <div>
                                    <p className="text-sm text-white font-medium">Auto-generate platform links</p>
                                    <p className="text-xs text-text-grey">Automatically create tracking links for all platforms when added to a product</p>
                                </div>
                            </div>
                            <div
                                onClick={() => setAutoGenerateLinks(!autoGenerateLinks)}
                                className={`w-11 h-6 rounded-full transition-colors cursor-pointer flex items-center ${
                                    autoGenerateLinks ? "bg-primary" : "bg-white/10"
                                }`}
                            >
                                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                                    autoGenerateLinks ? "translate-x-[22px]" : "translate-x-[2px]"
                                }`} />
                            </div>
                        </label>
                    </div>
                </div>

                {/* Account Info (read-only) */}
                <div className="bg-surface-dark border border-white/5 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-white tracking-tight mb-1">Account</h2>
                    <p className="text-text-grey text-sm mb-5">Your account information</p>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-white/5">
                            <span className="text-sm text-text-grey">Email</span>
                            <span className="text-sm text-white font-mono">
                                {user?.primaryEmailAddress?.emailAddress ?? "—"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-white/5">
                            <span className="text-sm text-text-grey">Role</span>
                            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                                AFFILIATE
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-white/5">
                            <span className="text-sm text-text-grey">Payment Provider</span>
                            <span className="text-sm text-white">
                                {hasPsp ? "Stripe (Connected)" : "Not connected"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-text-grey">Active Partnerships</span>
                            <span className="text-sm text-white font-mono">
                                {memberships?.filter((m) => m.status === "APPROVED").length ?? 0}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-end gap-3 pb-8">
                    {saved && (
                        <span className="flex items-center gap-1.5 text-primary text-sm font-medium">
                            <span className="material-icons text-sm">check_circle</span>
                            Settings saved
                        </span>
                    )}
                    <button
                        onClick={handleSaveProfile}
                        disabled={saving || !displayName.trim()}
                        className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                            saving || !displayName.trim()
                                ? "bg-white/5 text-text-grey cursor-not-allowed"
                                : "bg-primary text-black hover:bg-primary/90 active:scale-95 cursor-pointer"
                        }`}
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </>
    );
}
