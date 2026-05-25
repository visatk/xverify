import { Composer } from 'grammy';
import { MyContext } from '../types';
import { getMainMenu, getShopMenu, getBuyCreditsMenu } from '../keyboards/menus';

export const commands = new Composer<MyContext>();

commands.command('start', async (ctx) => {
    const payload = ctx.match;
    let inviterId: number | null = null;
    
    // Parse deep-link referral IDs securely
    if (payload && typeof payload === 'string' && payload.startsWith('ref_')) {
        const parsed = parseInt(payload.replace('ref_', ''), 10);
        if (!isNaN(parsed) && parsed !== ctx.from?.id) {
            inviterId = parsed;
        }
    }
    
    const userId = ctx.from?.id;
    const username = ctx.from?.username || "";

    if (userId) {
        const existingUser = await ctx.env.DB.prepare("SELECT user_id FROM users WHERE user_id = ?").bind(userId).first();
        
        if (!existingUser) {
            await ctx.env.DB.prepare(
                "INSERT INTO users (user_id, username, inviter_id) VALUES (?, ?, ?)"
            ).bind(userId, username, inviterId).run();

            // Reward the inviter
            if (inviterId) {
                await ctx.env.DB.prepare(
                    "UPDATE users SET referral_credits = referral_credits + 0.1 WHERE user_id = ?"
                ).bind(inviterId).run();
            }
        }
    }

	const welcomeText = `👋 Welcome to **PixVerifyBot**!\n\nThis bot helps you verify your Google Pixel device in your Google Account, allowing you to claim a free 1-year Google AI.\n\nBefore verification please make sure that you follow the following steps.\n1. Close Your Payments Profile\n2. Leave or delete current family group.\n3. Do not use the gmail id in which you have claimed student offer before.\n4. Prepare TOTL Secret(Authenticator Secret)\n\nUse 💡 if you cannot find TOTP secret key or contact @PixVerify`;
	
	await ctx.reply(welcomeText, {
		reply_markup: getMainMenu(),
		parse_mode: "Markdown"
	});
});

commands.command('shop', async (ctx) => {
    const text = `🛒 **Account Shop**\n\n🇬 [18 Months] Google AI PRO — Activation Link — $2.90 · from $2.50\n🤖 ChatGPT PLUS [1 Month, UPI Made] — No warranty — $1.75 🎁\n🤖 ChatGPT PLUS [1 Month, UPI Made] — 3 Days Warranty — $2.50 🎁\n🤖 ChatGPT PLUS [1 Month, UPI Made] — Full Warranty — $5.00 🎁\n⏸️ ElevenLabs Creator 1 Month PromoCode (130,000 Credits) — $2.20\n\nUse /buy to purchase credits for self-verification instead.`;
    await ctx.reply(text, {
        reply_markup: getShopMenu(),
        parse_mode: "Markdown"
    });
});

commands.command('buy', async (ctx) => {
    const text = `⬇️ Choose a quantity below or enter a custom amount:`;
    await ctx.reply(text, { 
        reply_markup: getBuyCreditsMenu(), 
        parse_mode: "Markdown" 
    });
});
