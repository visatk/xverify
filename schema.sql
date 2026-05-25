DROP TABLE IF EXISTS users;
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY,
    username TEXT,
    topup_credits REAL DEFAULT 0,
    referral_credits REAL DEFAULT 0,
    inviter_id INTEGER,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
    order_id TEXT PRIMARY KEY,
    user_id INTEGER,
    product_id TEXT,
    quantity INTEGER,
    total_usd REAL,
    crypto_amount REAL,
    payment_method TEXT,
    status TEXT DEFAULT 'pending_checkout',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
