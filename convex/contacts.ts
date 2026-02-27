import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addContact = mutation({
    args: {
        ownerId: v.string(),
        contactEmail: v.string(),
        nickname: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const normalizedEmail = args.contactEmail.toLowerCase().trim();

        const existing = await ctx.db
            .query("contacts")
            .withIndex("by_owner_email", (q) =>
                q.eq("ownerId", args.ownerId).eq("contactEmail", normalizedEmail)
            )
            .unique();

        if (existing) {
            if (args.nickname && existing.nickname !== args.nickname) {
                await ctx.db.patch(existing._id, { nickname: args.nickname });
            }
            return { id: existing._id, isNew: false };
        }

        const targetUser = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
            .first();

        const newId = await ctx.db.insert("contacts", {
            ownerId: args.ownerId,
            contactEmail: normalizedEmail,
            contactUserId: targetUser?.userId,
            nickname: args.nickname,
            createdAt: Date.now(),
        });

        return { id: newId, isNew: true };
    },
});

export const removeContact = mutation({
    args: {
        ownerId: v.string(),
        contactEmail: v.string(),
    },
    handler: async (ctx, args) => {
        const normalizedEmail = args.contactEmail.toLowerCase();

        const existing = await ctx.db
            .query("contacts")
            .withIndex("by_owner_email", (q) =>
                q.eq("ownerId", args.ownerId).eq("contactEmail", normalizedEmail)
            )
            .unique();

        if (existing) {
            await ctx.db.delete(existing._id);
        }
    }
});

export const listContacts = query({
    args: { ownerId: v.string() },
    handler: async (ctx, args) => {
        const contacts = await ctx.db
            .query("contacts")
            .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
            .collect();

        const enrichedContacts = await Promise.all(
            contacts.map(async (contact) => {
                let userProfile = null;
                const cid = contact.contactUserId;
                if (cid) {
                    userProfile = await ctx.db
                        .query("users")
                        .withIndex("by_userId", (q) => q.eq("userId", cid))
                        .first();
                }

                return {
                    _id: contact._id,
                    contactEmail: contact.contactEmail,
                    nickname: contact.nickname,
                    contactUserId: contact.contactUserId,
                    createdAt: contact.createdAt,
                    userProfile: userProfile ? {
                        userId: userProfile.userId,
                        name: userProfile.name,
                        email: userProfile.email,
                        avatar: userProfile.avatar,
                        status: userProfile.status,
                    } : null,
                };
            })
        );

        return enrichedContacts;
    },
});
