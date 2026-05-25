import { InlineKeyboard } from 'grammy';

export const getMainMenu = () => {
	return new InlineKeyboard()
		.text("1️⃣ Start Verification", "verify").text("🛒 Shop", "shop").row()
		.text("💳 Buy Credits", "buy_credits").text("💰 Balance", "balance").row()
		.text("📜 History", "history").text("⚡ Server Status", "status").row()
		.text("🎁 Refer & Earn", "refer").text("ℹ️ Help", "help").row()
		.text("💬 Support", "support");
};

export const getShopMenu = () => {
	return new InlineKeyboard()
		.text("👑 VIP — 1.5 credits (Full subscription)", "prod_vip").row()
		.text("📋 Normal — 1 credit (Link extraction)", "prod_normal").row()
		.text("🇬 [18 Months] Google AI PRO — Activation Link", "prod_g_ai").row()
		.text("🤖 ChatGPT PLUS [1 Month, UPI Made] — No wa", "prod_gpt_nowa").row()
		.text("🤖 ChatGPT PLUS [1 Month, UPI Made] — 3 Days", "prod_gpt_3d").row()
		.text("⬅️ Back", "back_main");
};

export const getProductMenu = () => {
	return new InlineKeyboard()
		.text("1", "buy_1").text("2", "buy_2").text("3", "buy_3").text("5", "buy_5").row()
		.text("✏️ Custom Quantity", "custom_qty").row()
		.text("⬅️ Back to Shop", "shop").text("❌ Cancel", "back_main");
};

export const getPaymentMenu = () => {
	return new InlineKeyboard()
		.text("🪙 Pay with Credits ($2.90)", "pay_credits").row()
		.text("🟡 Binance Pay (✅ Automatic)", "pay_binance").row()
		.text("🔵 USDT (BEP-20) (✅ Automatic)", "pay_usdt_bep").row()
		.text("🔴 USDT (TRC-20) (✅ Automatic)", "pay_usdt_trc").row()
		.text("❌ Cancel", "back_main");
};
