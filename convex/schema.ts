import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    userId: v.string(),
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
    status: v.optional(v.string()),
    isOnline: v.optional(v.boolean()),
    lastSeen: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_email", ["email"])
    .index("by_userId", ["userId"]),

  chats: defineTable({
    type: v.union(v.literal("private"), v.literal("group")),
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
    participants: v.optional(v.array(v.string())),
    createdAt: v.optional(v.number()),
    updatedAt: v.number(),
  }).index("by_type", ["type"]),

  messages: defineTable({
    chatId: v.id("chats"),
    senderId: v.string(),
    text: v.string(),
    type: v.union(v.literal("text"), v.literal("image"), v.literal("audio"), v.literal("video")),
    fileId: v.optional(v.string()),
    status: v.union(v.literal("sent"), v.literal("delivered"), v.literal("read")),
    createdAt: v.number(),
  }).index("by_chat", ["chatId"])
    .index("by_createdAt", ["createdAt"]),

  statusUpdates: defineTable({
    userId: v.string(),
    type: v.union(v.literal("image"), v.literal("text")),
    fileId: v.optional(v.string()),
    createdAt: v.number(),
    expiresAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_expires", ["expiresAt"]),

  contacts: defineTable({
    ownerId: v.string(),
    contactEmail: v.string(),
    contactUserId: v.optional(v.string()),
    nickname: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_owner", ["ownerId"])
    .index("by_owner_email", ["ownerId", "contactEmail"]),
});
