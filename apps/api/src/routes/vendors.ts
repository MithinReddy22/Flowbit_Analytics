import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const vendorsRouter: Router = Router();

vendorsRouter.get('/top10', async (req: Request, res: Response) => {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        invoices: {
          select: {
            totalAmount: true,
          },
        },
      },
    });

    const vendorsWithSpend = vendors
      .map((vendor: any) => {
        const spend = vendor.invoices.reduce(
          (sum: number, invoice: any) => sum + Number(invoice.totalAmount),
          0
        );
        return {
          vendor_id: vendor.vendorId,
          name: vendor.name,
          spend,
        };
      })
      .sort((a: any, b: any) => b.spend - a.spend)
      .slice(0, 10);

    res.json(vendorsWithSpend);
  } catch (error) {
    console.error('Error fetching top vendors:', error);
    res.status(500).json({ error: 'Failed to fetch top vendors' });
  }
});


