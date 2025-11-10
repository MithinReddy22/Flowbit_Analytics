import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { statsRouter } from './routes/stats';
import { invoiceTrendsRouter } from './routes/invoice-trends';
import { vendorsRouter } from './routes/vendors';
import { categorySpendRouter } from './routes/category-spend';
import { cashOutflowRouter } from './routes/cash-outflow';
import { invoicesRouter } from './routes/invoices';
import { chatRouter } from './routes/chat';
import { healthRouter } from './routes/health';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_APP_URL || '*',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/health', healthRouter);
app.use('/stats', statsRouter);
app.use('/invoice-trends', invoiceTrendsRouter);
app.use('/vendors', vendorsRouter);
app.use('/category-spend', categorySpendRouter);
app.use('/cash-outflow', cashOutflowRouter);
app.use('/invoices', invoicesRouter);
app.use('/chat-with-data', chatRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API server running on port ${PORT}`);
});


