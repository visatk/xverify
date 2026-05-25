import { Context } from 'grammy';

// Define Cloudflare Environment Bindings
export interface Env {
	TELEGRAM_BOT_TOKEN: string;
	REQUIRED_CHANNEL: string; // e.g., "@PixVerifyChannel"
	DB: D1Database;
}

// Extend Context for D1 Access
export type MyContext = Context & { env: Env };
