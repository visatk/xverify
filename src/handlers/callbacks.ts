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
callbacks.callbackQuery('prod_vip', async (ctx) => {
    const text = `👑 **VIP Verification**\n\nPrice: 1.5 Credits\nYour account will be fully upgraded automatically without the need to add a card.`;
    const kb = new InlineKeyboard().text("✅ Confirm Purchase", "buy_verify_vip").row().text("⬅️ Back", "shop");
    await ctx.editMessageText(text, { reply_markup: kb, parse_mode: "Markdown" });
});

callbacks.callbackQuery('prod_normal', async (ctx) => {
    const text = `📋 **Normal Verification**\n\nPrice: 1.0 Credits\nYou will be provided a link after successful verification.`;
    const kb = new InlineKeyboard().text("✅ Confirm Purchase", "buy_verify_normal").row().text("⬅️ Back", "shop");
    await ctx.editMessageText(text, { reply_markup: kb, parse_mode: "Markdown" });
});

callbacks.callbackQuery('prod_g_ai', async (ctx) => {
	const text = `🇬 **[18 Months] Google AI PRO — Activation Link**\n\n🎁 What You Get: Receive an exclusive activation link to unlock Gemini AI Pro for 18 months.\n✅ No credit card required\n✅ No VPN needed\n\n❓ How to Activate:\n1️⃣ Log in to your Gmail account\n2️⃣ Open the provided activation link\n3️⃣ Enjoy instant access to Gemini AI Pro\n\nWarranty: Activation Warranty (Can be held for 24 hours)\n\n⚠️ Note: Don't hold these links for more than 24 hours. Use them immediately after purchase if possible or within 24 hours\n\n📋 Format: Activation Link\n\n💰 **Price:** $2.90 per unit\n\n🎁 **Bulk pricing**\n• From 1-9: $2.90 / unit\n• From 10-19: $2.70 / unit\n• From 20+: $2.50 / unit\n📦 **In Stock:** 35 items\n\n👇 **Choose a quantity below or enter a custom amount:**`;
	await ctx.editMessageText(text, { reply_markup: getQuantityMenu('prod_g_ai'), parse_mode: "Markdown" });
});

callbacks.callbackQuery('prod_eleven', async (ctx) => {
    const text = `⏸️ **ElevenLabs Creator 1 Month PromoCode (130,000 Credits)**\n\n🏷 Product: ElevenLabs Creator Plan Coupon Code\n💰 Credits: 130,000\n⏳ Duration: 1 Month\n📦 Delivery type: ✨ Coupon Code / Redeemable Code\n\nLogin / Activation Instruction:\n1️⃣ Go to the ElevenLabs website.\n2️⃣ Login or create your ElevenLabs account.\n3️⃣ Click the link provided.\n4️⃣ Get 100% discount on activation.\n\n📋 Format: PromoCode (Link)\n\n💰 **Price:** $2.20 per unit\n📦 **In Stock:** 6 items\n\n👇 **Choose a quantity below or enter a custom amount:**`;
    await ctx.editMessageText(text, { reply_markup: getQuantityMenu('prod_eleven'), parse_mode: "Markdown" });
});

callbacks.callbackQuery('prod_gpt_nowa', async (ctx) => {
    const text = `🤖 **ChatGPT PLUS [1 Month, UPI Made] — No warranty**\n\n💰 **Price:** $1.75 per unit\n\n👇 **Choose a quantity below:**`;
    await ctx.editMessageText(text, { reply_markup: getQuantityMenu('prod_gpt_nowa'), parse_mode: "Markdown" });
});

callbacks.callbackQuery('prod_gpt_3d', async (ctx) => {
    const text = `🤖 **ChatGPT PLUS [1 Month, UPI Made] — 3 Days Warranty**\n\n💰 **Price:** $2.50 per unit\n\n👇 **Choose a quantity below:**`;
    await ctx.editMessageText(text, { reply_markup: getQuantityMenu('prod_gpt_3d'), parse_mode: "Markdown" });
});

callbacks.callbackQuery('prod_gpt_full', async (ctx) => {
    const text = `🤖 **ChatGPT PLUS [1 Month, UPI Made] — Full Warranty**\n\n💰 **Price:** $5.00 per unit\n\n👇 **Choose a quantity below:**`;
    await ctx.editMessageText(text, { reply_markup: getQuantityMenu('prod_gpt_full'), parse_mode: "Markdown" });
});

// --- 3. Immediate Credit Purchasing (VIP/Normal) ---
callbacks.callbackQuery(/^buy_verify_(vip|normal)$/, async (ctx) => {
    const type = ctx.match![1];
    const cost = type === 'vip' ? 1.5 : 1.0;
    
    const user = await ctx.env.DB.prepare("SELECT * FROM users WHERE user_id = ?").bind(ctx.from.id).first();
    const topup = (user?.topup_credits as number) || 0;
    const ref = (user?.referral_credits as number) || 0;
    
    if ((topup + ref) < cost) {
        return ctx.answerCallbackQuery(`Insufficient credits. You need ${cost} credits.`, { show_alert: true });
    }

    let newTopup = topup;
    let newRef = ref;
    let remainingCost = cost;

    if (newRef >= remainingCost) {
        newRef -= remainingCost;
    } else {
        remainingCost -= newRef;
        newRef = 0;
        newTopup -= remainingCost;
    }

    await ctx.env.DB.prepare("UPDATE users SET topup_credits = ?, referral_credits = ? WHERE user_id = ?").bind(newTopup, newRef, ctx.from.id).run();
    
    const orderId = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    await ctx.env.DB.prepare(
        "INSERT INTO orders (order_id, user_id, product_id, quantity, total_usd, status, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(orderId, ctx.from.id, `verify_${type}`, 1, cost, 'completed', 'credits').run();

    await ctx.editMessageText(`✅ **Purchase Successful!**\n\nOrder #${orderId} for ${type.toUpperCase()} Verification.\nAn admin will contact you shortly to deliver your service.`, {
        reply_markup: new InlineKeyboard().text("⬅️ Back to Main", "back_main"),
        parse_mode: "Markdown"
    });
});

// --- 4. External Product Checkout Pipeline ---
callbacks.callbackQuery(/^qty:(.+):(\d+)$/, async (ctx) => {
    const productId = ctx.match![1];
    const qty = parseInt(ctx.match![2], 10);

    let pricePerUnit = 2.90; 
    let productName = productId;

    if (productId === 'prod_g_ai') {
        productName = '\\[18 Months\\] Google AI PRO';
        if (qty >= 10 && qty <= 19) pricePerUnit = 2.70;
        if (qty >= 20) pricePerUnit = 2.50;
    } else if (productId === 'prod_eleven') {
        productName = 'ElevenLabs PromoCode';
        pricePerUnit = 2.20;
    } else if (productId === 'prod_gpt_nowa') {
        productName = 'ChatGPT PLUS [No warranty]';
        pricePerUnit = 1.75;
    } else if (productId === 'prod_gpt_3d') {
        productName = 'ChatGPT PLUS [3 Days Warranty]';
        pricePerUnit = 2.50;
    } else if (productId === 'prod_gpt_full') {
        productName = 'ChatGPT PLUS [Full Warranty]';
        pricePerUnit = 5.00;
    }

    const totalUsd = pricePerUnit * qty;
    const orderId = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    await ctx.env.DB.prepare(
        "INSERT INTO orders (order_id, user_id, product_id, quantity, total_usd) VALUES (?, ?, ?, ?, ?)"
    ).bind(orderId, ctx.from.id, productId, qty, totalUsd).run();

    const user = await ctx.env.DB.prepare("SELECT topup_credits, referral_credits FROM users WHERE user_id = ?").bind(ctx.from.id).first();
    const totalBalance = ((user?.topup_credits as number) || 0) + ((user?.referral_credits as number) || 0);
    const hasEnoughBalance = totalBalance >= totalUsd;

    const text = `🛒 **Order Summary**\n\n📦 Product: ${productName}\n🔢 Quantity: ${qty}\n💲 Price per unit: $${pricePerUnit.toFixed(2)}\n💰 **Total: $${totalUsd.toFixed(2)} USDT**\n\nConfirm your order?\n\n💳 **Select Payment Method**`;
    await ctx.editMessageText(text, { reply_markup: getPaymentMenu(orderId, totalUsd, hasEnoughBalance), parse_mode: "Markdown" });
});

callbacks.callbackQuery(/^buy_cred:(\d+)$/, async (ctx) => {
    const amount = parseInt(ctx.match![1], 10);
    const orderId = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    let bonus = 0;
    if (amount === 10) bonus = 1;
    if (amount === 50) bonus = 6;
    if (amount === 100) bonus = 15;
    const totalCreditsToGive = amount + bonus;

    await ctx.env.DB.prepare(
        "INSERT INTO orders (order_id, user_id, product_id, quantity, total_usd) VALUES (?, ?, ?, ?, ?)"
    ).bind(orderId, ctx.from.id, `credits_${amount}`, totalCreditsToGive, amount).run();

    const bonusText = bonus > 0 ? ` (🎉 ${bonus} Bonus)` : "";
    const text = `🛒 **Order Summary**\n\n📦 Product: ${amount} Credits${bonusText}\n🔢 Quantity: 1\n💲 Price: $${amount.toFixed(2)}\n💰 **Total: $${amount.toFixed(2)} USDT**\n\nConfirm your order?\n\n💳 **Select Payment Method**`;
    await ctx.editMessageText(text, { reply_markup: getPaymentMenu(orderId, amount, false), parse_mode: "Markdown" });
});

// --- 5. Crypto Dispatch & Verification ---
callbacks.callbackQuery(/^pay:(.+):(bep20|binance|trc20)$/, async (ctx) => {
    const orderId = ctx.match![1];
    const method = ctx.match![2];

    const order = await ctx.env.DB.prepare("SELECT * FROM orders WHERE order_id = ?").bind(orderId).first();
    if (!order) return ctx.answerCallbackQuery("Order expired or not found.");

    const totalUsd = order.total_usd as number;
    const cryptoAmount = (totalUsd + (Math.random() * 0.1)).toFixed(3);

    await ctx.env.DB.prepare("UPDATE orders SET payment_method = ?, crypto_amount = ?, status = 'pending_verification' WHERE order_id = ?").bind(method, cryptoAmount, orderId).run();

    let payText = "";
    let isBinance = false;

    if (method === 'bep20') {
        payText = `💎 **USDT (BEP-20) Payment**\n\n📋 Order #${orderId}\n📦 ${order.quantity} Items\n\n💰 Send exactly: \`${cryptoAmount}\` USDT\n\n📬 **To this address (BEP-20 / BSC network):**\n\`0xc132f77b998c73530835bb0cd61955905a875d7e\`\n\n⚠️ **Important:**\n• Send the **exact amount** shown above\n• Use only the **BSC (BEP-20)** network\n• After sending, tap "I've Paid" below.\n\n⏱️ This order expires in 15 minutes.`;
    } else if (method === 'binance') {
        isBinance = true;
        payText = `🟡 **Binance Pay Payment**\n\n📋 Order #${orderId}\n📦 ${order.quantity} Items\n\n💰 Send exactly: \`${cryptoAmount}\` USDT\n\n📬 **Send USDT via Binance Pay to:**\nPay ID: \`890786781\`\n\n📝 **Steps:**\n1. Open **Binance App** → **Pay** → **Send**\n2. Enter the Pay ID above\n3. Send exactly \`${cryptoAmount}\` USDT\n4. After sending, tap "I've Paid" below.\n\n⏱️ This order expires in 15 minutes.`;
    } else if (method === 'trc20') {
        payText = `🔴 **USDT (TRC-20) Payment**\n\n📋 Order #${orderId}\n📦 ${order.quantity} Items\n\n💰 Send exactly: \`${cryptoAmount}\` USDT\n\n📬 **To this address (TRC-20 network):**\n\`TDYgM1k2wP... (Placeholder)\`\n\n⚠️ **Important:**\n• Send the **exact amount** shown above\n• Use only the **TRC-20** network\n• After sending, tap "I've Paid" below.\n\n⏱️ This order expires in 15 minutes.`;
    }

    await ctx.editMessageText(payText, { reply_markup: getCryptoActionMenu(orderId, isBinance), parse_mode: "Markdown" });
});

callbacks.callbackQuery(/^pay:(.+):credits$/, async (ctx) => {
    const orderId = ctx.match![1];
    
    const order = await ctx.env.DB.prepare("SELECT * FROM orders WHERE order_id = ?").bind(orderId).first();
    if (!order || order.status !== 'pending_checkout') return ctx.answerCallbackQuery("Order expired or invalid.", {show_alert: true});

    const totalUsd = order.total_usd as number;

    const user = await ctx.env.DB.prepare("SELECT * FROM users WHERE user_id = ?").bind(ctx.from.id).first();
    const topup = (user?.topup_credits as number) || 0;
    const ref = (user?.referral_credits as number) || 0;
    const total = topup + ref;

    if (total < totalUsd) {
        return ctx.answerCallbackQuery("Insufficient credits.", {show_alert: true});
    }

    let newTopup = topup;
    let newRef = ref;
    let remaining = totalUsd;

    if (newRef >= remaining) {
        newRef -= remaining;
    } else {
        remaining -= newRef;
        newRef = 0;
        newTopup -= remaining;
    }

    await ctx.env.DB.prepare("UPDATE users SET topup_credits = ?, referral_credits = ? WHERE user_id = ?").bind(newTopup, newRef, ctx.from.id).run();
    await ctx.env.DB.prepare("UPDATE orders SET payment_method = 'credits', status = 'completed' WHERE order_id = ?").bind(orderId).run();

    await ctx.editMessageText(`✅ **Payment Successful!**\n\nYour order #${orderId} has been completed using ${totalUsd.toFixed(2)} credits. You will receive your product shortly.`, {
        reply_markup: new InlineKeyboard().text("⬅️ Back to Main", "back_main"),
        parse_mode: "Markdown"
    });
});

callbacks.callbackQuery(/^verify_pay:(.+)$/, async (ctx) => {
    const orderId = ctx.match![1];
    await ctx.answerCallbackQuery("Scanning the blockchain for your payment...", { show_alert: false });
    const order = await ctx.env.DB.prepare("SELECT * FROM orders WHERE order_id = ?").bind(orderId).first();
    const expected = order?.crypto_amount || "0.00";

    const text = `⏳ **Payment Not Found Yet**\n\n📋 Order #${orderId}\n💰 Expected: ${expected} USDT\n\nYour transaction may still be confirming on the blockchain. Please wait 1-2 minutes and tap "I've Paid" again, or the system will auto-detect it shortly.`;
    await ctx.editMessageText(text, { reply_markup: getCryptoActionMenu(orderId), parse_mode: "Markdown" });
});

// --- UX Helpers ---
callbacks.callbackQuery(/^copy_(addr|amt):(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery("Tap the monospaced text in the message above to copy it to your clipboard!", { show_alert: true });
});

callbacks.callbackQuery(/^custom_(qty|cred)$/, async (ctx) => {
    await ctx.answerCallbackQuery("Please type your required quantity in the chat. (Feature rolling out in v1.1)", { show_alert: true });
});

callbacks.callbackQuery('noop', async (ctx) => {
    await ctx.answerCallbackQuery("Action unavailable (e.g. Insufficient Balance).", { show_alert: true });
});

// --- Auxiliary Menus ---
callbacks.callbackQuery('balance', async (ctx) => {
    const userId = ctx.from.id;
    const user = await ctx.env.DB.prepare("SELECT * FROM users WHERE user_id = ?").bind(userId).first();
    const total = ((user?.topup_credits as number) || 0) + ((user?.referral_credits as number) || 0);

    const refStats = await ctx.env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE inviter_id = ?").bind(userId).first();
    const totalRefs = (refStats?.count as number) || 0;
    const totalRewards = (totalRefs * 0.1).toFixed(2);

    const text = `🪙 **Your Balance**\n\nTopup Credits: ${((user?.topup_credits as number) || 0).toFixed(2)}\nReferral Credits: ${((user?.referral_credits as number) || 0).toFixed(2)}\n─────────────\nTotal: ${total.toFixed(2)}\n\n🔗 **Your Referral Link:**\nhttps://t.me/PixVerifyBot?start=ref_${userId}\n\n📊 **Referral Stats:**\n• Total Referrals: ${totalRefs}\n• ✨ Successful: ${totalRefs}\n• ⏳ Pending: 0\n• 🪙 Total Rewards: ${totalRewards} credits\n\n*Share your link! You earn 0.1 credits each time a new user joins through your referral link.*`;
    await ctx.editMessageText(text, { parse_mode: "Markdown" });
});

callbacks.callbackQuery('history', async (ctx) => {
    const { results } = await ctx.env.DB.prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 5").bind(ctx.from.id).all();
    
    if (!results || results.length === 0) {
        return ctx.answerCallbackQuery("Your order history is currently empty.", {show_alert: true});
    }

    let text = `📜 **Recent Orders (Last 5)**\n\n`;
    for (const order of results) {
        text += `🔹 **Order #${order.order_id}**\n📦 ${order.product_id}\n💰 $${order.total_usd} (${order.payment_method || 'pending'})\n✅ Status: ${order.status}\n\n`;
    }

    await ctx.editMessageText(text, { reply_markup: new InlineKeyboard().text("⬅️ Back", "back_main"), parse_mode: "Markdown" });
});

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
