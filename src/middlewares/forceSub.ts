import { Middleware, InlineKeyboard } from 'grammy';
import { MyContext } from '../types';

export const forceSubMiddleware: Middleware<MyContext> = async (ctx, next) => {
	if (ctx.from && ctx.env.REQUIRED_CHANNEL) {
		try {
			const member = await ctx.api.getChatMember(ctx.env.REQUIRED_CHANNEL, ctx.from.id);
			if (['left', 'kicked'].includes(member.status)) {
				const joinKeyboard = new InlineKeyboard()
					.url(`🌐 Join ${ctx.env.REQUIRED_CHANNEL.replace('@', '')}`, `https://t.me/${ctx.env.REQUIRED_CHANNEL.replace('@', '')}`).row()
					.text("✅ I have joined. Check now", "check_sub");
				
				await ctx.reply(`⚠️ **Access Denied**\n\nYou must join the required channel before using this bot:\n\n**Required channel:**\n👉 ${ctx.env.REQUIRED_CHANNEL}`, {
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
};
