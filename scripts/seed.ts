import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface TestDataItem {
  _id: string;
  name: string;
  filePath?: string;
  extractedData?: {
    llmData?: {
      invoice?: {
        value?: {
          invoiceId?: { value?: string };
          invoiceDate?: { value?: string };
          deliveryDate?: { value?: string };
          dueDate?: { value?: string };
        };
      };
      vendor?: {
        value?: {
          vendorName?: { value?: string };
          vendorPartyNumber?: { value?: string };
          vendorAddress?: { value?: string };
          vendorTaxId?: { value?: string };
          vendorCategory?: { value?: string };
        };
      };
      customer?: {
        value?: {
          customerName?: { value?: string };
          customerPartyNumber?: { value?: string };
          customerAddress?: { value?: string };
        };
      };
      payment?: {
        value?: {
          totalAmount?: { value?: string | number };
          subtotal?: { value?: string | number };
          tax?: { value?: string | number };
          currency?: { value?: string };
          paymentMethod?: { value?: string };
          paymentDate?: { value?: string };
          paymentStatus?: { value?: string };
        };
      };
      lineItems?: {
        value?: Array<{
          description?: { value?: string };
          quantity?: { value?: string | number };
          unitPrice?: { value?: string | number };
          total?: { value?: string | number };
          category?: { value?: string };
        }>;
      };
    };
  };
  metadata?: {
    docId?: string;
    originalFileName?: string;
    uploadedAt?: string;
  };
}

async function seed() {
  console.log('🌱 Starting seed process...');

  try {
    // Read test data
    const dataPath = path.join(__dirname, '..', 'data', 'Analytics_Test_Data.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const testData: TestDataItem[] = JSON.parse(rawData);

    console.log(`📊 Found ${testData.length} documents to process`);

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await prisma.document.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.lineItem.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.vendor.deleteMany();

    let processedCount = 0;
    let vendorCount = 0;
    let customerCount = 0;
    let invoiceCount = 0;
    let lineItemCount = 0;
    let paymentCount = 0;
    let documentCount = 0;

    // Process in batches
    const batchSize = 100;
    for (let i = 0; i < testData.length; i += batchSize) {
      const batch = testData.slice(i, i + batchSize);
      
      await prisma.$transaction(async (tx) => {
        for (const item of batch) {
          try {
            const llmData = item.extractedData?.llmData;
            if (!llmData) continue;

            const invoiceData = llmData.invoice?.value;
            const vendorData = llmData.vendor?.value;
            const customerData = llmData.customer?.value;
            const paymentData = llmData.payment?.value;
            const lineItemsData = llmData.lineItems?.value?.items?.value || llmData.lineItems?.value || [];

            // Skip if no invoice data
            if (!invoiceData?.invoiceId?.value) continue;

            // Upsert Vendor
            let vendor = null;
            if (vendorData?.vendorName?.value) {
              const vendorId = vendorData.vendorPartyNumber?.value || `vendor-${item._id}`;
              const existingVendor = await tx.vendor.findUnique({ where: { vendorId } });
              if (!existingVendor) vendorCount++;
              vendor = await tx.vendor.upsert({
                where: { vendorId },
                update: {
                  name: vendorData.vendorName.value,
                  category: vendorData.vendorCategory?.value || null,
                  meta: {
                    address: vendorData.vendorAddress?.value,
                    taxId: vendorData.vendorTaxId?.value,
                    partyNumber: vendorData.vendorPartyNumber?.value,
                  },
                },
                create: {
                  vendorId,
                  name: vendorData.vendorName.value,
                  category: vendorData.vendorCategory?.value || null,
                  meta: {
                    address: vendorData.vendorAddress?.value,
                    taxId: vendorData.vendorTaxId?.value,
                    partyNumber: vendorData.vendorPartyNumber?.value,
                  },
                },
              });
            }

            // Upsert Customer
            let customer = null;
            if (customerData?.customerName?.value) {
              const customerId = customerData.customerPartyNumber?.value || `customer-${item._id}`;
              const existingCustomer = await tx.customer.findUnique({ where: { customerId } });
              if (!existingCustomer) customerCount++;
              customer = await tx.customer.upsert({
                where: { customerId },
                update: {
                  name: customerData.customerName.value,
                  meta: {
                    address: customerData.customerAddress?.value,
                    partyNumber: customerData.customerPartyNumber?.value,
                  },
                },
                create: {
                  customerId,
                  name: customerData.customerName.value,
                  meta: {
                    address: customerData.customerAddress?.value,
                    partyNumber: customerData.customerPartyNumber?.value,
                  },
                },
              });
            }

            // Parse dates
            const invoiceDate = invoiceData.invoiceDate?.value
              ? new Date(invoiceData.invoiceDate.value)
              : new Date();
            const dueDate = invoiceData.dueDate?.value
              ? new Date(invoiceData.dueDate.value)
              : null;

            // Parse amounts - check both payment and summary sections
            const parseAmount = (val: string | number | undefined): number => {
              if (!val) return 0;
              if (typeof val === 'number') return Math.abs(val); // Handle negative values
              const cleaned = String(val).replace(/[^0-9.-]/g, '');
              return Math.abs(parseFloat(cleaned) || 0);
            };

            // Try summary section first, then payment section
            const summaryData = llmData.summary?.value;
            const subtotal = parseAmount(summaryData?.subTotal?.value || paymentData?.subtotal?.value);
            const tax = parseAmount(summaryData?.totalTax?.value || paymentData?.tax?.value);
            const totalAmount = parseAmount(summaryData?.invoiceTotal?.value || paymentData?.totalAmount?.value) || (subtotal + tax);

            // Get currency from summary or payment
            const currency = summaryData?.currencySymbol?.value || paymentData?.currency?.value || 'EUR';
            
            // Create Invoice
            const invoice = await tx.invoice.create({
              data: {
                invoiceNo: invoiceData.invoiceId.value,
                vendorId: vendor?.id || null,
                customerId: customer?.id || null,
                date: invoiceDate,
                dueDate: dueDate,
                status: paymentData?.paymentStatus?.value || 'unpaid',
                currency: currency,
                subtotal: subtotal > 0 ? subtotal : null,
                tax: tax > 0 ? tax : null,
                totalAmount: totalAmount > 0 ? totalAmount : 0,
              },
            });
            invoiceCount++;

            // Create Line Items
            for (const lineItem of lineItemsData) {
              // Handle both totalPrice and total fields
              const total = lineItem.totalPrice?.value || lineItem.total?.value;
              if (lineItem.description?.value || total) {
                await tx.lineItem.create({
                  data: {
                    invoiceId: invoice.id,
                    description: lineItem.description?.value || null,
                    quantity: parseAmount(lineItem.quantity?.value) || null,
                    unitPrice: parseAmount(lineItem.unitPrice?.value) || null,
                    total: parseAmount(total) || null,
                    category: lineItem.category?.value || lineItem.Sachkonto?.value || null,
                  },
                });
                lineItemCount++;
              }
            }

            // Create Payment
            if (paymentData && totalAmount > 0) {
              const paymentDate = paymentData.paymentDate?.value
                ? new Date(paymentData.paymentDate.value)
                : null;

              await tx.payment.create({
                data: {
                  invoiceId: invoice.id,
                  amount: totalAmount,
                  method: paymentData.paymentMethod?.value || null,
                  date: paymentDate,
                  status: paymentData.paymentStatus?.value || 'pending',
                },
              });
              paymentCount++;
            }

            // Create Document
            if (item.metadata || item.filePath) {
              await tx.document.create({
                data: {
                  invoiceId: invoice.id,
                  fileName: item.metadata?.originalFileName || item.name || null,
                  url: item.filePath || null,
                  uploadedAt: item.metadata?.uploadedAt
                    ? new Date(item.metadata.uploadedAt)
                    : new Date(),
                },
              });
              documentCount++;
            }

            processedCount++;
          } catch (error) {
            console.error(`Error processing item ${item._id}:`, error);
          }
        }
      });

      if ((i + batchSize) % 500 === 0) {
        console.log(`✅ Processed ${i + batchSize} / ${testData.length} items...`);
      }
    }

    console.log('\n📈 Seed Summary:');
    console.log(`   Processed: ${processedCount} documents`);
    console.log(`   Vendors: ${vendorCount}`);
    console.log(`   Customers: ${customerCount}`);
    console.log(`   Invoices: ${invoiceCount}`);
    console.log(`   Line Items: ${lineItemCount}`);
    console.log(`   Payments: ${paymentCount}`);
    console.log(`   Documents: ${documentCount}`);
    console.log('\n✨ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

