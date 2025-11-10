import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Stats {
  totalSpend: number;
  invoicesProcessed: number;
  documentsUploaded: number;
  avgInvoiceValue: number;
}

export interface InvoiceTrend {
  month: string;
  invoice_count: number;
  total_spend: number;
}

export interface TopVendor {
  vendor_id: string;
  name: string;
  spend: number;
}

export interface CategorySpend {
  category: string;
  spend: number;
}

export interface CashOutflow {
  date: string;
  outflow: number;
}

export interface Invoice {
  invoice_number: string;
  vendor: { name: string } | null;
  date: string;
  total_amount: number;
  status: string;
}

export interface InvoicesResponse {
  total_count: number;
  items: Invoice[];
}

export interface ChatResponse {
  sql: string;
  explain: string;
  columns: string[];
  rows: Record<string, any>[];
  truncated?: boolean;
}

export const apiClient = {
  getStats: async (): Promise<Stats> => {
    const { data } = await api.get<Stats>('/stats');
    return data;
  },

  getInvoiceTrends: async (from?: string, to?: string): Promise<InvoiceTrend[]> => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const { data } = await api.get<InvoiceTrend[]>(`/invoice-trends?${params.toString()}`);
    return data;
  },

  getTopVendors: async (): Promise<TopVendor[]> => {
    const { data } = await api.get<TopVendor[]>('/vendors/top10');
    return data;
  },

  getCategorySpend: async (): Promise<CategorySpend[]> => {
    const { data } = await api.get<CategorySpend[]>('/category-spend');
    return data;
  },

  getCashOutflow: async (from?: string, to?: string): Promise<CashOutflow[]> => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const { data } = await api.get<CashOutflow[]>(`/cash-outflow?${params.toString()}`);
    return data;
  },

  getInvoices: async (params: {
    q?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<InvoicesResponse> => {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.append('q', params.q);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.sort) searchParams.append('sort', params.sort);
    const { data } = await api.get<InvoicesResponse>(`/invoices?${searchParams.toString()}`);
    return data;
  },

  chatWithData: async (question: string): Promise<ChatResponse> => {
    const { data } = await api.post<ChatResponse>('/chat-with-data', { question });
    return data;
  },
};


