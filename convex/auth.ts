import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Initialize Resend with API key
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

const OTPs = new Map<string, { code: string; expires: number; name?: string }>();
const invites = new Map<string, { fromEmail: string; fromName: string; expires: number }>();

async function sendEmail(to: string, subject: string, html: string) {
    if (!RESEND_API_KEY) {
        console.log(`[DEV MODE] Email would be sent to: ${to}`);
        console.log(`[DEV MODE] Subject: ${subject}`);
        console.log(`[DEV MODE] Body: ${html}`);
        return { success: true, devMode: true };
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'NHAPP <noreply@nhapp.com>',
                to: to,
                subject: subject,
                html: html,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Resend error:', error);
            throw new Error('Failed to send email');
        }

        return { success: true };
    } catch (error) {
        console.error('Email send error:', error);
        throw error;
    }
}

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
        const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

        OTPs.set(email, { code, expires, name: args.name });

        const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #8B5CF6; }
        .code { font-size: 36px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; color: #888; font-size: 12px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">NHAPP</div>
        </div>
        <p>Hello${args.name ? ` ${args.name}` : ''},</p>
        <p>Your verification code is:</p>
        <div class="code">${code}</div>
        <p>This code will expire in 10 minutes.</p>
        <div class="footer">
            <p>If you didn't request this code, please ignore this email.</p>
        </div>
    </div>
</body>
</html>
        `;

        await sendEmail(email, 'NHAPP Verification Code', html);

        return { success: true, message: 'Verification code sent to your email' };
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

        const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #8B5CF6; }
        .code { font-size: 36px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; color: #888; font-size: 12px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">NHAPP</div>
        </div>
        <p>Hello${stored.name ? ` ${stored.name}` : ''},</p>
        <p>Your new verification code is:</p>
        <div class="code">${code}</div>
        <p>This code will expire in 10 minutes.</p>
        <div class="footer">
            <p>If you didn't request this code, please ignore this email.</p>
        </div>
    </div>
</body>
</html>
        `;

        await sendEmail(email, 'NHAPP New Verification Code', html);

        return { success: true, message: 'New verification code sent to your email' };
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
        
        const inviteCode = Math.random().toString(36).substring(2, 15);
        const expires = Date.now() + 7 * 24 * 60 * 60 * 1000;
        
        invites.set(inviteCode, {
            fromEmail: args.fromEmail,
            fromName: args.fromName,
            expires,
        });

        const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #8B5CF6; }
        .btn { display: inline-block; padding: 15px 30px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; color: #888; font-size: 12px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">NHAPP</div>
        </div>
        <p>Hello,</p>
        <p><strong>${args.fromName}</strong> has invited you to join NHAPP!</p>
        <p>NHAPP is a messaging app that puts you in control. Join now and stay connected with your friends and family.</p>
        <p style="text-align: center;">
            <a href="https://nhapp.com/download" class="btn">Download NHAPP</a>
        </p>
        <p>Or sign up with this email: ${toEmail}</p>
        <div class="footer">
            <p>This invite expires in 7 days.</p>
            <p>Sent by ${args.fromName} (${args.fromEmail})</p>
        </div>
    </div>
</body>
</html>
        `;

        await sendEmail(toEmail, `${args.fromName} invited you to NHAPP!`, html);

        return { 
            success: true, 
            message: 'Invite sent to user\'s email!' 
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
