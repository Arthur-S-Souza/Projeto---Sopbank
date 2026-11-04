CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  color TEXT NOT NULL DEFAULT '#6366f1',
  icon TEXT NOT NULL DEFAULT 'tag'
);

CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'checking' CHECK (type IN ('checking', 'savings', 'cash', 'investment')),
  initial_balance REAL NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#10b981'
);

CREATE TABLE IF NOT EXISTS credit_cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  brand TEXT,
  credit_limit REAL NOT NULL DEFAULT 0,
  closing_day INTEGER NOT NULL DEFAULT 1 CHECK (closing_day BETWEEN 1 AND 31),
  due_day INTEGER NOT NULL DEFAULT 10 CHECK (due_day BETWEEN 1 AND 31),
  color TEXT NOT NULL DEFAULT '#8b5cf6'
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount REAL NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  category_id INTEGER REFERENCES categories (id) ON DELETE SET NULL,
  account_id INTEGER REFERENCES accounts (id) ON DELETE SET NULL,
  credit_card_id INTEGER REFERENCES credit_cards (id) ON DELETE SET NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime ('now'))
);

CREATE TABLE IF NOT EXISTS installments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  credit_card_id INTEGER NOT NULL REFERENCES credit_cards (id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  purchase_date TEXT NOT NULL,
  installment_number INTEGER NOT NULL CHECK (installment_number >= 1),
  total_installments INTEGER NOT NULL CHECK (total_installments >= 1),
  amount REAL NOT NULL CHECK (amount > 0),
  due_date TEXT NOT NULL,
  paid INTEGER NOT NULL DEFAULT 0 CHECK (paid IN (0, 1)),
  category_id INTEGER REFERENCES categories (id) ON DELETE SET NULL,
  group_id TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (date);
CREATE INDEX IF NOT EXISTS idx_installments_due ON installments (due_date);
CREATE INDEX IF NOT EXISTS idx_installments_card ON installments (credit_card_id);
