import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const vendorsRouter = Router();

vendorsRouter.get('/top10', async (req, res) => {
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
      .map((vendor) => {
        const spend = vendor.invoices.reduce(
          (sum, invoice) => sum + Number(invoice.totalAmount),
          0
        );
        return {
          vendor_id: vendor.vendorId,
          name: vendor.name,
          spend,
        };
      })
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 10);

    res.json(vendorsWithSpend);
  } catch (error) {
    console.error('Error fetching top vendors:', error);
    res.status(500).json({ error: 'Failed to fetch top vendors' });
  }
});


