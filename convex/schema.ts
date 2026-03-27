import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    notifications: defineTable({
        userId: v.string(),
        type: v.string(),
        title: v.string(),
        message: v.string(),
        read: v.boolean(),
        readAt: v.optional(v.number()),
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
    })
        .index("by_user", ["userId"])
        .index("by_user_read", ["userId", "read"]),
});

    customDomains: defineTable({
        ownerId: v.string(),
        domain: v.string(),
        verified: v.boolean(),
        dnsRecord: v.optional(v.string()),
        primaryForStoreId: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.optional(v.number()),
    })
        .index("by_owner", ["ownerId"]) 
        .index("by_domain", ["domain"])
        .index("by_store_primary", ["primaryForStoreId"]),
