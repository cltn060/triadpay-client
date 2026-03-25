"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Doc } from "../../convex/_generated/dataModel";

interface StoreContextValue {
    store: Doc<"stores"> | null;
    domain: string;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreContextProvider({
    store,
    domain,
    children,
}: StoreContextValue & { children: ReactNode }) {
    return (
        <StoreContext.Provider value={{ store, domain }}>
            {children}
        </StoreContext.Provider>
    );
}

export function useStoreContext(): StoreContextValue {
    const ctx = useContext(StoreContext);
    if (!ctx) {
        throw new Error("useStoreContext must be used within a StoreContextProvider");
    }
    return ctx;
}
