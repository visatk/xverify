import { webhookCallback } from 'grammy';
import { Env } from './types';
import { createBot } from './bot';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const bot = createBot(env.TELEGRAM_BOT_TOKEN, env);

		// Optimize webhook for Edge execution
		const handleUpdate = webhookCallback(bot, 'cloudflare-mod');
		
		if (request.method === 'POST') {
			return handleUpdate(request);
		}
		
		return new Response("PixVerifyBot Platform API - Status: Operational", { status: 200 });
	}
};
