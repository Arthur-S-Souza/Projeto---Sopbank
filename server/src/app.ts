import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { getDb } from './db/database';
import { errorHandler } from './middleware';
import { authRouter } from './routes/auth.routes';
import { transactionsRouter, walletRouter } from './routes/wallet.routes';

export function createApp() {
  getDb();

  const app = express();
  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    })
  );
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'sopbank-api' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/wallet', walletRouter);
  app.use('/api/transactions', transactionsRouter);

  app.use(errorHandler);
  return app;
}
