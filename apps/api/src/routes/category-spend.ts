import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const categorySpendRouter: Router = Router();

categorySpendRouter.get('/', async (req: Request, res: Response) => {
  try {
    const vendors = await prisma.vendor.findMany({
      where: {
        category: {
          not: null,
        },
      },
      include: {
        invoices: {
          select: {
            totalAmount: true,
          },
        },
      },
    });

    const categorySpend = new Map<string, number>();

    vendors.forEach((vendor: any) => {
      if (vendor.category) {
        const spend = vendor.invoices.reduce(
          (sum: number, invoice: any) => sum + Number(invoice.totalAmount),
          0
        );
        const existing = categorySpend.get(vendor.category) || 0;
        categorySpend.set(vendor.category, existing + spend);
      }
    });

    const result = Array.from(categorySpend.entries())
      .map(([category, spend]) => ({
        category,
        spend,
      }))
      .sort((a: any, b: any) => b.spend - a.spend);

    res.json(result);
  } catch (error) {
    console.error('Error fetching category spend:', error);
    res.status(500).json({ error: 'Failed to fetch category spend' });
  }
});


