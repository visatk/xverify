import { Bot } from 'grammy';
import { MyContext } from './types';
import { forceSubMiddleware } from './middlewares/forceSub';
import { commands } from './handlers/commands';
import { callbacks } from './handlers/callbacks';

export const createBot = (token: string, env: MyContext['env']) => {
	const bot = new Bot<MyContext>(token);

	// Context Injection
	bot.use(async (ctx, next) => {
		ctx.env = env;
		await next();
	});

	// Global Middleware Pipeline
	bot.use(forceSubMiddleware);

	// Route Handlers
	bot.use(commands);
	bot.use(callbacks);

	return bot;
};
