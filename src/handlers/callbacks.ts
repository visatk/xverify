import { Composer } from 'grammy';
import { MyContext } from '../types';
import { getMainMenu, getShopMenu, getProductMenu, getPaymentMenu } from '../keyboards/menus';

export const callbacks = new Composer<MyContext>();

callbacks.callbackQuery('check_sub', async (ctx) => {
	await ctx.answerCallbackQuery("Checking subscription...");
	await ctx.reply("Subscription verified. Click /start to begin.");
});

callbacks.callbackQuery('shop', async (ctx) => {
	const shopText = `👑 **VIP — 1.5 credits**\nYour account will be fully upgraded automatically without the need to add card or any payment methods.\n\n📋 **Normal — 1 credit**\nYou will be provided a link after successful verification. Then payment method has to be added manually.\n\n🛒 Browse more products and pre-activated accounts below.`;
	await ctx.editMessageText(shopText, {
		reply_markup: getShopMenu(),
		parse_mode: "Markdown"
	});
});

callbacks.callbackQuery('prod_g_ai', async (ctx) => {
	const prodText = `⚠️ Note: Don't hold these links for more than 24 hours. Use them immediately after purchase if possible or within 24 hours\n\n📋 Format: Activation Link\n\n💰 **Price:** $2.90 per unit\n\n🎁 **Bulk pricing**\n• From 1-9: $2.90 / unit\n• From 10-19: $2.70 / unit\n• From 20+: $2.50 / unit\n📦 **In Stock:** 35 items\n\n👇 **Choose a quantity below or enter a custom amount:**`;
	await ctx.editMessageText(prodText, {
		reply_markup: getProductMenu(),
		parse_mode: "Markdown"
	});
});

callbacks.callbackQuery('buy_1', async (ctx) => {
	const checkoutText = `🛒 **Order Summary**\n\n📦 Product: \\[18 Months\\] Google AI PRO — Activation Link\n🔢 Quantity: 1\n💲 Price per unit: $2.90\n💰 **Total: $2.90 USDT**\n\n💳 **Select Payment Method**`;
	await ctx.editMessageText(checkoutText, {
		reply_markup: getPaymentMenu(),
		parse_mode: "Markdown"
	});
});

callbacks.callbackQuery('back_main', async (ctx) => {
	await ctx.editMessageText("Welcome back to the main menu.", { reply_markup: getMainMenu() });
});

// Enforce Lean MVP: Catch-all for unhandled routes
callbacks.on("callback_query", async (ctx) => {
	await ctx.answerCallbackQuery("Feature coming in v1.1.");
});
