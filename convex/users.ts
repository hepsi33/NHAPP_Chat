import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create or get user by email
export const createOrGetUser = mutation({
    args: {
        email: v.string(),
        name: v.string(),
    },
    handler: async (ctx, args) => {
        const email = args.email.toLowerCase();
        
        // Check if user exists
        const existing = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", email))
            .first();

        if (existing) {
            return existing;
        }

        // Create new user
        const userId = email + "_" + Date.now();
        const id = await ctx.db.insert("users", {
            userId,
            email,
            name: args.name,
            status: "Hey there! I'm using NHAPP",
            isOnline: true,
            lastSeen: Date.now(),
            createdAt: Date.now(),
        });

        return await ctx.db.get(id);
    },
});

// Get user by email
export const getUserByEmail = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
            .first();
    },
});

// Get user by ID
export const getUserById = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .first();
    },
});

// Search users by email
export const searchUsers = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const search = args.email.toLowerCase();
        const all = await ctx.db.query("users").collect();
        return all.filter(u => u.email.includes(search)).slice(0, 10);
    },
});

// Update user profile
export const updateProfile = mutation({
    args: {
        userId: v.string(),
        name: v.optional(v.string()),
        avatar: v.optional(v.string()),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .first();

        if (!user) throw new Error("User not found");

        const updates: any = {};
        if (args.name) updates.name = args.name;
        if (args.avatar) updates.avatar = args.avatar;
        if (args.status) updates.status = args.status;

        await ctx.db.patch(user._id, updates);
    },
});
