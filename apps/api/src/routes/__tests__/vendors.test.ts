import request from 'supertest';
import express from 'express';
import { vendorsRouter } from '../vendors';
import { prisma } from '../../lib/prisma';

const app = express();
app.use(express.json());
app.use('/vendors', vendorsRouter);

describe('GET /vendors/top10', () => {
  beforeEach(async () => {
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

  it('should return empty array when no vendors exist', async () => {
    const response = await request(app).get('/vendors/top10');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('should return top vendors sorted by spend', async () => {
    const vendor1 = await prisma.vendor.create({
      data: {
        vendorId: 'vendor-1',
        name: 'Vendor 1',
      },
    });

    const vendor2 = await prisma.vendor.create({
      data: {
        vendorId: 'vendor-2',
        name: 'Vendor 2',
      },
    });

    await prisma.invoice.createMany({
      data: [
        {
          invoiceNumber: 'INV-001',
          vendorId: vendor1.id,
          date: new Date(),
          totalAmount: 5000,
        },
        {
          invoiceNumber: 'INV-002',
          vendorId: vendor1.id,
          date: new Date(),
          totalAmount: 3000,
        },
        {
          invoiceNumber: 'INV-003',
          vendorId: vendor2.id,
          date: new Date(),
          totalAmount: 2000,
        },
      ],
    });

    const response = await request(app).get('/vendors/top10');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0].spend).toBe(8000); // Vendor 1
    expect(response.body[1].spend).toBe(2000); // Vendor 2
  });
});


