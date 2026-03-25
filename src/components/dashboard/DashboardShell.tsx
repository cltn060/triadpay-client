"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

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
            <div
                className="bg-background-dark text-text-grey font-sans antialiased selection:bg-primary selection:text-black"
                style={{ display: "flex", height: "100vh", overflow: "hidden" }}
            >
                {/* ── Mobile top bar ──────────────────────────────────── */}
                {isMobile && (
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 56,
                            zIndex: 40,
                            display: "flex",
                            alignItems: "center",
                            padding: "0 16px",
                            borderBottom: "1px solid rgba(255,255,255,0.05)",
                        }}
                        className="bg-background-dark"
                    >
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="text-white cursor-pointer p-1"
                            aria-label="Open menu"
                        >
                            <span className="material-icons text-[24px]">menu</span>
                        </button>
                    </div>
                )}

                {/* ── Backdrop overlay ────────────────────────────────── */}
                {isMobile && sidebarOpen && (
                    <div
                        onClick={closeSidebar}
                        style={{
                            position: "fixed",
                            inset: 0,
                            backgroundColor: "rgba(0,0,0,0.6)",
                            zIndex: 45,
                            cursor: "pointer",
                        }}
                    />
                )}

                {/* ── Sidebar wrapper ─────────────────────────────────── */}
                <div
                    style={{
                        position: isMobile ? "fixed" : "relative",
                        top: 0,
                        left: 0,
                        bottom: 0,
                        transform:
                            isMobile && !sidebarOpen
                                ? "translateX(-100%)"
                                : "translateX(0)",
                        transition: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                        zIndex: isMobile ? 50 : 20,
                        flexShrink: 0,
                    }}
                >
                    {sidebar}
                </div>

                {/* ── Main content ────────────────────────────────────── */}
                <main
                    className="bg-background-dark"
                    style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        position: "relative",
                        overflowY: "auto",
                        paddingTop: isMobile ? 56 : 0,
                    }}
                >
                    <div className="absolute inset-0 bg-grid-pattern-dark opacity-5 pointer-events-none z-0" />
                    {children}
                </main>
            </div>
        </SidebarContext.Provider>
    );
}
