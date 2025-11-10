import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const invoicesRouter = Router();

invoicesRouter.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 25;
    const search = req.query.q as string;
    const sort = req.query.sort as string || 'date_desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { vendor: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Build orderBy
    let orderBy: any = { date: 'desc' };
    if (sort === 'amount_desc') {
      orderBy = { totalAmount: 'desc' };
    } else if (sort === 'amount_asc') {
      orderBy = { totalAmount: 'asc' };
    } else if (sort === 'date_asc') {
      orderBy = { date: 'asc' };
    } else if (sort === 'date_desc') {
      orderBy = { date: 'desc' };
    }

    // Get total count
    const totalCount = await prisma.invoice.count({ where });

    // Get invoices
    const invoices = await prisma.invoice.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        vendor: {
          select: {
            name: true,
          },
        },
      },
    });

    const items = invoices.map((invoice) => ({
      invoice_number: invoice.invoiceNumber,
      vendor: invoice.vendor ? { name: invoice.vendor.name } : null,
      date: invoice.date.toISOString().split('T')[0],
      total_amount: Number(invoice.totalAmount),
      status: invoice.status || 'unknown',
    }));

    res.json({
      total_count: totalCount,
      items,
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});


