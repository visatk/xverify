import { Composer } from 'grammy';
import { MyContext } from '../types';
import { getMainMenu } from '../keyboards/menus';

export const commands = new Composer<MyContext>();

commands.command('start', async (ctx) => {
	// Register user in D1 Database securely at the edge
	await ctx.env.DB.prepare(
		"INSERT OR IGNORE INTO users (user_id, username) VALUES (?, ?)"
	).bind(ctx.from?.id, ctx.from?.username || "").run();

	const welcomeText = `👋 Welcome to **PixVerifyBot**!\n\nThis bot helps you verify your Google Pixel device in your Google Account, allowing you to claim a free 1-year Google AI.\n\nBefore verification please make sure that you follow the following steps.\n1. Close Your Payments Profile\n2. Leave or delete current family group.\n3. Do not use the gmail id in which you have claimed student offer before.\n4. Prepare TOTL Secret(Authenticator Secret)\n\nUse 💡 if you cannot find TOTP secret key or contact @PixVerify`;
	
	await ctx.reply(welcomeText, {
		reply_markup: getMainMenu(),
		parse_mode: "Markdown"
	});
});
