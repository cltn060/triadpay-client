"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { StoreContextProvider } from "@/providers/store-context";

export function StoreGate({
    domain,
    children,
}: {
    domain: string;
    children: React.ReactNode;
}) {
    // Root domain ("default") — no store scope, pass through
    if (domain === "default") {
        return (
            <StoreContextProvider store={null} domain={domain}>
                {children}
            </StoreContextProvider>
        );
    }

    return (
        <StoreGateInner domain={domain}>
            {children}
        </StoreGateInner>
    );
}

function StoreGateInner({
    domain,
    children,
}: {
    domain: string;
    children: React.ReactNode;
}) {
    const store = useQuery(api.stores.getStoreBySlug, { slug: domain });

    // Loading
    if (store === undefined) {
        return (
            <div className="flex items-center justify-center h-screen bg-background-dark">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-text-grey text-sm">Loading store...</p>
                </div>
            </div>
        );
    }

    // Store not found — 404
    if (store === null) {
        return (
            <div className="flex items-center justify-center h-screen bg-background-dark">
                <div className="max-w-md text-center p-8">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                        <span className="material-icons text-red-400 text-3xl">storefront</span>
                    </div>
                    <h2 className="text-white text-xl font-bold mb-2">Store Not Found</h2>
                    <p className="text-text-grey text-sm leading-relaxed">
                        The store &ldquo;{domain}&rdquo; doesn&apos;t exist. Please check the URL and try again.
                    </p>
                </div>
            </div>
        );
    }

    // Store found — provide via context
    return (
        <StoreContextProvider store={store} domain={domain}>
            {children}
        </StoreContextProvider>
    );
}
