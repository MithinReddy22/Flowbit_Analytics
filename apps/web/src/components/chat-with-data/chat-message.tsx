'use client';

import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';

interface ChatMessageProps {
  message: {
    type: 'user' | 'assistant';
    content: any;
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  if (message.type === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-lg bg-primary text-primary-foreground p-3">
          {message.content}
        </div>
      </div>
    );
  }

  if (message.content.error) {
    return (
      <div className="flex justify-start">
        <Card className="max-w-[80%]">
          <CardContent className="p-3">
            <div className="text-destructive">Error: {message.content.error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { sql, explain, columns, rows, truncated } = message.content;

  return (
    <div className="flex justify-start">
      <Card className="max-w-[80%]">
        <CardContent className="p-4 space-y-4">
          <div>
            <div className="text-sm font-semibold mb-1">Explanation:</div>
            <div className="text-sm text-muted-foreground">{explain}</div>
          </div>
          <div>
            <details className="cursor-pointer">
              <summary className="text-sm font-semibold mb-1">Generated SQL</summary>
              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                {sql}
              </pre>
            </details>
          </div>
          {rows && rows.length > 0 && (
            <div>
              <div className="text-sm font-semibold mb-2">Results:</div>
              {truncated && (
                <div className="text-xs text-muted-foreground mb-2">
                  Results truncated to 1000 rows
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b">
                      {columns.map((col: string) => (
                        <th key={col} className="p-2 text-left">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 50).map((row: any, idx: number) => (
                      <tr key={idx} className="border-b">
                        {columns.map((col: string) => (
                          <td key={col} className="p-2">
                            {typeof row[col] === 'number' && col.toLowerCase().includes('amount')
                              ? formatCurrency(row[col])
                              : String(row[col] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length > 50 && (
                  <div className="text-xs text-muted-foreground mt-2">
                    Showing first 50 of {rows.length} rows
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


