import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Add reaction to message
export const addReaction = mutation({
    args: {
        messageId: v.id("messages"),
        emoji: v.string(),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const message = await ctx.db.get(args.messageId);
        if (!message) return;

        const reactions = message.reactions || [];
        
        // Remove existing reaction from this user
        const filteredReactions = reactions.filter((r: any) => r.userId !== args.userId);
        
        // Add new reaction
        filteredReactions.push({ emoji: args.emoji, userId: args.userId });
        
        await ctx.db.patch(args.messageId, { reactions: filteredReactions });
    },
});

// Remove reaction from message
export const removeReaction = mutation({
    args: {
        messageId: v.id("messages"),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const message = await ctx.db.get(args.messageId);
        if (!message) return;

        const reactions = (message.reactions || []).filter((r: any) => r.userId !== args.userId);
        await ctx.db.patch(args.messageId, { reactions });
    },
});

// Star a message
export const starMessage = mutation({
    args: {
        userId: v.string(),
        messageId: v.id("messages"),
        chatId: v.id("chats"),
    },
    handler: async (ctx, args) => {
        // Check if already starred
        const existing = await ctx.db
            .query("starredMessages")
            .filter(q => q.and(
                q.eq(q.field("userId"), args.userId),
                q.eq(q.field("messageId"), args.messageId)
            ))
            .first();

        if (existing) return;

        await ctx.db.insert("starredMessages", {
            userId: args.userId,
            messageId: args.messageId,
            chatId: args.chatId,
            createdAt: Date.now(),
        });
    },
});

// Unstar a message
export const unstarMessage = mutation({
    args: {
        userId: v.string(),
        messageId: v.id("messages"),
    },
    handler: async (ctx, args) => {
        const starred = await ctx.db
            .query("starredMessages")
            .filter(q => q.and(
                q.eq(q.field("userId"), args.userId),
                q.eq(q.field("messageId"), args.messageId)
            ))
            .first();

        if (starred) {
            await ctx.db.delete(starred._id);
        }
    },
});

// Get starred messages for a user
export const getStarredMessages = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const starred = await ctx.db
            .query("starredMessages")
            .filter(q => q.eq(q.field("userId"), args.userId))
            .order("desc")
            .take(100);

        // Get full message details
        const messages = await Promise.all(
            starred.map(async (s) => {
                const msg = await ctx.db.get(s.messageId);
                return msg ? { ...msg, starredAt: s.createdAt } : null;
            })
        );

        return messages.filter(Boolean);
    },
});

// Set chat wallpaper
export const setWallpaper = mutation({
    args: {
        chatId: v.id("chats"),
        wallpaper: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("chatWallpapers")
            .filter(q => q.eq(q.field("chatId"), args.chatId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, { wallpaper: args.wallpaper, updatedAt: Date.now() });
        } else {
            await ctx.db.insert("chatWallpapers", {
                chatId: args.chatId,
                wallpaper: args.wallpaper,
                updatedAt: Date.now(),
            });
        }
    },
});

// Get chat wallpaper
export const getWallpaper = query({
    args: { chatId: v.id("chats") },
    handler: async (ctx, args) => {
        const wallpaper = await ctx.db
            .query("chatWallpapers")
            .filter(q => q.eq(q.field("chatId"), args.chatId))
            .first();
        return wallpaper?.wallpaper || null;
    },
});
