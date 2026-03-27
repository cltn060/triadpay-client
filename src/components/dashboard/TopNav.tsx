"use client";

import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/marketing/LanguageSwitcher";
import { NotificationsPanel } from "./NotificationsPanel";
import { useNotifications } from "@/hooks/useNotifications";
import { useState, useEffect, useRef, useCallback } from "react";

interface TopNavProps {
    title: string;
    /** The authenticated user's Convex userId (or null while loading). */
    userId?: string | null;
}

export function TopNav({ title, userId }: TopNavProps) {
    const t = useTranslations("DashboardTopNav");
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1024);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllRead,
    } = useNotifications({ userId: userId ?? null });

    // --- Search state ---
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const debounceRef = useRef<number | null>(null);

    const fetchResults = useCallback(async (q: string) => {
        if (!q || q.trim().length === 0) {
            setResults([]);
            setIsSearching(false);
            return;
        }
        setIsSearching(true);
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
            if (res.ok) {
                const json = await res.json();
                setResults(Array.isArray(json) ? json : []);
            } else {
                setResults([]);
            }
        } catch (e) {
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const handleQueryChange = (v: string) => {
        setQuery(v);
        if (debounceRef.current) window.clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(() => fetchResults(v), 300);
    };

    return (
        <header
            className="sticky top-0 z-30 bg-background-dark/95 backdrop-blur-md border-b border-white/5"
            style={{ padding: isMobile ? "12px 16px" : "20px 32px" }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-text-grey" style={{ minWidth: 0 }}>
                    {!isMobile && (
                        <>
                            <span>{t("dashboard")}</span>
                            <span className="material-icons text-[14px]">chevron_right</span>
                        </>
                    )}
                    <span className="text-white truncate">{title}</span>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "8px" : "16px", flexShrink: 0 }}>
                    {/* Search — hidden on mobile */}
                    {!isMobile && (
                        <div className="relative group">
                            <span className="material-icons absolute left-3 top-2.5 text-slate-500 group-focus-within:text-white transition-colors">
                                search
                            </span>
                            <div className="relative">
                                <input
                                    value={query}
                                    onChange={(e) => handleQueryChange(e.target.value)}
                                    className="bg-surface-dark border border-white/5 rounded-full py-2 pl-10 pr-4 text-sm w-64 text-white focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all placeholder-slate-600"
                                    placeholder={t("searchPlaceholder")}
                                    type="text"
                                    aria-label={t("searchPlaceholder")}
                                />

                                {/* Results dropdown */}
                                {results.length > 0 && (
                                    <div className="absolute left-0 mt-2 w-64 bg-surface-dark border border-white/10 rounded-lg shadow-lg z-40 overflow-hidden">
                                        {results.map((r, idx) => (
                                            <a
                                                key={idx}
                                                href={r.href ?? "#"}
                                                className="block px-3 py-2 text-sm text-white hover:bg-white/5"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="truncate mr-2">{r.title ?? r.name ?? r.label}</div>
                                                    {r.price && <div className="text-text-grey text-xs">{r.price}</div>}
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                )}
                                {isSearching && <div className="absolute left-3 top-2.5 text-slate-400 text-xs">…</div>}
                            </div>
                        </div>
                    )}

                    {/* Notifications */}
                    <NotificationsPanel
                        notifications={notifications}
                        unreadCount={unreadCount}
                        isLoading={isLoading}
                        onMarkAsRead={markAsRead}
                        onMarkAllAsRead={markAllAsRead}
                        onDelete={deleteNotification}
                        onClearAllRead={clearAllRead}
                    />

                    {/* Language Switcher */}
                    <div style={{ borderLeft: "1px solid rgba(255,255,255,0.05)", paddingLeft: isMobile ? "8px" : "16px", marginLeft: "4px" }}>
                        <LanguageSwitcher />
                    </div>
                </div>
            </div>
        </header>
    );
}
