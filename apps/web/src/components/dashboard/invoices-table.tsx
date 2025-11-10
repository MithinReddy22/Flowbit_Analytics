'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';
import { formatDate } from '@/lib/format';

export function InvoicesTable() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('date_desc');
  const limit = 25;

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', search, page, sort],
    queryFn: () => apiClient.getInvoices({ q: search, page, limit, sort }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const totalPages = data ? Math.ceil(data.total_count / limit) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
        <form onSubmit={handleSearch} className="mt-4 flex gap-2">
          <Input
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Button type="submit">Search</Button>
        </form>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 animate-pulse rounded bg-muted" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Invoice #</th>
                    <th className="p-2 text-left">Vendor</th>
                    <th className="p-2 text-left">
                      <button onClick={() => setSort(sort === 'date_desc' ? 'date_asc' : 'date_desc')}>
                        Date {sort === 'date_desc' ? '↓' : '↑'}
                      </button>
                    </th>
                    <th className="p-2 text-left">
                      <button
                        onClick={() => setSort(sort === 'amount_desc' ? 'amount_asc' : 'amount_desc')}
                      >
                        Amount {sort === 'amount_desc' ? '↓' : '↑'}
                      </button>
                    </th>
                    <th className="p-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.items.map((invoice) => (
                    <tr key={invoice.invoice_number} className="border-b">
                      <td className="p-2">{invoice.invoice_number}</td>
                      <td className="p-2">{invoice.vendor?.name || 'N/A'}</td>
                      <td className="p-2">{formatDate(invoice.date)}</td>
                      <td className="p-2">{formatCurrency(invoice.total_amount)}</td>
                      <td className="p-2">
                        <span
                          className={`rounded px-2 py-1 text-xs ${
                            invoice.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : invoice.status === 'overdue'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data?.total_count || 0)} of{' '}
                {data?.total_count || 0} invoices
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}


