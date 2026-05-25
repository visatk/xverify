import { Composer } from 'grammy';
import { MyContext } from '../types';
import { getMainMenu, getShopMenu, getBuyCreditsMenu } from '../keyboards/menus';

export const commands = new Composer<MyContext>();

commands.command('start', async (ctx) => {
    const payload = ctx.match; // captures e.g. "ref_12345"
    let inviterId = null;
    if (payload && payload.startsWith('ref_')) {
        inviterId = parseInt(payload.replace('ref_', ''), 10);
    }
    
	await ctx.env.DB.prepare(
		"INSERT OR IGNORE INTO users (user_id, username) VALUES (?, ?)"
	).bind(ctx.from?.id, ctx.from?.username || "").run();

    // In a future update, you could insert the `inviterId` into a referrals tracking table here.

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
