import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, AuthedRequest, authMiddleware } from '../middleware';
import { walletService } from '../services';

const valorSchema = z.object({ valor: z.number().positive() });

const transferSchema = z.object({
  cpfDestino: z.string(),
  valor: z.number().positive(),
});

const pixSchema = z.object({
  chave: z.string(),
  valor: z.number().positive(),
});

const pixKeySchema = z.object({
  chavePix: z.string(),
});

export const walletRouter = Router();

walletRouter.use(authMiddleware);

walletRouter.get(
  '/',
  asyncHandler(async (req: AuthedRequest, res) => {
    res.json(walletService.getWallet(req.userId!));
  })
);

walletRouter.post(
  '/deposit',
  asyncHandler(async (req: AuthedRequest, res) => {
    const { valor } = valorSchema.parse(req.body);
    res.json(walletService.deposit(req.userId!, valor));
  })
);

walletRouter.post(
  '/withdraw',
  asyncHandler(async (req: AuthedRequest, res) => {
    const { valor } = valorSchema.parse(req.body);
    res.json(walletService.withdraw(req.userId!, valor));
  })
);

walletRouter.post(
  '/transfer',
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = transferSchema.parse(req.body);
    res.json(walletService.transfer(req.userId!, body.cpfDestino, body.valor));
  })
);

walletRouter.post(
  '/pix',
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = pixSchema.parse(req.body);
    res.json(walletService.pix(req.userId!, body.chave, body.valor));
  })
);

walletRouter.put(
  '/pix-key',
  asyncHandler(async (req: AuthedRequest, res) => {
    const { chavePix } = pixKeySchema.parse(req.body);
    res.json(walletService.updatePixKey(req.userId!, chavePix));
  })
);

export const transactionsRouter = Router();

transactionsRouter.use(authMiddleware);

transactionsRouter.get(
  '/',
  asyncHandler(async (req: AuthedRequest, res) => {
    const tipo = typeof req.query.tipo === 'string' ? req.query.tipo : undefined;
    res.json(walletService.listTransactions(req.userId!, tipo));
  })
);
