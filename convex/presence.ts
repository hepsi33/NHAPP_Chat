import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Update user online status
export const updatePresence = mutation({
    args: {
        userId: v.string(),
        isOnline: v.boolean(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_userId", q => q.eq("userId", args.userId))
            .first();

        if (user) {
            await ctx.db.patch(user._id, {
                isOnline: args.isOnline,
                lastSeen: args.isOnline ? Date.now() : user.lastSeen,
            });
        }
    },
});

// Get online status for multiple users
export const getOnlineStatus = query({
    args: { userIds: v.array(v.string()) },
    handler: async (ctx, args) => {
        const results: Record<string, boolean> = {};
        
        for (const userId of args.userIds) {
            const user = await ctx.db
                .query("users")
                .withIndex("by_userId", q => q.eq("userId", userId))
                .first();
            results[userId] = user?.isOnline || false;
        }
        
        return results;
    },
});

// Get single user online status
export const getUserOnlineStatus = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_userId", q => q.eq("userId", args.userId))
            .first();
        
        return {
            isOnline: user?.isOnline || false,
            lastSeen: user?.lastSeen || null,
        };
    },
});
