import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const cashOutflowRouter: Router = Router();

cashOutflowRouter.get('/', async (req, res) => {
  try {
    const from = req.query.from as string;
    const to = req.query.to as string;

    const fromDate = from ? new Date(from) : new Date('2020-01-01'); // Include historical data
    const toDate = to ? new Date(to) : new Date();

    // Get invoices with due dates in the range
    const invoices = await prisma.invoice.findMany({
      where: {
        dueDate: {
          gte: fromDate,
          lte: toDate,
        },
        status: {
          not: 'paid',
        },
      },
      select: {
        dueDate: true,
        totalAmount: true,
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    // Group by date
    const dailyOutflow = new Map<string, number>();

    invoices.forEach((invoice) => {
      if (invoice.dueDate) {
        const dateStr = invoice.dueDate.toISOString().split('T')[0]; // YYYY-MM-DD
        const existing = dailyOutflow.get(dateStr) || 0;
        dailyOutflow.set(dateStr, existing + Number(invoice.totalAmount));
      }
    });

    const result = Array.from(dailyOutflow.entries())
      .map(([date, outflow]) => ({
        date,
        outflow,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json(result);
  } catch (error) {
    console.error('Error fetching cash outflow:', error);
    res.status(500).json({ error: 'Failed to fetch cash outflow' });
  }
});


