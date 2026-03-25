"use client";

import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";

export function MembershipGate({
    storeSlug,
    children,
}: {
    storeSlug: string;
    children: React.ReactNode;
}) {
    const membership = useQuery(api.memberships.getMembershipForStore, { storeSlug });

    // Grace period for webhook processing — when membership is null,
    // the Clerk webhook may not have created the membership yet.
    // Convex queries are reactive, so once the webhook processes,
    // this component will re-render automatically.
    const [graceExpired, setGraceExpired] = useState(false);
    useEffect(() => {
        if (membership === null) {
            const timer = setTimeout(() => setGraceExpired(true), 15000);
            return () => clearTimeout(timer);
        }
        // Reset grace if membership appears
        setGraceExpired(false);
    }, [membership]);

    // Loading (initial query still in flight)
    if (membership === undefined) {
        return (
            <div className="flex items-center justify-center h-screen bg-background-dark">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-text-grey text-sm">Verifying access...</p>
                </div>
            </div>
        );
    }

    // SUPER_ADMIN always passes
    if (membership?.role === "SUPER_ADMIN") {
        return <>{children}</>;
    }

    // Approved members pass
    if (membership?.status === "APPROVED") {
        return <>{children}</>;
    }

    // Pending approval — show the actual dashboard blurred with an overlay banner
    if (membership?.status === "PENDING") {
        return (
            <div className="relative h-screen overflow-hidden">
                {/* Render the real dashboard behind the blur */}
                <div className="pointer-events-none select-none" style={{ filter: "blur(6px) brightness(0.4)" }}>
                    {children}
                </div>

                {/* Overlay banner */}
                <div className="absolute inset-0 flex items-center justify-center z-50">
                    <div className="max-w-lg text-center p-10 bg-surface-dark/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-sm">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                            <span className="material-icons text-amber-400 text-3xl">hourglass_empty</span>
                        </div>
                        <h2 className="text-white text-xl font-bold mb-3">Pending Approval</h2>
                        <p className="text-text-grey text-sm leading-relaxed mb-4">
                            Your seller account is being reviewed by the store owner. You&apos;ll be able to add products
                            and manage your dashboard once your request has been approved.
                        </p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
                            <span className="material-icons text-amber-400 text-[16px]">info</span>
                            <span className="text-amber-400 text-xs font-medium">This page will update automatically once approved</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // No membership yet — webhook may still be processing.
    // Show a "setting up" screen while we wait. Convex reactive queries
    // will auto-update when the webhook creates the membership.
    if (membership === null && !graceExpired) {
        return (
            <div className="flex items-center justify-center h-screen bg-background-dark">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-text-grey text-sm">Setting up your account...</p>
                    <p className="text-text-grey/60 text-xs">This may take a few seconds</p>
                </div>
            </div>
        );
    }

    // Rejected or no membership (after grace period)
    return (
        <div className="flex items-center justify-center h-screen bg-background-dark">
            <div className="max-w-md text-center p-8">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                    <span className="material-icons text-red-400 text-3xl">block</span>
                </div>
                <h2 className="text-white text-xl font-bold mb-2">Access Denied</h2>
                <p className="text-text-grey text-sm leading-relaxed">
                    {membership?.status === "REJECTED"
                        ? "Your membership request was declined by the store owner."
                        : "You don't have access to this store. Please contact the store owner."}
                </p>
            </div>
        </div>
    );
}
