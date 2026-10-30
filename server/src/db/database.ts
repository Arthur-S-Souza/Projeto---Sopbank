import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { env } from '../config/env';

let db: Database.Database | null = null;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  telefone TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  data_nascimento TEXT NOT NULL,
  saldo REAL NOT NULL DEFAULT 0,
  chave_pix TEXT NOT NULL UNIQUE,
  criado_em TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  tipo TEXT NOT NULL,
  valor REAL NOT NULL,
  descricao TEXT NOT NULL,
  cpf_destino TEXT,
  cpf_origem TEXT,
  chave_pix TEXT,
  criado_em TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_users_chave_pix ON users(chave_pix);
`;

export function getDb(): Database.Database {
  if (db) {
    return db;
  }

  const dir = path.dirname(env.databasePath);
  fs.mkdirSync(dir, { recursive: true });

  db = new Database(env.databasePath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA);
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
