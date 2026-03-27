"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { formatMoney } from "@/lib/currency";
import { useTranslations } from "next-intl";
import type { Notification, NotificationType } from "@/types/notifications";

// ---------------------------------------------------------------------------
// Icon map — returns a material-icon name + a Tailwind colour class
// ---------------------------------------------------------------------------
function getNotificationIcon(type: NotificationType): { icon: string; colour: string } {
    switch (type) {
        case "sale":
            return { icon: "shopping_cart", colour: "text-green-400" };
        case "affiliate_approved":
            return { icon: "verified", colour: "text-primary" };
        case "affiliate_rejected":
            return { icon: "cancel", colour: "text-red-400" };
        case "payout_sent":
            return { icon: "payments", colour: "text-green-400" };
        case "payout_failed":
            return { icon: "error_outline", colour: "text-red-400" };
        case "new_affiliate":
            return { icon: "person_add", colour: "text-blue-400" };
        case "product_approved":
            return { icon: "check_circle", colour: "text-green-400" };
        case "product_rejected":
            return { icon: "unpublished", colour: "text-red-400" };
        case "system":
            return { icon: "info", colour: "text-yellow-400" };
        case "welcome":
        default:
            return { icon: "waving_hand", colour: "text-primary" };
    }
}

// ---------------------------------------------------------------------------
// Relative time helper
// ---------------------------------------------------------------------------
function relativeTime(timestamp: number): string {
    const diffMs = Date.now() - timestamp;
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return "just now";
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(timestamp).toLocaleDateString();
}

// ---------------------------------------------------------------------------
// Single notification row
// ---------------------------------------------------------------------------
interface NotificationItemProps {
    notification: Notification;
    onRead: (id: string) => void;
    onDelete: (id: string) => void;
}

function NotificationItem({ notification, onRead, onDelete }: NotificationItemProps) {
    const { icon, colour } = getNotificationIcon(notification.type);
    const [hovered, setHovered] = useState(false);

    const handleRead = useCallback(() => {
        if (!notification.read) {
            onRead(notification._id);
        }
    }, [notification, onRead]);

    const handleDelete = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            onDelete(notification._id);
        },
        [notification._id, onDelete]
    );

    return (
        <div
            className={`relative px-4 py-3 border-b border-white/5 transition-colors cursor-pointer flex gap-3 items-start group ${
                notification.read ? "opacity-60" : "hover:bg-white/5"
            }`}
            onClick={handleRead}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Unread indicator */}
            {!notification.read && (
                <span className="absolute top-4 right-3 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
            )}

            {/* Icon */}
            <div
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-white/5`}
            >
                <span className={`material-icons text-[18px] ${colour}`}>{icon}</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium leading-snug truncate pr-4">
                    {notification.title}
                </p>
                <p className="text-xs text-text-grey mt-0.5 line-clamp-2">
                    {notification.message}
                </p>

                {/* Metadata pill row */}
                {notification.metadata?.amount && (
                    <div className="flex items-center gap-1 mt-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-medium">
                            <span className="material-icons text-[10px]">attach_money</span>
                            {
                                (() => {
                                    const raw = notification.metadata?.amount ?? 0;
                                    const currency = notification.metadata?.currency ?? "USD";
                                    const amountCents = raw > 10000 ? Number(raw) : Math.round(Number(raw) * 100);
                                    return formatMoney(amountCents, currency);
                                })()
                            }
                        </span>
                    </div>
                )}

                <p className="text-[10px] text-text-grey/60 mt-1">
                    {relativeTime(notification._creationTime)}
                </p>
            </div>

            {/* Delete button — shows on hover */}
            {hovered && (
                <button
                    onClick={handleDelete}
                    className="absolute top-2.5 right-4 text-text-grey hover:text-red-400 transition-colors"
                    title="Dismiss"
                >
                    <span className="material-icons text-[14px]">close</span>
                </button>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------
function EmptyState({ label }: { label: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                <span className="material-icons text-text-grey text-[24px]">
                    notifications_none
                </span>
            </div>
            <p className="text-sm text-white font-medium">{label}</p>
            <p className="text-xs text-text-grey mt-1">
                We'll let you know when something happens.
            </p>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Skeleton loader row
// ---------------------------------------------------------------------------
function SkeletonRow() {
    return (
        <div className="px-4 py-3 flex gap-3 items-start border-b border-white/5">
            <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 bg-white/10 rounded animate-pulse w-3/4" />
                <div className="h-2.5 bg-white/10 rounded animate-pulse w-1/2" />
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Tab filter
// ---------------------------------------------------------------------------
type FilterTab = "all" | "unread";

// ---------------------------------------------------------------------------
// Props — accepts pre-fetched data so the panel is decoupled from the hook
// ---------------------------------------------------------------------------
export interface NotificationsPanelProps {
    notifications?: Notification[];
    unreadCount?: number;
    isLoading?: boolean;
    onMarkAsRead?: (id: string) => void;
    onMarkAllAsRead?: () => void;
    onDelete?: (id: string) => void;
    onClearAllRead?: () => void;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function NotificationsPanel({
    notifications = [],
    unreadCount = 0,
    isLoading = false,
    onMarkAsRead,
    onMarkAllAsRead,
    onDelete,
    onClearAllRead,
}: NotificationsPanelProps) {
    const t = useTranslations("DashboardTopNav");
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<FilterTab>("all");
    const panelRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close on Escape key
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") setIsOpen(false);
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    const displayed =
        activeTab === "unread"
            ? notifications.filter((n) => !n.read)
            : notifications;

    const hasUnread = unreadCount > 0;
    const hasRead = notifications.some((n) => n.read);

    // Group notifications by date label for the "all" tab
    const groups = groupByDate(displayed);

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell button */}
            <button
                className={`relative w-10 h-10 rounded-full border border-white/5 bg-surface-dark flex items-center justify-center hover:bg-white/5 transition-colors cursor-pointer ${
                    isOpen ? "text-white bg-white/5" : "text-text-grey hover:text-white"
                }`}
                title={t("notifications")}
                onClick={() => setIsOpen(!isOpen)}
                aria-label={t("notifications")}
                aria-expanded={isOpen}
            >
                <span className="material-icons text-[20px]">notifications</span>

                {/* Unread badge */}
                {hasUnread && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-primary text-[9px] font-bold text-white flex items-center justify-center leading-none">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-[360px] bg-surface-dark border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[80vh]">
                    {/* Header */}
                    <div className="px-4 pt-4 pb-3 border-b border-white/10 flex-shrink-0">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-white font-semibold text-sm">
                                {t("notifications")}
                            </h3>
                            <div className="flex items-center gap-2">
                                {hasUnread && (
                                    <button
                                        onClick={onMarkAllAsRead}
                                        className="text-[11px] text-primary hover:text-primary/80 transition-colors font-medium"
                                    >
                                        {t("markAllRead")}
                                    </button>
                                )}
                                {hasRead && (
                                    <button
                                        onClick={onClearAllRead}
                                        className="text-[11px] text-text-grey hover:text-white transition-colors"
                                    >
                                        {t("clearRead")}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 bg-white/5 p-0.5 rounded-lg">
                            {(["all", "unread"] as FilterTab[]).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                                        activeTab === tab
                                            ? "bg-primary text-white"
                                            : "text-text-grey hover:text-white"
                                    }`}
                                >
                                    {tab === "all" ? t("tabAll") : t("tabUnread")}
                                    {tab === "unread" && unreadCount > 0 && (
                                        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/10 text-[9px]">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* List */}
                    <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                        {isLoading ? (
                            <>
                                <SkeletonRow />
                                <SkeletonRow />
                                <SkeletonRow />
                            </>
                        ) : displayed.length === 0 ? (
                            <EmptyState
                                label={
                                    activeTab === "unread"
                                        ? t("noUnread")
                                        : t("noNewNotifications")
                                }
                            />
                        ) : (
                            groups.map((group) => (
                                <div key={group.label}>
                                    <div className="px-4 py-2 text-[10px] font-semibold text-text-grey/60 uppercase tracking-widest bg-white/2">
                                        {group.label}
                                    </div>
                                    {group.notifications.map((n) => (
                                        <NotificationItem
                                            key={n._id}
                                            notification={n}
                                            onRead={onMarkAsRead ?? (() => {})}
                                            onDelete={onDelete ?? (() => {})}
                                        />
                                    ))}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-2.5 border-t border-white/10 flex-shrink-0">
                            <button className="w-full text-xs text-text-grey hover:text-white transition-colors text-center py-1">
                                {t("viewAll")}
                                <span className="material-icons text-[12px] ml-1 align-middle">
                                    arrow_forward
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function groupByDate(notifications: Notification[]) {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const oneWeekMs = 7 * oneDayMs;

    const today: Notification[] = [];
    const thisWeek: Notification[] = [];
    const older: Notification[] = [];

    for (const n of notifications) {
        const age = now - n._creationTime;
        if (age < oneDayMs) {
            today.push(n);
        } else if (age < oneWeekMs) {
            thisWeek.push(n);
        } else {
            older.push(n);
        }
    }

    const groups: { label: string; notifications: Notification[] }[] = [];
    if (today.length > 0) groups.push({ label: "Today", notifications: today });
    if (thisWeek.length > 0) groups.push({ label: "This Week", notifications: thisWeek });
    if (older.length > 0) groups.push({ label: "Older", notifications: older });
    return groups;
}
