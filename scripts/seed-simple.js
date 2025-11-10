const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://flowbit:flowbit_password@localhost:5432/flowbit',
    },
  },
});

async function seed() {
  console.log('🌱 Starting seed process...');

  try {
    // Read test data
    const dataPath = path.join(__dirname, '..', 'data', 'Analytics_Test_Data.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const testData = JSON.parse(rawData);

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
            const summaryData = llmData.summary?.value;
            const lineItemsData = llmData.lineItems?.value?.items?.value || llmData.lineItems?.value || [];

            // Skip if no invoice data
            if (!invoiceData?.invoiceId?.value) continue;

            // Parse amounts
            const parseAmount = (val) => {
              if (!val) return 0;
              if (typeof val === 'number') return Math.abs(val);
              const cleaned = String(val).replace(/[^0-9.-]/g, '');
              return Math.abs(parseFloat(cleaned) || 0);
            };

            // Upsert Vendor
            let vendor = null;
            if (vendorData?.vendorName?.value) {
              const vendorId = vendorData.vendorPartyNumber?.value || `vendor-${item._id}`;
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
              if (!(await tx.vendor.findUnique({ where: { vendorId } }))) vendorCount++;
            }

            // Upsert Customer
            let customer = null;
            if (customerData?.customerName?.value) {
              const customerId = customerData.customerPartyNumber?.value || `customer-${item._id}`;
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
              if (!(await tx.customer.findUnique({ where: { customerId } }))) customerCount++;
            }

            // Parse dates
            const invoiceDate = invoiceData.invoiceDate?.value
              ? new Date(invoiceData.invoiceDate.value)
              : new Date();
            const dueDate = invoiceData.dueDate?.value
              ? new Date(invoiceData.dueDate.value)
              : null;

            // Get amounts from summary or payment
            const subtotal = parseAmount(summaryData?.subTotal?.value || paymentData?.subtotal?.value);
            const tax = parseAmount(summaryData?.totalTax?.value || paymentData?.tax?.value);
            const totalAmount = parseAmount(summaryData?.invoiceTotal?.value || paymentData?.totalAmount?.value) || (subtotal + tax);
            const currency = summaryData?.currencySymbol?.value || paymentData?.currency?.value || 'EUR';

            // Create Invoice
            const invoice = await tx.invoice.create({
              data: {
                invoiceNumber: invoiceData.invoiceId.value,
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
            console.error(`Error processing item ${item._id}:`, error.message);
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


