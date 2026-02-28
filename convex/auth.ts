import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const OTPs = new Map<string, { code: string; expires: number; name?: string }>();
const invites = new Map<string, { fromEmail: string; fromName: string; expires: number }>();

export const sendOTP = mutation({
    args: {
        email: v.string(),
        name: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const email = args.email.toLowerCase();
        
        if (!email.includes('@')) {
            throw new Error('Invalid email address');
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = Date.now() + 10 * 60 * 1000;

        OTPs.set(email, { code, expires, name: args.name });

        console.log(`OTP for ${email}: ${code}`);

        return { success: true, message: 'OTP sent to your email' };
    },
});

export const verifyOTP = mutation({
    args: {
        email: v.string(),
        code: v.string(),
    },
    handler: async (ctx, args) => {
        const email = args.email.toLowerCase();
        const stored = OTPs.get(email);

        if (!stored) {
            throw new Error('No OTP found. Please request a new code.');
        }

        if (Date.now() > stored.expires) {
            OTPs.delete(email);
            throw new Error('OTP expired. Please request a new code.');
        }

        if (stored.code !== args.code) {
            throw new Error('Invalid OTP. Please try again.');
        }

        OTPs.delete(email);

        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", email))
            .first();

        if (existingUser) {
            return { 
                exists: true, 
                user: existingUser,
                name: existingUser.name 
            };
        }

        if (stored.name) {
            const userId = email + "_" + Date.now();
            const id = await ctx.db.insert("users", {
                userId,
                email,
                name: stored.name,
                status: "Hey there! I'm using NHAPP",
                isOnline: true,
                lastSeen: Date.now(),
                createdAt: Date.now(),
            });

            const newUser = await ctx.db.get(id);
            return { 
                exists: false, 
                user: newUser,
                name: stored.name 
            };
        }

        return { 
            exists: false, 
            name: stored.name,
            message: 'Please provide your name' 
        };
    },
});

export const resendOTP = mutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const email = args.email.toLowerCase();
        const stored = OTPs.get(email);

        if (!stored) {
            throw new Error('No OTP request found. Please try again.');
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = Date.now() + 10 * 60 * 1000;

        OTPs.set(email, { code, expires, name: stored.name });

        console.log(`New OTP for ${email}: ${code}`);

        return { success: true, message: 'New OTP sent to your email' };
    },
});

export const sendInvite = mutation({
    args: {
        fromEmail: v.string(),
        fromName: v.string(),
        toEmail: v.string(),
    },
    handler: async (ctx, args) => {
        const toEmail = args.toEmail.toLowerCase();
        const fromEmail = args.fromEmail.toLowerCase();
        
        // Store invite
        const inviteCode = Math.random().toString(36).substring(2, 15);
        const expires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
        
        invites.set(inviteCode, {
            fromEmail: args.fromEmail,
            fromName: args.fromName,
            expires,
        });

        // Log invite details (in production, integrate with email service like Resend/SendGrid)
        console.log(`
========== NHAPP INVITE ==========
From: ${args.fromName} (${fromEmail})
To: ${toEmail}
Invite Code: ${inviteCode}
=================================
To send a real email, configure an email service (Resend, SendGrid, etc.)
==========================================
        `);

        // Return the invite details that could be sent via email
        return { 
            success: true, 
            inviteCode,
            message: 'Invite created. In production, this would send an email.',
            // Preview URL for testing
            previewUrl: `https://nhapp.com/invite/${inviteCode}`
        };
    },
});

export const getInvite = query({
    args: { inviteCode: v.string() },
    handler: async (ctx, args) => {
        const invite = invites.get(args.inviteCode);
        
        if (!invite) {
            return null;
        }

        if (Date.now() > invite.expires) {
            invites.delete(args.inviteCode);
            return null;
        }

        return {
            fromEmail: invite.fromEmail,
            fromName: invite.fromName,
        };
    },
});
