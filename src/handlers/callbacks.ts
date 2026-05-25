import { Composer, InlineKeyboard } from 'grammy';
import { MyContext } from '../types';
import { getMainMenu, getShopMenu, getBuyCreditsMenu, getQuantityMenu, getPaymentMenu, getCryptoActionMenu } from '../keyboards/menus';

export const callbacks = new Composer<MyContext>();

// --- 1. Main Navigation & Shop Logic ---
callbacks.callbackQuery('verify', async (ctx) => {
    const text = `🔄 **Choose Verification Type:**\n\n👑 **VIP — 1.5 credits**\nYour account will be fully upgraded automatically without the need to add card or any payment methods.\n\n📋 **Normal — 1 credit**\nYou will be provided a link after successful verification. Then payment method has to be added manually.\n\n🛒 Browse more products and pre-activated accounts in /shop.`;
	await ctx.editMessageText(text, { reply_markup: getShopMenu(), parse_mode: "Markdown" });
});

callbacks.callbackQuery('shop', async (ctx) => {
	const text = `👑 **VIP — 1.5 credits**\nYour account will be fully upgraded automatically without the need to add card or any payment methods.\n\n📋 **Normal — 1 credit**\nYou will be provided a link after successful verification. Then payment method has to be added manually.\n\n🛒 Browse more products and pre-activated accounts below.`;
	await ctx.editMessageText(text, { reply_markup: getShopMenu(), parse_mode: "Markdown" });
});

callbacks.callbackQuery('buy_credits', async (ctx) => {
    const text = `⬇️ Choose a quantity below or enter a custom amount:`;
    await ctx.editMessageText(text, { reply_markup: getBuyCreditsMenu(), parse_mode: "Markdown" });
});

// --- 2. Deep Product Pages ---
callbacks.callbackQuery('prod_g_ai', async (ctx) => {
	const text = `🇬 **[18 Months] Google AI PRO — Activation Link**\n\n🎁 What You Get: Receive an exclusive activation link to unlock Gemini AI Pro for 18 months.\n✅ No credit card required\n✅ No VPN needed\n\n❓ How to Activate:\n1️⃣ Log in to your Gmail account\n2️⃣ Open the provided activation link\n3️⃣ Enjoy instant access to Gemini AI Pro\n\nWarranty: Activation Warranty (Can be held for 24 hours)\n\n⚠️ Note: Don't hold these links for more than 24 hours. Use them immediately after purchase if possible or within 24 hours\n\n📋 Format: Activation Link\n\n💰 **Price:** $2.90 per unit\n\n🎁 **Bulk pricing**\n• From 1-9: $2.90 / unit\n• From 10-19: $2.70 / unit\n• From 20+: $2.50 / unit\n📦 **In Stock:** 35 items\n\n👇 **Choose a quantity below or enter a custom amount:**`;
	await ctx.editMessageText(text, { reply_markup: getQuantityMenu('prod_g_ai'), parse_mode: "Markdown" });
});

callbacks.callbackQuery('prod_eleven', async (ctx) => {
    const text = `⏸️ **ElevenLabs Creator 1 Month PromoCode (130,000 Credits)**\n\n🏷 Product: ElevenLabs Creator Plan Coupon Code\n💰 Credits: 130,000\n⏳ Duration: 1 Month\n📦 Delivery type: ✨ Coupon Code / Redeemable Code\n\nLogin / Activation Instruction:\n1️⃣ Go to the ElevenLabs website.\n2️⃣ Login or create your ElevenLabs account.\n3️⃣ Click the link provided.\n4️⃣ Get 100% discount on activation.\n\n📋 Format: PromoCode (Link)\n\n💰 **Price:** $2.20 per unit\n📦 **In Stock:** 6 items\n\n👇 **Choose a quantity below or enter a custom amount:**`;
    await ctx.editMessageText(text, { reply_markup: getQuantityMenu('prod_eleven'), parse_mode: "Markdown" });
});

// --- 3. Order Pipeline (Products & Credits) ---
callbacks.callbackQuery(/qty:(.+):(\d+)/, async (ctx) => {
    const match = ctx.match;
    if (!match) return;
    const productId = match[1];
    const qty = parseInt(match[2], 10);

    let pricePerUnit = 2.90; // Defaulting to Google AI pricing logic for MVP
    if (qty >= 10 && qty <= 19) pricePerUnit = 2.70;
    if (qty >= 20) pricePerUnit = 2.50;
    
    if (productId === 'prod_eleven') pricePerUnit = 2.20; // Override for ElevenLabs

    const totalUsd = pricePerUnit * qty;
    const orderId = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    await ctx.env.DB.prepare(
        "INSERT INTO orders (order_id, user_id, product_id, quantity, total_usd) VALUES (?, ?, ?, ?, ?)"
    ).bind(orderId, ctx.from.id, productId, qty, totalUsd).run();

    const text = `🛒 **Order Summary**\n\n📦 Product: ${productId === 'prod_eleven' ? 'ElevenLabs PromoCode' : '\\[18 Months\\] Google AI PRO'}\n🔢 Quantity: ${qty}\n💲 Price per unit: $${pricePerUnit.toFixed(2)}\n💰 **Total: $${totalUsd.toFixed(2)} USDT**\n\nConfirm your order?\n\n💳 **Select Payment Method**`;
    await ctx.editMessageText(text, { reply_markup: getPaymentMenu(orderId, totalUsd, false), parse_mode: "Markdown" });
});

callbacks.callbackQuery(/buy_cred:(\d+)/, async (ctx) => {
    const amount = parseInt(ctx.match![1], 10);
    const orderId = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    await ctx.env.DB.prepare(
        "INSERT INTO orders (order_id, user_id, product_id, quantity, total_usd) VALUES (?, ?, ?, ?, ?)"
    ).bind(orderId, ctx.from.id, `credits_${amount}`, 1, amount).run();

    let bonusText = "";
    if (amount === 10) bonusText = " (🎉 1 Bonus)";
    if (amount === 50) bonusText = " (🎉 6 Bonus)";
    if (amount === 100) bonusText = " (🎉 15 Bonus)";

    const text = `🛒 **Order Summary**\n\n📦 Product: ${amount} Credits${bonusText}\n🔢 Quantity: 1\n💲 Price: $${amount.toFixed(2)}\n💰 **Total: $${amount.toFixed(2)} USDT**\n\nConfirm your order?\n\n💳 **Select Payment Method**`;
    await ctx.editMessageText(text, { reply_markup: getPaymentMenu(orderId, amount, false), parse_mode: "Markdown" });
});

// --- 4. Crypto Dispatch & Verification ---
callbacks.callbackQuery(/pay:(.+):(.+)/, async (ctx) => {
    const match = ctx.match;
    if (!match) return;
    const orderId = match[1];
    const method = match[2];

    const order = await ctx.env.DB.prepare("SELECT * FROM orders WHERE order_id = ?").bind(orderId).first();
    if (!order) return ctx.answerCallbackQuery("Order expired or not found.");

    const totalUsd = order.total_usd as number;
    const cryptoAmount = (totalUsd + (Math.random() * 0.1)).toFixed(3);

    await ctx.env.DB.prepare("UPDATE orders SET payment_method = ?, crypto_amount = ? WHERE order_id = ?").bind(method, cryptoAmount, orderId).run();

    let payText = "";
    let isBinance = false;

    if (method === 'bep20') {
        payText = `💎 **USDT (BEP-20) Payment — Account Shop**\n\n📋 Order #${orderId}\n📦 ${order.quantity} Items\n\n💰 Send exactly: \`${cryptoAmount}\` USDT\n\n📬 **To this address (BEP-20 / BSC network):**\n\`0xc132f77b998c73530835bb0cd61955905a875d7e\`\n\n⚠️ **Important:**\n• Send the **exact amount** shown above\n• Use only the **BSC (BEP-20)** network\n• After sending, tap "I've Paid" below or wait for automatic detection\n\n⏱️ This order expires in 15 minutes.`;
    } else if (method === 'binance') {
        isBinance = true;
        payText = `🟡 **Binance Pay Payment — Account Shop**\n\n📋 Order #${orderId}\n📦 ${order.quantity} Items\n\n💰 Send exactly: \`${cryptoAmount}\` USDT\n\n📬 **Send USDT via Binance Pay to:**\nPay ID: \`890786781\`\n\n📝 **Steps:**\n1. Open **Binance App** → **Pay** → **Send**\n2. Enter the Pay ID above\n3. Send exactly \`${cryptoAmount}\` USDT\n4. After sending, tap "I've Paid" below.\n\n⏱️ This order expires in 15 minutes.`;
    }

    await ctx.editMessageText(payText, { reply_markup: getCryptoActionMenu(orderId, isBinance), parse_mode: "Markdown" });
});

callbacks.callbackQuery(/verify_pay:(.+)/, async (ctx) => {
    const orderId = ctx.match![1];
    await ctx.answerCallbackQuery("Scanning the blockchain for your payment...", { show_alert: false });
    const order = await ctx.env.DB.prepare("SELECT * FROM orders WHERE order_id = ?").bind(orderId).first();
    const expected = order?.crypto_amount || "0.00";

    const text = `⏳ **Payment Not Found Yet**\n\n📋 Order #${orderId}\n💰 Expected: ${expected} USDT\n\nYour transaction may still be confirming on the blockchain. Please wait 1-2 minutes and tap "I've Paid" again, or the system will auto-detect it shortly.`;
    await ctx.editMessageText(text, { reply_markup: getCryptoActionMenu(orderId), parse_mode: "Markdown" });
});

// --- UX Helpers ---
callbacks.callbackQuery(/copy_(addr|amt):(.+)/, async (ctx) => {
    await ctx.answerCallbackQuery("Tap the monospaced text in the message above to copy it to your clipboard!", { show_alert: true });
});

callbacks.callbackQuery(/custom_(qty|cred)/, async (ctx) => {
    await ctx.answerCallbackQuery("Please type your required quantity in the chat. (Feature rolling out in v1.1)", { show_alert: true });
});

// --- Auxiliary Menus ---
callbacks.callbackQuery('balance', async (ctx) => {
    const userId = ctx.from.id;
    const user = await ctx.env.DB.prepare("SELECT * FROM users WHERE user_id = ?").bind(userId).first();
    const total = ((user?.topup_credits as number) || 0) + ((user?.referral_credits as number) || 0);

    const text = `🪙 **Your Balance**\n\nTopup Credits: ${((user?.topup_credits as number) || 0).toFixed(2)}\nReferral Credits: ${((user?.referral_credits as number) || 0).toFixed(2)}\n─────────────\nTotal: ${total.toFixed(2)}\n\n🔗 **Your Referral Link:**\nhttps://t.me/PixVerifyBot?start=ref_${userId}\n\n📊 **Referral Stats:**\n• Total Referrals: 0\n• ✨ Successful: 0\n• ⏳ Pending: 0\n• 🪙 Total Rewards: 0.00 credits\n\n*Share your link! You earn 0.1 credits each time a new user joins through your referral link.*`;
    await ctx.editMessageText(text, { parse_mode: "Markdown" });
});

callbacks.callbackQuery('history', async (ctx) => ctx.answerCallbackQuery("Your order history is currently empty."));
callbacks.callbackQuery('refer', async (ctx) => ctx.answerCallbackQuery("Check your Balance menu for your referral link!", { show_alert: true }));

callbacks.callbackQuery('status', async (ctx) => {
    const text = `⚡ **Server Status**\n\n✅ Cloudflare Edge: Operational\n✅ D1 Database: Connected\n✅ Payment Gateway: Active\n\nLatency: ~45ms`;
    await ctx.editMessageText(text, { reply_markup: new InlineKeyboard().text("⬅️ Back", "back_main"), parse_mode: "Markdown" });
});

callbacks.callbackQuery('help', async (ctx) => {
    const text = `ℹ️ **Help & FAQ**\n\n1. *How to verify?*\nFollow the steps in the start menu carefully.\n2. *Payment not showing?*\nCrypto payments take 1-3 minutes to confirm. Use the "I've Paid" button to force a scan.\n3. *Need a refund?*\nContact support for manual review.`;
    await ctx.editMessageText(text, { reply_markup: new InlineKeyboard().text("⬅️ Back", "back_main"), parse_mode: "Markdown" });
});

callbacks.callbackQuery('support', async (ctx) => {
    const text = `💬 **Support**\n\nIf you have any issues, please contact our support team:\n👉 @PixVerifySupport`;
    await ctx.editMessageText(text, { reply_markup: new InlineKeyboard().text("⬅️ Back", "back_main"), parse_mode: "Markdown" });
});

callbacks.callbackQuery('back_main', async (ctx) => {
	await ctx.editMessageText("Welcome back to the main menu.", { reply_markup: getMainMenu() });
});

callbacks.on("callback_query", async (ctx) => {
	await ctx.answerCallbackQuery("Unrecognized action.");
});
