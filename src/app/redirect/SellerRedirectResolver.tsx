"use client";

import { useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";

/**
 * Client-side component that ensures the seller's Convex user + membership exist,
 * resolves their store slug, and redirects to the correct subdomain dashboard.
 * Uses Convex WebSocket (reliable) instead of server-side HTTP calls (which timeout on Vercel).
 */
export function SellerRedirectResolver({
    rootDomain,
    protocol,
    dashboardPath,
    inviteToken,
}: {
    rootDomain: string;
    protocol: string;
    dashboardPath: string;
    inviteToken?: string;
}) {
    const ensureSetup = useMutation(api.memberships.ensureSellerSetup);
    const [storeSlug, setStoreSlug] = useState<string | null | undefined>(undefined);

    useEffect(() => {
        ensureSetup({ inviteToken: inviteToken || undefined })
            .then((slug) => setStoreSlug(slug))
            .catch(() => setStoreSlug(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (storeSlug) {
            window.location.href = `${protocol}://${storeSlug}.${rootDomain}${dashboardPath}`;
        }
    }, [storeSlug, rootDomain, protocol, dashboardPath]);

    if (storeSlug === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505]">
                <div className="text-center max-w-md p-8">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                        <span className="material-icons text-red-400 text-3xl">error_outline</span>
                    </div>
                    <h2 className="text-white text-xl font-bold mb-2">No Store Found</h2>
                    <p className="text-gray-400 text-sm">
                        We couldn&apos;t find a store linked to your account. Please contact the store owner for a new invitation.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-[#0df20d] border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-sm">Redirecting to your dashboard...</p>
            </div>
        </div>
    );
}
