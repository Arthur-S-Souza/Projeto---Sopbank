import { ZodError } from 'zod';
import { NextFunction, Request, Response } from 'express';
import { authService, HttpError } from '../services';

export interface AuthedRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ mensagem: 'Autenticação necessária.' });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = authService.verifyToken(token);
    req.userId = payload.sub;
    next();
  } catch (error) {
    const message = error instanceof HttpError ? error.message : 'Token inválido.';
    res.status(401).json({ mensagem: message });
  }
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({ mensagem: 'Dados inválidos.', detalhes: err.flatten() });
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.status).json({ mensagem: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ mensagem: 'Erro interno do servidor.' });
}

export function asyncHandler(
  fn: (req: AuthedRequest, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
