import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const listForOwner = query({
    args: { ownerId: v.string(), limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 50;
        return await ctx.db
            .query("customDomains")
            .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
            .order("desc")
            .take(limit);
    },
});

export const getByDomain = query({
    args: { domain: v.string() },
    handler: async (ctx, args) => {
        const results = await ctx.db
            .query("customDomains")
            .withIndex("by_domain", (q) => q.eq("domain", args.domain))
            .collect();
        return results[0] ?? null;
    },
});

export const createDomain = mutation({
    args: {
        ownerId: v.string(),
        domain: v.string(),
        dnsRecord: v.optional(v.string()),
        primaryForStoreId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        return await ctx.db.insert("customDomains", {
            ownerId: args.ownerId,
            domain: args.domain,
            verified: false,
            dnsRecord: args.dnsRecord,
            primaryForStoreId: args.primaryForStoreId,
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const verifyDomain = mutation({
    args: { domainId: v.id("customDomains") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.domainId, { verified: true, updatedAt: Date.now() });
    },
});

export const setPrimaryForStore = mutation({
    args: { domainId: v.id("customDomains"), storeId: v.string() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.domainId, { primaryForStoreId: args.storeId, updatedAt: Date.now() });
    },
});

export const deleteDomain = mutation({
    args: { domainId: v.id("customDomains") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.domainId);
    },
});
