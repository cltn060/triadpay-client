"use client";

import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/marketing/LanguageSwitcher";
import { NotificationsPanel } from "./NotificationsPanel";
import { useNotifications } from "@/hooks/useNotifications";
import { useState, useEffect } from "react";

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
                            <input
                                className="bg-surface-dark border border-white/5 rounded-full py-2 pl-10 pr-4 text-sm w-64 text-white focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all placeholder-slate-600"
                                placeholder={t("searchPlaceholder")}
                                type="text"
                            />
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
