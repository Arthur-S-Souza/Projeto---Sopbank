import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const env = {
  port: Number(process.env.PORT ?? 3333),
  jwtSecret: process.env.JWT_SECRET ?? 'sopbank-dev-secret-change-me',
  databasePath: process.env.DATABASE_PATH ?? path.join(__dirname, '../../data/sopbank.sqlite'),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:4200',
  jwtExpiresIn: '7d' as const,
};
