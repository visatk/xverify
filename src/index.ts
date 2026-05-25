import { Bot, Context, webhookCallback, InlineKeyboard } from 'grammy';

// 1. Define Cloudflare Environment Bindings
export interface Env {
	TELEGRAM_BOT_TOKEN: string;
	REQUIRED_CHANNEL: string; // e.g., "@PixVerifyChannel"
	DB: D1Database;
}

// 2. Extend Context for D1 Access
type MyContext = Context & { env: Env };

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const bot = new Bot<MyContext>(env.TELEGRAM_BOT_TOKEN);

		// Inject env into context
		bot.use(async (ctx, next) => {
			ctx.env = env;
			await next();
		});

		// 3. Middleware: Force Channel Subscription
		bot.use(async (ctx, next) => {
			if (ctx.from && ctx.env.REQUIRED_CHANNEL) {
				try {
					const member = await ctx.api.getChatMember(ctx.env.REQUIRED_CHANNEL, ctx.from.id);
					if (['left', 'kicked'].includes(member.status)) {
						const joinKeyboard = new InlineKeyboard()
							.url(`🌐 Join ${ctx.env.REQUIRED_CHANNEL.replace('@', '')}`, `https://t.me/${ctx.env.REQUIRED_CHANNEL.replace('@', '')}`).row()
							.text("✅ I have joined. Check now", "check_sub");
						
						await ctx.reply("⚠️ **Access Denied**\n\nYou must join the required channel before using this bot:\n\n**Required channel:**\n👉 " + ctx.env.REQUIRED_CHANNEL, {
							reply_markup: joinKeyboard,
							parse_mode: "Markdown"
						});
						return;
					}
				} catch (e) {
					console.error("Force sub check failed", e);
				}
			}
			await next();
		});

		// 4. Main Menu (Matches Screenshot 1 exactly)
		const getMainMenu = () => {
			return new InlineKeyboard()
				.text("1️⃣ Start Verification", "verify").text("🛒 Shop", "shop").row()
				.text("💳 Buy Credits", "buy_credits").text("💰 Balance", "balance").row()
				.text("📜 History", "history").text("⚡ Server Status", "status").row()
				.text("🎁 Refer & Earn", "refer").text("ℹ️ Help", "help").row()
				.text("💬 Support", "support");
		};

		bot.command('start', async (ctx) => {
			// Register user in D1
			await ctx.env.DB.prepare(
				"INSERT OR IGNORE INTO users (user_id, username) VALUES (?, ?)"
			).bind(ctx.from?.id, ctx.from?.username || "").run();

			const welcomeText = `👋 Welcome to **PixVerifyBot**!\n\nThis bot helps you verify your Google Pixel device in your Google Account, allowing you to claim a free 1-year Google AI.\n\nBefore verification please make sure that you follow the following steps.\n1. Close Your Payments Profile\n2. Leave or delete current family group.\n3. Do not use the gmail id in which you have claimed student offer before.\n4. Prepare TOTL Secret(Authenticator Secret)\n\nUse 💡 if you cannot find TOTP secret key or contact @PixVerify`;
			
			await ctx.reply(welcomeText, {
				reply_markup: getMainMenu(),
				parse_mode: "Markdown"
			});
		});

		// Handle callback for force-sub check
		bot.callbackQuery('check_sub', async (ctx) => {
			await ctx.answerCallbackQuery("Checking subscription...");
			// Will trigger the middleware again on next message, or we can route to start
			await ctx.reply("Subscription verified. Click /start to begin.");
		});

		// 5. Shop Menu (Matches Screenshot 3/4)
		bot.callbackQuery('shop', async (ctx) => {
			const shopKeyboard = new InlineKeyboard()
				.text("👑 VIP — 1.5 credits (Full subscription)", "prod_vip").row()
				.text("📋 Normal — 1 credit (Link extraction)", "prod_normal").row()
				.text("🇬 [18 Months] Google AI PRO — Activation Link", "prod_g_ai").row()
				.text("🤖 ChatGPT PLUS [1 Month, UPI Made] — No wa", "prod_gpt_nowa").row()
				.text("🤖 ChatGPT PLUS [1 Month, UPI Made] — 3 Days", "prod_gpt_3d").row()
				.text("⬅️ Back", "back_main");

			const shopText = `👑 **VIP — 1.5 credits**\nYour account will be fully upgraded automatically without the need to add card or any payment methods.\n\n📋 **Normal — 1 credit**\nYou will be provided a link after successful verification. Then payment method has to be added manually.\n\n🛒 Browse more products and pre-activated accounts below.`;
			
			await ctx.editMessageText(shopText, {
				reply_markup: shopKeyboard,
				parse_mode: "Markdown"
			});
		});

		// 6. Product Detail & Checkout (Matches Screenshot 5/6)
		bot.callbackQuery('prod_g_ai', async (ctx) => {
			const buyKeyboard = new InlineKeyboard()
				.text("1", "buy_1").text("2", "buy_2").text("3", "buy_3").text("5", "buy_5").row()
				.text("✏️ Custom Quantity", "custom_qty").row()
				.text("⬅️ Back to Shop", "shop").text("❌ Cancel", "back_main");

			const prodText = `⚠️ Note: Don't hold these links for more than 24 hours. Use them immediately after purchase if possible or within 24 hours\n\n📋 Format: Activation Link\n\n💰 **Price:** $2.90 per unit\n\n🎁 **Bulk pricing**\n• From 1-9: $2.90 / unit\n• From 10-19: $2.70 / unit\n• From 20+: $2.50 / unit\n📦 **In Stock:** 35 items\n\n👇 **Choose a quantity below or enter a custom amount:**`;
			
			await ctx.editMessageText(prodText, {
				reply_markup: buyKeyboard,
				parse_mode: "Markdown"
			});
		});

		// 7. Payment Selection (Matches Screenshot 7)
		bot.callbackQuery('buy_1', async (ctx) => {
			// In production, extract user balance from D1 here
			const paymentKeyboard = new InlineKeyboard()
				.text("🪙 Pay with Credits ($2.90)", "pay_credits").row()
				.text("🟡 Binance Pay (✅ Automatic)", "pay_binance").row()
				.text("🔵 USDT (BEP-20) (✅ Automatic)", "pay_usdt_bep").row()
				.text("🔴 USDT (TRC-20) (✅ Automatic)", "pay_usdt_trc").row()
				.text("❌ Cancel", "back_main");

			const checkoutText = `🛒 **Order Summary**\n\n📦 Product: \\[18 Months\\] Google AI PRO — Activation Link\n🔢 Quantity: 1\n💲 Price per unit: $2.90\n💰 **Total: $2.90 USDT**\n\n💳 **Select Payment Method**`;

			await ctx.editMessageText(checkoutText, {
				reply_markup: paymentKeyboard,
				parse_mode: "Markdown"
			});
		});

		bot.callbackQuery('back_main', async (ctx) => {
			await ctx.editMessageText("Welcome back to the main menu.", { reply_markup: getMainMenu() });
		});

		// Fallback for unhandled queries
		bot.on("callback_query", async (ctx) => {
			await ctx.answerCallbackQuery("Feature coming in v1.1 (Lean MVP Enforced).");
		});

		// Setup Webhook routing for Cloudflare
		const handleUpdate = webhookCallback(bot, 'cloudflare-mod');
		
		// Only process POST requests (Telegram webhooks)
		if (request.method === 'POST') {
			return handleUpdate(request);
		}
		
		return new Response("Bot is running securely on Cloudflare Edge.", { status: 200 });
	}
};
