"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ThemeToggle } from "../ThemeToggle";

const SidebarContext = createContext<{ closeSidebar: () => void }>({
    closeSidebar: () => {},
});

/** Call this inside sidebar nav links to close the drawer on mobile */
export function useSidebarClose() {
    return useContext(SidebarContext).closeSidebar;
}

/**
 * Shared responsive dashboard shell.
 * Desktop: fixed sidebar + scrollable main content.
 * Mobile (<1024px): hamburger menu + slide-out drawer with backdrop overlay.
 */
export function DashboardShell({
    sidebar,
    children,
}: {
    sidebar: React.ReactNode;
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (!mobile) setSidebarOpen(false);
        };
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const closeSidebar = useCallback(() => setSidebarOpen(false), []);

    return (
        <SidebarContext.Provider value={{ closeSidebar }}>
            <div className="flex h-screen overflow-hidden bg-background-dark text-text-grey font-sans antialiased selection:bg-primary selection:text-black">
                {isMobile && (
                    <div className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-[#090909]/95 px-4 backdrop-blur-xl">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-white transition hover:bg-white/10"
                                aria-label="Open menu"
                            >
                                <span className="material-icons text-xl">menu</span>
                            </button>
                            <div>
                                <p className="text-sm font-semibold text-white">Caruma</p>
                                <p className="text-xs uppercase tracking-[0.35em] text-text-grey">Dashboard</p>
                            </div>
                        </div>
                        <ThemeToggle />
                    </div>
                )}

                {isMobile && sidebarOpen && (
                    <div className="fixed inset-0 z-40 bg-black/60" onClick={closeSidebar} />
                )}

                <div
                    className={`fixed inset-y-0 left-0 z-50 w-[280px] transition-transform duration-300 ease-out lg:relative lg:translate-x-0 ${isMobile ? (sidebarOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}`}
                >
                    {sidebar}
                </div>

                <main className="relative ml-0 flex-1 overflow-y-auto pb-10 pt-0 lg:ml-[280px]">
                    <div className="absolute inset-0 bg-grid-pattern-dark opacity-5 pointer-events-none" />
                    <div className="relative min-h-full px-4 py-20 sm:px-6 lg:px-10">
                        {children}
                    </div>
                </main>
            </div>
        </SidebarContext.Provider>
    );
}
