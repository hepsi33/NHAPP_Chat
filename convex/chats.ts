import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a private chat between two users
export const createPrivateChat = mutation({
    args: {
        participants: v.array(v.string()),
        currentUserId: v.string(),
    },
    handler: async (ctx, args) => {
        // Check if private chat already exists between these users
        const allChats = await ctx.db.query("chats").collect();
        const existing = allChats.find(c => 
            c.type === "private" && 
            c.participants && 
            c.participants.length === 2 &&
            args.participants.every(p => c.participants!.includes(p))
        );

        if (existing) {
            return existing._id;
        }

        // Get participant details
        const user1 = await ctx.db.query("users").withIndex("by_userId", q => q.eq("userId", args.participants[0])).first();
        const user2 = await ctx.db.query("users").withIndex("by_userId", q => q.eq("userId", args.participants[1])).first();

        // Determine which user is the "other" (not the current user)
        const otherUser = args.currentUserId === args.participants[0] ? user2 : user1;
        const otherAvatar = args.currentUserId === args.participants[0] ? user2?.avatar : user1?.avatar;

        const now = Date.now();
        const chatId = await ctx.db.insert("chats", {
            type: "private",
            name: otherUser?.name || "Chat",
            avatar: otherAvatar || undefined,
            participants: args.participants,
            createdAt: now,
            updatedAt: now,
        });

        return chatId;
    },
});

// Get chat by ID
export const getChat = query({
    args: { chatId: v.id("chats") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.chatId);
    },
});

// Get all chats for a user
export const getUserChats = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const allChats = await ctx.db.query("chats").collect();
        const userChats = allChats.filter(c => c.participants && c.participants.includes(args.userId));
        return userChats.sort((a, b) => b.updatedAt - a.updatedAt);
    },
});
