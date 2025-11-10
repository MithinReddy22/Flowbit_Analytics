'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { StatsCards } from './stats-cards';
import { InvoiceTrendsChart } from './invoice-trends-chart';
import { TopVendorsChart } from './top-vendors-chart';
import { CategorySpendChart } from './category-spend-chart';
import { CashOutflowChart } from './cash-outflow-chart';
import { InvoicesTable } from './invoices-table';

export function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => apiClient.getStats(),
  });

  const { data: invoiceTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ['invoice-trends'],
    queryFn: () => apiClient.getInvoiceTrends(),
  });

  const { data: topVendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ['top-vendors'],
    queryFn: () => apiClient.getTopVendors(),
  });

  const { data: categorySpend, isLoading: categoryLoading } = useQuery({
    queryKey: ['category-spend'],
    queryFn: () => apiClient.getCategorySpend(),
  });

  const { data: cashOutflow, isLoading: outflowLoading } = useQuery({
    queryKey: ['cash-outflow'],
    queryFn: () => apiClient.getCashOutflow(),
  });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <StatsCards stats={stats} isLoading={statsLoading} />

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        <InvoiceTrendsChart data={invoiceTrends || []} isLoading={trendsLoading} />
        <TopVendorsChart data={topVendors || []} isLoading={vendorsLoading} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 md:grid-cols-2">
        <CategorySpendChart data={categorySpend || []} isLoading={categoryLoading} />
        <CashOutflowChart data={cashOutflow || []} isLoading={outflowLoading} />
      </div>

      {/* Invoices Table */}
      <InvoicesTable />
    </div>
  );
}


