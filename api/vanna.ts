import { NextRequest, NextResponse } from 'next/server';

const VANNA_API_KEY = 'f5c8dd3bf1fed3d3015dd4af4fa03c38f970b7affc2fe74999ed938706d0d170';

// Mock SQL generation function
function generateMockSQL(question: string): { sql: string; explain: string } {
  const questionLower = question.toLowerCase();
  
  if (questionLower.includes('total spend') || questionLower.includes('total amount')) {
    return {
      sql: "SELECT SUM(total_amount) as total_spend FROM invoices",
      explain: "Calculates the total spend across all invoices"
    };
  } else if (questionLower.includes('total invoices') || questionLower.includes('count invoices')) {
    return {
      sql: "SELECT COUNT(*) as total_invoices FROM invoices",
      explain: "Counts the total number of invoices"
    };
  } else if (questionLower.includes('average') && (questionLower.includes('invoice') || questionLower.includes('spend'))) {
    return {
      sql: "SELECT AVG(total_amount) as avg_invoice_value FROM invoices",
      explain: "Calculates the average invoice value"
    };
  } else if (questionLower.includes('vendors') && (questionLower.includes('top') || questionLower.includes('spend'))) {
    return {
      sql: `SELECT v.name, SUM(i.total_amount) as total_spend 
           FROM vendors v 
           JOIN invoices i ON v.id = i.vendor_id 
           GROUP BY v.id, v.name 
           ORDER BY total_spend DESC 
           LIMIT 10`,
      explain: "Shows the top 10 vendors by total spending"
    };
  } else {
    return {
      sql: "SELECT COUNT(*) as row_count FROM invoices",
      explain: "Returns the total number of invoices in the database"
    };
  }
}

// Generate mock data
function generateMockData(sql: string): { columns: string[]; rows: any[] } {
  if (sql.includes('COUNT')) {
    return {
      columns: ['row_count'],
      rows: [{ row_count: 1250 }]
    };
  } else if (sql.includes('SUM') && sql.includes('total_spend')) {
    return {
      columns: ['total_spend'],
      rows: [{ total_spend: 2500000.50 }]
    };
  } else if (sql.includes('AVG')) {
    return {
      columns: ['avg_invoice_value'],
      rows: [{ avg_invoice_value: 2000.00 }]
    };
  } else if (sql.includes('vendors') && sql.includes('total_spend')) {
    return {
      columns: ['name', 'total_spend'],
      rows: [
        { name: 'Tech Corp', total_spend: 500000.00 },
        { name: 'Office Supplies Inc', total_spend: 250000.00 },
        { name: 'Software Solutions', total_spend: 180000.00 }
      ]
    };
  } else {
    return {
      columns: ['result'],
      rows: [{ result: 'Mock data' }]
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify API key
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    if (token !== VANNA_API_KEY) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { question } = body;

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Generate SQL and explanation
    const { sql, explain } = generateMockSQL(question);
    
    // Generate mock data
    const { columns, rows } = generateMockData(sql);

    return NextResponse.json({
      sql,
      explain,
      columns,
      rows,
      truncated: false
    });

  } catch (error) {
    console.error('Vanna API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'Vanna AI SQL Generator',
    platform: 'Vercel Serverless'
  });
}
