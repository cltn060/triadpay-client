"use client";

import { useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";

/**
 * Client-side component that ensures the affiliate's Convex user + membership exist,
 * resolves their store slug, and redirects to the correct subdomain portal.
 */
export function AffiliateRedirectResolver({
    rootDomain,
    protocol,
    storeSlug,
}: {
    rootDomain: string;
    protocol: string;
    storeSlug?: string;
}) {
    const ensureSetup = useMutation(api.memberships.ensureAffiliateSetup);
    const [resolvedSlug, setResolvedSlug] = useState<string | null | undefined>(undefined);

    useEffect(() => {
        ensureSetup({ storeSlug: storeSlug || undefined })
            .then((slug) => setResolvedSlug(slug))
            .catch(() => setResolvedSlug(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (resolvedSlug) {
            window.location.href = `${protocol}://${resolvedSlug}.${rootDomain}/portal`;
        }
    }, [resolvedSlug, rootDomain, protocol]);

    if (resolvedSlug === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505]">
                <div className="text-center max-w-md p-8">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                        <span className="material-icons text-red-400 text-3xl">error_outline</span>
                    </div>
                    <h2 className="text-white text-xl font-bold mb-2">No Store Found</h2>
                    <p className="text-gray-400 text-sm">
                        We couldn&apos;t find a store linked to your account. Please contact the seller for a new invitation link.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-[#0df20d] border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-sm">Redirecting to your portal...</p>
            </div>
        </div>
    );
}
