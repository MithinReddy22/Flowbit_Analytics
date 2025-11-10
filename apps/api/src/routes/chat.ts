import { Router, Request, Response } from 'express';
import axios from 'axios';
import rateLimit from 'express-rate-limit';
import { prisma } from '../lib/prisma';

export const chatRouter: Router = Router();

// Rate limiting for chat endpoint
const chatRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

chatRouter.use(chatRateLimit);

chatRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }

    const vannaUrl = process.env.VANNA_API_BASE_URL;
    if (!vannaUrl) {
      return res.status(500).json({ error: 'Vanna AI service not configured' });
    }

    // Get database schema context
    const schemaContext = await getSchemaContext();

    // Forward request to Vanna AI service
    const response = await axios.post(
      `${vannaUrl}/generate-sql`,
      {
        question,
        schema: schemaContext,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.VANNA_API_KEY && {
            Authorization: `Bearer ${process.env.VANNA_API_KEY}`,
          }),
        },
        timeout: 30000, // 30 seconds timeout
      }
    );

    res.json(response.data);
  } catch (error: any) {
    console.error('Error in chat endpoint:', error);
    if (error.response) {
      res.status(error.response.status || 500).json({
        error: 'Vanna AI service error',
        message: error.response.data?.error || error.message,
      });
    } else if (error.request) {
      res.status(503).json({
        error: 'Vanna AI service unavailable',
        message: 'Could not reach the Vanna AI service',
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message,
      });
    }
  }
});

async function getSchemaContext(): Promise<string> {
  // Get sample data from each table for context
  const sampleVendor = await prisma.vendor.findFirst();
  const sampleCustomer = await prisma.customer.findFirst();
  const sampleInvoice = await prisma.invoice.findFirst({
    include: {
      vendor: true,
      customer: true,
    },
  });

  return `
Database Schema:
- vendors: id (UUID), vendor_id (TEXT), name (TEXT), category (TEXT), meta (JSONB)
- customers: id (UUID), customer_id (TEXT), name (TEXT), meta (JSONB)
- invoices: id (UUID), invoice_number (TEXT), vendor_id (UUID FK), customer_id (UUID FK), date (DATE), due_date (DATE), status (TEXT), currency (TEXT), subtotal (DECIMAL), tax (DECIMAL), total_amount (DECIMAL)
- line_items: id (UUID), invoice_id (UUID FK), description (TEXT), quantity (DECIMAL), unit_price (DECIMAL), total (DECIMAL), category (TEXT)
- payments: id (UUID), invoice_id (UUID FK), amount (DECIMAL), method (TEXT), date (DATE), status (TEXT)
- documents: id (UUID), invoice_id (UUID FK), file_name (TEXT), url (TEXT), uploaded_at (TIMESTAMP)

Sample data:
${sampleVendor ? `Vendor: ${sampleVendor.name} (${sampleVendor.vendorId})` : ''}
${sampleCustomer ? `Customer: ${sampleCustomer.name || 'N/A'} (${sampleCustomer.customerId})` : ''}
${sampleInvoice ? `Invoice: ${sampleInvoice.invoiceNo}, Amount: ${sampleInvoice.totalAmount}, Date: ${sampleInvoice.date}` : ''}
`.trim();
}


