import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, AuthedRequest, authMiddleware } from '../middleware';
import { authService } from '../services';

const registerSchema = z.object({
  nome: z.string(),
  email: z.string(),
  senha: z.string(),
  telefone: z.string(),
  cpf: z.string(),
  dataNascimento: z.string(),
});

const loginSchema = z.object({
  email: z.string(),
  senha: z.string(),
});

export const authRouter = Router();

authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const body = registerSchema.parse(req.body);
    const result = await authService.register(body);
    res.status(201).json(result);
  })
);

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body);
    const result = await authService.login(body.email, body.senha);
    res.json(result);
  })
);

authRouter.get(
  '/me',
  authMiddleware,
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = authService.me(req.userId!);
    res.json(user);
  })
);
