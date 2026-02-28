import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createStatus = mutation({
    args: {
        userId: v.string(),
        type: v.union(v.literal("image"), v.literal("text")),
        fileId: v.optional(v.string()),
        text: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const expiresAt = now + 24 * 60 * 60 * 1000;

        await ctx.db.insert("statusUpdates", {
            userId: args.userId,
            type: args.type,
            fileId: args.fileId,
            text: args.text,
            createdAt: now,
            expiresAt: expiresAt,
        });
    },
});

export const listActiveStatuses = query({
    args: { currentUserId: v.string() },
    handler: async (ctx, args) => {
        const now = Date.now();

        const allStatuses = await ctx.db
            .query("statusUpdates")
            .filter((q) => q.gt(q.field("expiresAt"), now))
            .collect();

        const grouped = allStatuses.reduce((acc, status) => {
            if (!acc[status.userId]) {
                acc[status.userId] = [];
            }
            acc[status.userId].push(status);
            return acc;
        }, {} as Record<string, typeof allStatuses>);

        const result = [];
        for (const [userId, statuses] of Object.entries(grouped)) {
            const user = await ctx.db
                .query("users")
                .withIndex("by_userId", (q) => q.eq("userId", userId))
                .unique();

            if (user) {
                statuses.sort((a, b) => a.createdAt - b.createdAt);

                result.push({
                    user: {
                        userId: user.userId,
                        name: user.name,
                        avatar: user.avatar,
                    },
                    statuses: statuses.map(s => ({
                        _id: s._id,
                        type: s.type,
                        fileId: s.fileId,
                        text: s.text,
                        createdAt: s.createdAt,
                    })),
                });
            }
        }

        const myStatuses = result.find(g => g.user.userId === args.currentUserId);
        const otherStatuses = result.filter(g => g.user.userId !== args.currentUserId);

        otherStatuses.sort((a, b) => {
            const aLast = a.statuses[a.statuses.length - 1].createdAt;
            const bLast = b.statuses[b.statuses.length - 1].createdAt;
            return bLast - aLast;
        });

        return {
            me: myStatuses || null,
            others: otherStatuses
        };
    },
});

export const deleteStatus = mutation({
    args: { statusId: v.id("statusUpdates") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.statusId);
    },
});

export const markStatusViewed = mutation({
    args: {
        statusId: v.id("statusUpdates"),
        viewerId: v.string(),
    },
    handler: async (ctx, args) => {
        // Check if already viewed
        const existing = await ctx.db
            .query("statusViews")
            .withIndex("by_status_viewer", (q) => 
                q.eq("statusId", args.statusId).eq("viewerId", args.viewerId)
            )
            .first();

        if (!existing) {
            await ctx.db.insert("statusViews", {
                statusId: args.statusId,
                viewerId: args.viewerId,
                viewedAt: Date.now(),
            });
        }
    },
});

export const getStatusViewers = mutation({
    args: { statusId: v.id("statusUpdates") },
    handler: async (ctx, args) => {
        const views = await ctx.db
            .query("statusViews")
            .withIndex("by_status", (q) => q.eq("statusId", args.statusId))
            .collect();

        const viewers = [];
        for (const view of views) {
            const user = await ctx.db
                .query("users")
                .withIndex("by_userId", (q) => q.eq("userId", view.viewerId))
                .first();
            
            if (user) {
                viewers.push({
                    userId: user.userId,
                    name: user.name,
                    avatar: user.avatar,
                    viewedAt: view.viewedAt,
                });
            }
        }

        return viewers;
    },
});
