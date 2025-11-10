import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const invoiceTrendsRouter: Router = Router();

invoiceTrendsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const from = req.query.from as string;
    const to = req.query.to as string;

    const fromDate = from ? new Date(from) : new Date('2020-01-01'); // Default to 2020 to include sample data
    const toDate = to ? new Date(to) : new Date();

    // Get monthly invoice trends
    const invoices = await prisma.invoice.findMany({
      where: {
        date: {
          gte: fromDate,
          lte: toDate,
        },
      },
      select: {
        date: true,
        totalAmount: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Group by month
    const monthlyData = new Map<string, { invoice_count: number; total_spend: number }>();

    invoices.forEach((invoice: any) => {
      const month = invoice.date.toISOString().slice(0, 7); // YYYY-MM
      const existing = monthlyData.get(month) || { invoice_count: 0, total_spend: 0 };
      monthlyData.set(month, {
        invoice_count: existing.invoice_count + 1,
        total_spend: Number(existing.total_spend) + Number(invoice.totalAmount),
      });
    });

    const result = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        invoice_count: data.invoice_count,
        total_spend: data.total_spend,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    res.json(result);
  } catch (error) {
    console.error('Error fetching invoice trends:', error);
    res.status(500).json({ error: 'Failed to fetch invoice trends' });
  }
});


