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

// Dynamic Quantity Builder
export const getQuantityMenu = (productId: string) => {
	return new InlineKeyboard()
		.text("1", `qty:${productId}:1`)
		.text("2", `qty:${productId}:2`)
		.text("3", `qty:${productId}:3`)
		.text("5", `qty:${productId}:5`)
		.text("10", `qty:${productId}:10`).row()
		.text("15", `qty:${productId}:15`)
		.text("18", `qty:${productId}:18`)
		.text("20", `qty:${productId}:20`).row()
		.text("✏️ Custom Quantity", `custom_qty:${productId}`).row()
		.text("⬅️ Back to Shop", "shop")
		.text("❌ Cancel", "back_main");
};

// Dynamic Payment Menu bounded to Order ID
export const getPaymentMenu = (orderId: string, totalUsd: number, hasEnoughBalance: boolean) => {
	const kb = new InlineKeyboard();
    if (hasEnoughBalance) {
        kb.text(`🪙 Pay with Credits ($${totalUsd.toFixed(2)})`, `pay:${orderId}:credits`).row();
    } else {
        kb.text(`🪙 Pay with Credits ($${totalUsd.toFixed(2)}) — Insufficient`, `noop`).row();
    }
	
	kb.text("🟡 Binance Pay (✅ Automatic)", `pay:${orderId}:binance`).row()
	  .text("🔵 USDT (BEP-20) (✅ Automatic)", `pay:${orderId}:bep20`).row()
	  .text("🔴 USDT (TRC-20) (✅ Automatic)", `pay:${orderId}:trc20`).row()
	  .text("❌ Cancel", "back_main");
	
	return kb;
};

// Payment Actions
export const getCryptoActionMenu = (orderId: string) => {
    return new InlineKeyboard()
        .text("📋 Copy Address", `copy_addr:${orderId}`)
        .text("📋 Copy Amount", `copy_amt:${orderId}`).row()
        .text("✅ I've Paid", `verify_pay:${orderId}`).row()
        .text("❌ Cancel", "back_main");
};
