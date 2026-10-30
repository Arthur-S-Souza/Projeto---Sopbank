import { createApp } from './app';
import { env } from './config/env';
import { closeDb } from './db/database';

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`Sopbank API rodando em http://localhost:${env.port}`);
});

process.on('SIGINT', () => {
  closeDb();
  server.close();
  process.exit(0);
});
