import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Send a message
export const sendMessage = mutation({
    args: {
        chatId: v.id("chats"),
        senderId: v.string(),
        text: v.string(),
        type: v.optional(v.union(v.literal("text"), v.literal("image"), v.literal("audio"), v.literal("video"))),
        fileId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("messages", {
            chatId: args.chatId,
            senderId: args.senderId,
            text: args.text,
            type: args.type || "text",
            fileId: args.fileId,
            status: "sent",
            createdAt: Date.now(),
        });

        // Update chat timestamp and last message
        const chat = await ctx.db.get(args.chatId);
        if (chat) {
            const now = Date.now();
            const currentUnreadCount = chat.unreadCount || 0;
            await ctx.db.patch(args.chatId, { 
                updatedAt: now,
                lastMessage: args.text,
                lastMessageTime: now,
                unreadCount: currentUnreadCount + 1,
            });
        }

        return id;
    },
});

// Get messages for a chat
export const getMessages = query({
    args: { chatId: v.id("chats") },
    handler: async (ctx, args) => {
        const msgs = await ctx.db
            .query("messages")
            .withIndex("by_chat", q => q.eq("chatId", args.chatId))
            .order("desc")
            .take(100);
        return msgs;
    },
});

// Mark messages as read
export const markRead = mutation({
    args: { chatId: v.id("chats"), userId: v.string() },
    handler: async (ctx, args) => {
        const msgs = await ctx.db
            .query("messages")
            .withIndex("by_chat", q => q.eq("chatId", args.chatId))
            .collect();

        for (const msg of msgs) {
            if (msg.senderId !== args.userId && msg.status !== "read") {
                await ctx.db.patch(msg._id, { status: "read" });
            }
        }

        // Reset unread count
        await ctx.db.patch(args.chatId, { unreadCount: 0 });
    },
});

// Delete a message
export const deleteMessage = mutation({
    args: { messageId: v.id("messages") },
    handler: async (ctx, args) => {
        const message = await ctx.db.get(args.messageId);
        if (message) {
            await ctx.db.delete(args.messageId);
        }
    },
});

// Mark message as delivered
export const markDelivered = mutation({
    args: { chatId: v.id("chats") },
    handler: async (ctx, args) => {
        const msgs = await ctx.db
            .query("messages")
            .withIndex("by_chat", q => q.eq("chatId", args.chatId))
            .collect();

        for (const msg of msgs) {
            if (msg.status === "sent") {
                await ctx.db.patch(msg._id, { status: "delivered" });
            }
        }
    },
});

// Mark image as viewed (for auto-delete feature)
export const markImageViewed = mutation({
    args: { messageId: v.id("messages") },
    handler: async (ctx, args) => {
        const msg = await ctx.db.get(args.messageId);
        if (msg && msg.type === "image") {
            await ctx.db.patch(args.messageId, { status: "viewed" });
        }
    },
});

// Delete image file from storage
export const deleteImageFile = mutation({
    args: { messageId: v.id("messages") },
    handler: async (ctx, args) => {
        const msg = await ctx.db.get(args.messageId);
        if (msg && msg.type === "image" && msg.text) {
            // Try to delete from storage
            try {
                await ctx.storage.delete(msg.text);
            } catch (e) {
                console.log("Storage delete error:", e);
            }
            // Delete the message
            await ctx.db.delete(args.messageId);
        }
    },
});
