import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const statsRouter: Router = Router();

statsRouter.get('/', async (req: Request, res: Response) => {
  try {
    // Total Spend (all time)
    const totalSpendResult = await prisma.invoice.aggregate({
      _sum: {
        totalAmount: true,
      },
    });

    // Total Invoices Processed (all time)
    const invoicesProcessed = await prisma.invoice.count();

    // Documents Uploaded
    const documentsUploaded = await prisma.document.count();

    // Average Invoice Value
    const avgInvoiceResult = await prisma.invoice.aggregate({
      _avg: {
        totalAmount: true,
      },
    });

    const totalSpend = totalSpendResult._sum.totalAmount || 0;
    const avgInvoiceValue = avgInvoiceResult._avg.totalAmount || 0;

    res.json({
      totalSpend: Number(totalSpend),
      invoicesProcessed,
      documentsUploaded,
      avgInvoiceValue: Number(avgInvoiceValue),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});


