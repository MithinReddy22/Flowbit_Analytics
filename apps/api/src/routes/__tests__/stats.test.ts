import request from 'supertest';
import express from 'express';
import { statsRouter } from '../stats';
import { prisma } from '../../lib/prisma';

const app = express();
app.use(express.json());
app.use('/stats', statsRouter);

describe('GET /stats', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.document.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.lineItem.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.vendor.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should return stats with zero values when no data exists', async () => {
    const response = await request(app).get('/stats');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('totalSpend');
    expect(response.body).toHaveProperty('invoicesProcessed');
    expect(response.body).toHaveProperty('documentsUploaded');
    expect(response.body).toHaveProperty('avgInvoiceValue');
  });

  it('should return correct stats with data', async () => {
    // Create test data
    const vendor = await prisma.vendor.create({
      data: {
        vendorId: 'test-vendor-1',
        name: 'Test Vendor',
        category: 'Test Category',
      },
    });

    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);

    await prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-001',
        vendorId: vendor.id,
        date: yearStart,
        totalAmount: 1000.50,
      },
    });

    await prisma.document.create({
      data: {
        fileName: 'test.pdf',
        url: 'https://example.com/test.pdf',
      },
    });

    const response = await request(app).get('/stats');

    expect(response.status).toBe(200);
    expect(response.body.totalSpend).toBe(1000.50);
    expect(response.body.invoicesProcessed).toBe(1);
    expect(response.body.documentsUploaded).toBe(1);
  });
});


