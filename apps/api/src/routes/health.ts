import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const healthRouter: Router = Router();

healthRouter.get('/', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      db: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      db: 'disconnected',
    });
  }
});


