import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router: Router = Router();

router.get('/summary', async (req: Request, res: Response) => {
  try {
    const [vendors, customers, invoices, payments] = await Promise.all([
      prisma.vendor.count(),
      prisma.customer.count(), 
      prisma.invoice.count(),
      prisma.payment.count()
    ]);
    
    res.json({ vendors, customers, invoices, payments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

router.get('/invoices', async (req: Request, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({
      take: 10,
      orderBy: { date: 'desc' },
      include: {
        vendor: true,
        payments: true
      }
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

export default router;