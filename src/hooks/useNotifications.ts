"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCallback, useMemo } from "react";
import type { Notification, NotificationGroup } from "@/types/notifications";

interface UseNotificationsOptions {
    userId: string | null | undefined;
    limit?: number;
}

export function useNotifications({ userId, limit = 30 }: UseNotificationsOptions) {
    const notifications = useQuery(
        api.notifications.listForUser,
        userId ? { userId, limit } : "skip"
    ) as Notification[] | undefined;

    const unreadCount = useQuery(
        api.notifications.getUnreadCount,
        userId ? { userId } : "skip"
    ) as number | undefined;

    const markAsReadMutation = useMutation(api.notifications.markAsRead);
    const markAllAsReadMutation = useMutation(api.notifications.markAllAsRead);
    const deleteNotificationMutation = useMutation(api.notifications.deleteNotification);
    const clearAllReadMutation = useMutation(api.notifications.clearAllRead);

    const markAsRead = useCallback(
        (notificationId: string) => {
            return markAsReadMutation({ notificationId: notificationId as any });
        },
        [markAsReadMutation]
    );

    const markAllAsRead = useCallback(() => {
        if (!userId) return Promise.resolve(0);
        return markAllAsReadMutation({ userId });
    }, [markAllAsReadMutation, userId]);

    const deleteNotification = useCallback(
        (notificationId: string) => {
            return deleteNotificationMutation({ notificationId: notificationId as any });
        },
        [deleteNotificationMutation]
    );

    const clearAllRead = useCallback(() => {
        if (!userId) return Promise.resolve(0);
        return clearAllReadMutation({ userId });
    }, [clearAllReadMutation, userId]);

    const grouped = useMemo<NotificationGroup[]>(() => {
        if (!notifications) return [];

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

        const groups: NotificationGroup[] = [];
        if (today.length > 0) groups.push({ label: "Today", notifications: today });
        if (thisWeek.length > 0) groups.push({ label: "This Week", notifications: thisWeek });
        if (older.length > 0) groups.push({ label: "Older", notifications: older });

        return groups;
    }, [notifications]);

    return {
        notifications: notifications ?? [],
        unreadCount: unreadCount ?? 0,
        grouped,
        isLoading: notifications === undefined,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllRead,
    };
}
