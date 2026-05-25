import { Composer } from 'grammy';
import { MyContext } from '../types';
import { getMainMenu, getShopMenu, getQuantityMenu, getPaymentMenu, getCryptoActionMenu } from '../keyboards/menus';

export const callbacks = new Composer<MyContext>();

// --- 1. Account Balance ---
callbacks.callbackQuery('balance', async (ctx) => {
    const userId = ctx.from.id;
    // Query D1 for exact balances
    const user = await ctx.env.DB.prepare("SELECT * FROM users WHERE user_id = ?").bind(userId).first();
    
    const topup = (user?.topup_credits as number) || 0;
    const ref = (user?.referral_credits as number) || 0;
    const total = topup + ref;

    const balanceText = `🪙 **Your Balance**\n\nTopup Credits: ${topup.toFixed(2)}\nReferral Credits: ${ref.toFixed(2)}\n─────────────\nTotal: ${total.toFixed(2)}\n\n🔗 **Your Referral Link:**\nhttps://t.me/PixVerifyBot?start=ref_${userId}\n\n📊 **Referral Stats:**\n• Total Referrals: 0\n• ✨ Successful: 0\n• ⏳ Pending: 0\n• 🪙 Total Rewards: 0.00 credits\n\n*Share your link! You earn 0.1 credits each time a new user joins through your referral link.*`;

    await ctx.editMessageText(balanceText, { parse_mode: "Markdown" });
});

callbacks.callbackQuery('shop', async (ctx) => {
	const shopText = `👑 **VIP — 1.5 credits**\nYour account will be fully upgraded automatically without the need to add card or any payment methods.\n\n📋 **Normal — 1 credit**\nYou will be provided a link after successful verification. Then payment method has to be added manually.\n\n🛒 Browse more products and pre-activated accounts in /shop.`;
	await ctx.editMessageText(shopText, { reply_markup: getShopMenu(), parse_mode: "Markdown" });
});

callbacks.callbackQuery('prod_g_ai', async (ctx) => {
	const prodText = `🎁 What You Get: Receive an exclusive activation link to unlock Gemini AI Pro for 18 months.\n✅ No credit card required\n✅ No VPN needed\n\n❓ How to Activate:\n1️⃣ Log in to your Gmail account\n2️⃣ Open the provided activation link\n3️⃣ Enjoy instant access to Gemini AI Pro\n\n⚠️ Note: Don't hold these links for more than 24 hours. Use them immediately after purchase if possible or within 24 hours\n\n📋 Format: Activation Link\n\n💰 **Price:** $2.90 per unit\n\n🎁 **Bulk pricing**\n• From 1-9: $2.90 / unit\n• From 10-19: $2.70 / unit\n• From 20+: $2.50 / unit\n📦 **In Stock:** 35 items\n\n👇 **Choose a quantity below or enter a custom amount:**`;
	
	await ctx.editMessageText(prodText, { reply_markup: getQuantityMenu('prod_g_ai'), parse_mode: "Markdown" });
});

// --- 2. Order Generation & Checkout ---
callbacks.callbackQuery(/qty:(.+):(\d+)/, async (ctx) => {
    const match = ctx.match;
    if (!match) return;
    const productId = match[1];
    const qty = parseInt(match[2], 10);

    // Calculate Price Tier
    let pricePerUnit = 2.90;
    if (qty >= 10 && qty <= 19) pricePerUnit = 2.70;
    if (qty >= 20) pricePerUnit = 2.50;
    const totalUsd = pricePerUnit * qty;

    // Generate Order ID (e.g., 3020205835)
    const orderId = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    // Persist to D1
    await ctx.env.DB.prepare(
        "INSERT INTO orders (order_id, user_id, product_id, quantity, total_usd) VALUES (?, ?, ?, ?, ?)"
    ).bind(orderId, ctx.from.id, productId, qty, totalUsd).run();

    const checkoutText = `🛒 **Order Summary**\n\n📦 Product: \\[18 Months\\] Google AI PRO — Activation Link\n🔢 Quantity: ${qty}\n💲 Price per unit: $${pricePerUnit.toFixed(2)}\n💰 **Total: $${totalUsd.toFixed(2)} USDT**\n\nConfirm your order?\n\n💳 **Select Payment Method**`;

    // Assuming user has 0 balance for this MVP step
    await ctx.editMessageText(checkoutText, { reply_markup: getPaymentMenu(orderId, totalUsd, false), parse_mode: "Markdown" });
});

// --- 3. Crypto Payment Dispatcher ---
callbacks.callbackQuery(/pay:(.+):(.+)/, async (ctx) => {
    const match = ctx.match;
    if (!match) return;
    const orderId = match[1];
    const method = match[2];

    // Fetch order from D1
    const order = await ctx.env.DB.prepare("SELECT * FROM orders WHERE order_id = ?").bind(orderId).first();
    if (!order) return ctx.answerCallbackQuery("Order expired or not found.");

    const totalUsd = order.total_usd as number;
    const qty = order.quantity as number;
    
    // Slight crypto offset to identify payments easily (e.g. 14.50 -> 14.593)
    const cryptoAmount = (totalUsd + (Math.random() * 0.1)).toFixed(3);

    // Update order with payment method
    await ctx.env.DB.prepare(
        "UPDATE orders SET payment_method = ?, crypto_amount = ? WHERE order_id = ?"
    ).bind(method, cryptoAmount, orderId).run();

    let payText = "";
    if (method === 'bep20') {
        payText = `💎 **USDT (BEP-20) Payment — Account Shop**\n\n📋 Order #${orderId}\n📦 ${qty} 18 Months Google AI PRO — Activation Links\n\n💰 Send exactly: \`${cryptoAmount}\` USDT\n\n📬 **To this address (BEP-20 / BSC network):**\n\`0xc132f77b998c73530835bb0cd61955905a875d7e\`\n\n⚠️ **Important:**\n• Send the **exact amount** shown above\n• Use only the **BSC (BEP-20)** network\n• After sending, tap "I've Paid" below or wait for automatic detection\n\n⏱️ This order expires in 15 minutes.`;
    } else if (method === 'binance') {
        payText = `🟡 **Binance Pay Payment — Account Shop**\n\n📋 Order #${orderId}\n📦 ${qty} 18 Months Google AI PRO — Activation Links\n\n💰 Send exactly: \`${cryptoAmount}\` USDT\n\n📬 **Send USDT via Binance Pay to:**\nPay ID: \`890786781\`\n\n📝 **Steps:**\n1. Open **Binance App** → **Pay** → **Send**\n2. Enter the Pay ID above\n3. Send exactly \`${cryptoAmount}\` USDT\n4. After sending, tap "I've Paid" below.\n\n⏱️ This order expires in 15 minutes.`;
    } else {
        return ctx.answerCallbackQuery("Method in development.");
    }

    await ctx.editMessageText(payText, { reply_markup: getCryptoActionMenu(orderId), parse_mode: "Markdown" });
});

// --- 4. Payment Verification (MVP Blockchain Scan) ---
callbacks.callbackQuery(/verify_pay:(.+)/, async (ctx) => {
    const orderId = ctx.match![1];
    
    // Simulate UI interaction exactly as requested
    await ctx.answerCallbackQuery("Scanning the blockchain for your payment...", { show_alert: false });

    // Fetch order to get exact expected amount
    const order = await ctx.env.DB.prepare("SELECT * FROM orders WHERE order_id = ?").bind(orderId).first();
    const expected = order?.crypto_amount || "0.00";

    const scanningText = `⏳ **Payment Not Found Yet**\n\n📋 Order #${orderId}\n💰 Expected: ${expected} USDT\n\nYour transaction may still be confirming on the blockchain. Please wait 1-2 minutes and tap "I've Paid" again, or the system will auto-detect it shortly.`;
    
    // We retain the same button menu so they can click it again
    await ctx.editMessageText(scanningText, { reply_markup: getCryptoActionMenu(orderId), parse_mode: "Markdown" });
});

callbacks.callbackQuery('back_main', async (ctx) => {
	await ctx.editMessageText("Welcome back to the main menu.", { reply_markup: getMainMenu() });
});

// Fallback
callbacks.on("callback_query", async (ctx) => {
	await ctx.answerCallbackQuery("Unrecognized action.");
});
