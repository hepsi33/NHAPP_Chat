import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Set typing status
export const setTyping = mutation({
    args: {
        chatId: v.id("chats"),
        userId: v.string(),
        isTyping: v.boolean(),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        
        // Check if typing status exists
        const existing = await ctx.db
            .query("typingStatus")
            .withIndex("by_chat", q => q.eq("chatId", args.chatId))
            .filter(q => q.eq(q.field("userId"), args.userId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                isTyping: args.isTyping,
                updatedAt: now,
            });
        } else {
            await ctx.db.insert("typingStatus", {
                chatId: args.chatId,
                userId: args.userId,
                isTyping: args.isTyping,
                updatedAt: now,
            });
        }
    },
});

// Get typing status for a chat
export const getTypingStatus = query({
    args: { chatId: v.id("chats") },
    handler: async (ctx, args) => {
        const typingUsers = await ctx.db
            .query("typingStatus")
            .withIndex("by_chat", q => q.eq("chatId", args.chatId))
            .filter(q => q.eq(q.field("isTyping"), true))
            .collect();
        
        // Filter out old typing status (older than 5 seconds)
        const now = Date.now();
        const activeTyping = typingUsers.filter(t => now - t.updatedAt < 5000);
        
        return activeTyping;
    },
});
