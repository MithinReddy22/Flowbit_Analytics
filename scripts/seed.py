import json
import os
import sys
from datetime import datetime
import psycopg
from urllib.parse import urlparse

DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://flowbit:flowbit_password@127.0.0.1:5432/flowbit')

# Parse database URL
def parse_db_url(url):
    parsed = urlparse(url)
    return {
        'host': parsed.hostname or '127.0.0.1',
        'port': parsed.port or 5432,
        'user': parsed.username or 'flowbit',
        'password': parsed.password or 'flowbit_password',
        'dbname': parsed.path.lstrip('/') or 'flowbit'
    }

def seed():
    print('Starting seed process...')
    
    # Read test data
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'Analytics_Test_Data.json')
    with open(data_path, 'r', encoding='utf-8') as f:
        test_data = json.load(f)
    
    print(f'Found {len(test_data)} documents to process')
    
    # Parse connection string
    db_params = parse_db_url(DATABASE_URL)
    print(f'Connecting to database: {db_params["user"]}@{db_params["host"]}:{db_params["port"]}/{db_params["dbname"]}')
    
    # Connect to database
    conn = psycopg.connect(
        host=db_params['host'],
        port=db_params['port'],
        user=db_params['user'],
        password=db_params['password'],
        dbname=db_params['dbname']
    )
    
    try:
        cursor = conn.cursor()
        
        # Clear existing data
        print('Clearing existing data...')
        cursor.execute('DELETE FROM documents')
        cursor.execute('DELETE FROM payments')
        cursor.execute('DELETE FROM line_items')
        cursor.execute('DELETE FROM invoices')
        cursor.execute('DELETE FROM customers')
        cursor.execute('DELETE FROM vendors')
        conn.commit()
        
        processed_count = 0
        vendor_count = 0
        customer_count = 0
        invoice_count = 0
        line_item_count = 0
        payment_count = 0
        document_count = 0
        
        vendor_map = {}
        customer_map = {}
        
        # Process in batches
        batch_size = 100
        for i in range(0, len(test_data), batch_size):
            batch = test_data[i:i + batch_size]
            
            try:
                for item in batch:
                    try:
                        llm_data = item.get('extractedData', {}).get('llmData', {})
                        if not llm_data:
                            continue
                        
                        invoice_data = llm_data.get('invoice', {}).get('value', {})
                        vendor_data = llm_data.get('vendor', {}).get('value', {})
                        customer_data = llm_data.get('customer', {}).get('value', {})
                        payment_data = llm_data.get('payment', {}).get('value', {})
                        summary_data = llm_data.get('summary', {}).get('value', {})
                        line_items_data = llm_data.get('lineItems', {}).get('value', {}).get('items', {}).get('value', []) or llm_data.get('lineItems', {}).get('value', [])
                        
                        # Skip if no invoice data
                        if not invoice_data.get('invoiceId', {}).get('value'):
                            continue
                        
                        # Parse amounts
                        def parse_amount(val):
                            if not val:
                                return 0
                            if isinstance(val, (int, float)):
                                return abs(val)
                            cleaned = str(val).replace(',', '').replace('€', '').replace('$', '').strip()
                            try:
                                return abs(float(cleaned))
                            except:
                                return 0
                        
                        # Upsert Vendor
                        vendor_id = None
                        if vendor_data.get('vendorName', {}).get('value'):
                            vendor_id_str = vendor_data.get('vendorPartyNumber', {}).get('value') or f"vendor-{item['_id']}"
                            
                            if vendor_id_str not in vendor_map:
                                vendor_name = vendor_data['vendorName']['value']
                                vendor_category = vendor_data.get('vendorCategory', {}).get('value')
                                
                                vendor_meta = json.dumps({
                                    'address': vendor_data.get('vendorAddress', {}).get('value'),
                                    'taxId': vendor_data.get('vendorTaxId', {}).get('value'),
                                    'partyNumber': vendor_data.get('vendorPartyNumber', {}).get('value'),
                                })
                                
                                cursor.execute("""
                                    INSERT INTO vendors (vendor_id, name, category, meta)
                                    VALUES (%s, %s, %s, %s::jsonb)
                                    ON CONFLICT (vendor_id) DO UPDATE
                                    SET name = EXCLUDED.name, category = EXCLUDED.category, meta = EXCLUDED.meta
                                    RETURNING id
                                """, (vendor_id_str, vendor_name, vendor_category, vendor_meta))
                                vendor_uuid = cursor.fetchone()[0]
                                
                                vendor_map[vendor_id_str] = str(vendor_uuid)
                                vendor_count += 1
                            
                            vendor_id = vendor_map[vendor_id_str]
                        
                        # Upsert Customer
                        customer_id = None
                        if customer_data.get('customerName', {}).get('value'):
                            customer_id_str = customer_data.get('customerPartyNumber', {}).get('value') or f"customer-{item['_id']}"
                            
                            if customer_id_str not in customer_map:
                                customer_name = customer_data['customerName']['value']
                                
                                customer_meta = json.dumps({
                                    'address': customer_data.get('customerAddress', {}).get('value'),
                                    'partyNumber': customer_data.get('customerPartyNumber', {}).get('value'),
                                })
                                
                                cursor.execute("""
                                    INSERT INTO customers (customer_id, name, meta)
                                    VALUES (%s, %s, %s::jsonb)
                                    ON CONFLICT (customer_id) DO UPDATE
                                    SET name = EXCLUDED.name, meta = EXCLUDED.meta
                                    RETURNING id
                                """, (customer_id_str, customer_name, customer_meta))
                                customer_uuid = cursor.fetchone()[0]
                                
                                customer_map[customer_id_str] = str(customer_uuid)
                                customer_count += 1
                            
                            customer_id = customer_map[customer_id_str]
                        
                        # Parse dates
                        invoice_date_str = invoice_data.get('invoiceDate', {}).get('value')
                        invoice_date = datetime.strptime(invoice_date_str, '%Y-%m-%d').date() if invoice_date_str else datetime.now().date()
                        
                        due_date_str = invoice_data.get('dueDate', {}).get('value')
                        due_date = datetime.strptime(due_date_str, '%Y-%m-%d').date() if due_date_str else None
                        
                        # Get amounts
                        subtotal = parse_amount(summary_data.get('subTotal', {}).get('value') or payment_data.get('subtotal', {}).get('value'))
                        tax = parse_amount(summary_data.get('totalTax', {}).get('value') or payment_data.get('tax', {}).get('value'))
                        total_amount = parse_amount(summary_data.get('invoiceTotal', {}).get('value') or payment_data.get('totalAmount', {}).get('value')) or (subtotal + tax)
                        currency = summary_data.get('currencySymbol', {}).get('value') or payment_data.get('currency', {}).get('value') or 'EUR'
                        
                        # Create Invoice
                        cursor.execute("""
                            INSERT INTO invoices (
                                invoice_number, vendor_id, customer_id, date, due_date,
                                status, currency, subtotal, tax, total_amount
                            )
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                            RETURNING id
                        """, (
                            invoice_data['invoiceId']['value'],
                            vendor_id,
                            customer_id,
                            invoice_date,
                            due_date,
                            payment_data.get('paymentStatus', {}).get('value') or 'unpaid',
                            currency,
                            subtotal if subtotal > 0 else None,
                            tax if tax > 0 else None,
                            total_amount if total_amount > 0 else 0
                        ))
                        invoice_uuid = cursor.fetchone()[0]
                        invoice_count += 1
                        
                        # Create Line Items
                        for line_item in line_items_data:
                            total = line_item.get('totalPrice', {}).get('value') or line_item.get('total', {}).get('value')
                            if line_item.get('description', {}).get('value') or total:
                                cursor.execute("""
                                    INSERT INTO line_items (
                                        invoice_id, description, quantity, unit_price, total, category
                                    )
                                    VALUES (%s, %s, %s, %s, %s, %s)
                                """, (
                                    str(invoice_uuid),
                                    line_item.get('description', {}).get('value'),
                                    parse_amount(line_item.get('quantity', {}).get('value')) if line_item.get('quantity', {}).get('value') else None,
                                    parse_amount(line_item.get('unitPrice', {}).get('value')) if line_item.get('unitPrice', {}).get('value') else None,
                                    parse_amount(total) if total else None,
                                    line_item.get('category', {}).get('value') or line_item.get('Sachkonto', {}).get('value')
                                ))
                                line_item_count += 1
                        
                        # Create Payment
                        if payment_data and total_amount > 0:
                            payment_date_str = payment_data.get('paymentDate', {}).get('value')
                            payment_date = datetime.strptime(payment_date_str, '%Y-%m-%d').date() if payment_date_str else None
                            
                            cursor.execute("""
                                INSERT INTO payments (invoice_id, amount, method, date, status)
                                VALUES (%s, %s, %s, %s, %s)
                            """, (
                                str(invoice_uuid),
                                total_amount,
                                payment_data.get('paymentMethod', {}).get('value'),
                                payment_date,
                                payment_data.get('paymentStatus', {}).get('value') or 'pending'
                            ))
                            payment_count += 1
                        
                        # Create Document
                        if item.get('metadata') or item.get('filePath'):
                            uploaded_at_str = item.get('metadata', {}).get('uploadedAt')
                            uploaded_at = datetime.fromisoformat(uploaded_at_str.replace('Z', '+00:00')) if uploaded_at_str else datetime.now()
                            
                            cursor.execute("""
                                INSERT INTO documents (invoice_id, file_name, url, uploaded_at)
                                VALUES (%s, %s, %s, %s)
                            """, (
                                str(invoice_uuid),
                                item.get('metadata', {}).get('originalFileName') or item.get('name'),
                                item.get('filePath'),
                                uploaded_at
                            ))
                            document_count += 1
                        
                        processed_count += 1
                    except Exception as e:
                        print(f"Error processing item {item.get('_id', 'unknown')}: {str(e)}")
                        continue
                
                # Commit batch
                conn.commit()
            except Exception as e:
                print(f"Error in batch {i}-{i+batch_size}: {str(e)}")
                conn.rollback()
                continue
            
            if (i + batch_size) % 500 == 0:
                print(f'Processed {i + batch_size} / {len(test_data)} items...')
        
        print('\nSeed Summary:')
        print(f'   Processed: {processed_count} documents')
        print(f'   Vendors: {vendor_count}')
        print(f'   Customers: {customer_count}')
        print(f'   Invoices: {invoice_count}')
        print(f'   Line Items: {line_item_count}')
        print(f'   Payments: {payment_count}')
        print(f'   Documents: {document_count}')
        print('\nSeed completed successfully!')
        
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    seed()

