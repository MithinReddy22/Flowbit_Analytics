import { VercelRequest, VercelResponse } from '@vercel/node';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import express, { Request, Response } from 'express';

// Initialize Express app
const app = express();

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true
}));

// Body parsing
app.use(express.json());

// Initialize Prisma
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Stats endpoint
app.get('/stats', async (req: Request, res: Response) => {
  try {
    const totalSpendResult = await prisma.invoice.aggregate({
      _sum: { totalAmount: true },
    });

    const invoicesProcessed = await prisma.invoice.count();
    const documentsUploaded = await prisma.document.count();
    const avgInvoiceResult = await prisma.invoice.aggregate({
      _avg: { totalAmount: true },
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

// Invoices endpoint
app.get('/invoices', async (req: Request, res: Response) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    const where = q ? {
      OR: [
        { vendor: { name: { contains: q, mode: 'insensitive' } } },
        { invoiceNo: { contains: q, mode: 'insensitive' } },
        { status: { contains: q, mode: 'insensitive' } }
      ]
    } : {};

    const [invoices, total_count] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          vendor: { select: { name: true } },
          customer: { select: { name: true } }
        },
        orderBy: { date: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      }),
      prisma.invoice.count({ where })
    ]);

    const items = invoices.map((inv: any) => ({
      invoice_number: inv.invoiceNo,
      vendor: inv.vendor,
      date: inv.date.toISOString().split('T')[0],
      total_amount: Number(inv.totalAmount),
      status: inv.status
    }));

    res.json({ total_count, items });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Invoice trends endpoint
app.get('/invoice-trends', async (req: Request, res: Response) => {
  try {
    const fromDate = new Date('2020-01-01');
    const toDate = new Date();

    const invoices = await prisma.invoice.findMany({
      where: {
        date: { gte: fromDate, lte: toDate }
      },
      select: { date: true, totalAmount: true },
      orderBy: { date: 'asc' }
    });

    const monthlyData = new Map();

    invoices.forEach((invoice: any) => {
      const month = invoice.date.toISOString().slice(0, 7);
      const existing = monthlyData.get(month) || { invoice_count: 0, total_spend: 0 };
      monthlyData.set(month, {
        invoice_count: existing.invoice_count + 1,
        total_spend: Number(existing.total_spend) + Number(invoice.totalAmount)
      });
    });

    const result = Array.from(monthlyData.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    res.json(result);
  } catch (error) {
    console.error('Error fetching invoice trends:', error);
    res.status(500).json({ error: 'Failed to fetch invoice trends' });
  }
});

// Category spend endpoint
app.get('/category-spend', async (req: Request, res: Response) => {
  try {
    const categorySpend = await prisma.$queryRaw`
      SELECT li.category, SUM(li.total)::numeric as spend
      FROM line_items li
      GROUP BY li.category
      ORDER BY spend DESC
    `;

    res.json(categorySpend);
  } catch (error) {
    console.error('Error fetching category spend:', error);
    res.status(500).json({ error: 'Failed to fetch category spend' });
  }
});

// Top vendors endpoint
app.get('/vendors/top10', async (req: Request, res: Response) => {
  try {
    const topVendors = await prisma.$queryRaw`
      SELECT 
        v.vendor_id,
        v.name,
        SUM(i.total_amount)::numeric as spend
      FROM vendors v
      JOIN invoices i ON v.id = i.vendor_id
      GROUP BY v.id, v.vendor_id, v.name
      ORDER BY spend DESC
      LIMIT 10
    `;
    
    res.json(topVendors);
  } catch (error) {
    console.error('Error fetching top vendors:', error);
    res.status(500).json({ error: 'Failed to fetch top vendors' });
  }
});

// Cash outflow endpoint
app.get('/cash-outflow', async (req: Request, res: Response) => {
  try {
    const fromDate = new Date('2020-01-01');
    const toDate = new Date();

    const invoices = await prisma.invoice.findMany({
      where: {
        dueDate: { gte: fromDate, lte: toDate },
        status: { not: 'paid' }
      },
      select: { dueDate: true, totalAmount: true },
      orderBy: { dueDate: 'asc' }
    });

    const dailyOutflow = new Map();

    invoices.forEach((invoice: any) => {
      if (invoice.dueDate) {
        const dateStr = invoice.dueDate.toISOString().split('T')[0];
        const existing = dailyOutflow.get(dateStr) || 0;
        dailyOutflow.set(dateStr, existing + Number(invoice.totalAmount));
      }
    });

    const result = Array.from(dailyOutflow.entries())
      .map(([date, outflow]) => ({ date, outflow }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json(result);
  } catch (error) {
    console.error('Error fetching cash outflow:', error);
    res.status(500).json({ error: 'Failed to fetch cash outflow' });
  }
});

// Chat endpoint (mock implementation for now)
app.post('/chat-with-data', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Mock responses for common questions
    const mockResponses = {
      'total spend': {
        sql: 'SELECT SUM(total_amount) as total_spend FROM invoices',
        explain: 'Calculates the total spend across all invoices',
        columns: ['total_spend'],
        rows: [{ total_spend: 11550 }]
      },
      'total invoices': {
        sql: 'SELECT COUNT(*) as total_invoices FROM invoices',
        explain: 'Counts the total number of invoices',
        columns: ['total_invoices'],
        rows: [{ total_invoices: 5 }]
      }
    };

    const questionLower = question.toLowerCase();
    let response = null;

    for (const [key, value] of Object.entries(mockResponses)) {
      if (questionLower.includes(key)) {
        response = value;
        break;
      }
    }

    if (!response) {
      response = {
        sql: 'SELECT COUNT(*) as row_count FROM invoices',
        explain: 'Returns the total number of invoices',
        columns: ['row_count'],
        rows: [{ row_count: 5 }]
      };
    }

    res.json(response);
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Failed to process question' });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

export default app;
