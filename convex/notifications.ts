import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listForUser = query({
    args: {
        userId: v.string(),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 30;
        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .take(limit);
        return notifications;
    },
});

export const getUnreadCount = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const unread = await ctx.db
            .query("notifications")
            .withIndex("by_user_read", (q) =>
                q.eq("userId", args.userId).eq("read", false)
            )
            .collect();
        return unread.length;
    },
});

export const markAsRead = mutation({
    args: { notificationId: v.id("notifications") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.notificationId, {
            read: true,
            readAt: Date.now(),
        });
    },
});

export const markAllAsRead = mutation({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const unread = await ctx.db
            .query("notifications")
            .withIndex("by_user_read", (q) =>
                q.eq("userId", args.userId).eq("read", false)
            )
            .collect();
        await Promise.all(
            unread.map((n) =>
                ctx.db.patch(n._id, { read: true, readAt: Date.now() })
            )
        );
        return unread.length;
    },
});

export const deleteNotification = mutation({
    args: { notificationId: v.id("notifications") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.notificationId);
    },
});

export const clearAllRead = mutation({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const read = await ctx.db
            .query("notifications")
            .withIndex("by_user_read", (q) =>
                q.eq("userId", args.userId).eq("read", true)
            )
            .collect();
        await Promise.all(read.map((n) => ctx.db.delete(n._id)));
        return read.length;
    },
});

export const createNotification = mutation({
    args: {
        userId: v.string(),
        type: v.string(),
        title: v.string(),
        message: v.string(),
        metadata: v.optional(
            v.object({
                amount: v.optional(v.number()),
                currency: v.optional(v.string()),
                productName: v.optional(v.string()),
                affiliateName: v.optional(v.string()),
                transactionId: v.optional(v.string()),
                payoutId: v.optional(v.string()),
                link: v.optional(v.string()),
            })
        ),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("notifications", {
            userId: args.userId,
            type: args.type,
            title: args.title,
            message: args.message,
            read: false,
            metadata: args.metadata,
        });
    },
});
