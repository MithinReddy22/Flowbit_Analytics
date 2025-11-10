# ER Diagram

## Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                         VENDORS                             │
├─────────────────────────────────────────────────────────────┤
│ id (UUID, PK)                                               │
│ vendor_id (TEXT, UNIQUE)                                    │
│ name (TEXT, NOT NULL)                                       │
│ category (TEXT, NULLABLE)                                  │
│ meta (JSONB)                                                │
│ created_at (TIMESTAMP)                                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ 1:N
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        INVOICES                              │
├─────────────────────────────────────────────────────────────┤
│ id (UUID, PK)                                               │
│ invoice_number (TEXT, UNIQUE, NOT NULL)                      │
│ vendor_id (UUID, FK → vendors.id, ON DELETE SET NULL)       │
│ customer_id (UUID, FK → customers.id, ON DELETE SET NULL)   │
│ date (DATE, NOT NULL)                                       │
│ due_date (DATE, NULLABLE)                                   │
│ status (TEXT, NULLABLE)                                     │
│ currency (TEXT, NULLABLE)                                  │
│ subtotal (DECIMAL(14,2), NULLABLE)                          │
│ tax (DECIMAL(14,2), NULLABLE)                               │
│ total_amount (DECIMAL(14,2), NOT NULL, INDEXED)            │
│ created_at (TIMESTAMP)                                      │
│                                                              │
│ INDEXES:                                                    │
│   - vendor_id                                               │
│   - date                                                     │
│   - invoice_number                                           │
│   - total_amount                                             │
└─────────────────────────────────────────────────────────────┘
         │              │              │              │
         │              │              │              │
   1:N   │         1:N  │         1:N  │         1:N  │
         │              │              │              │
         ▼              ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ LINE_ITEMS  │ │  PAYMENTS   │ │ DOCUMENTS   │
├─────────────┤ ├─────────────┤ ├─────────────┤
│ id (PK)     │ │ id (PK)     │ │ id (PK)     │
│ invoice_id  │ │ invoice_id  │ │ invoice_id  │
│ description │ │ amount      │ │ file_name   │
│ quantity    │ │ method      │ │ url         │
│ unit_price  │ │ date        │ │ uploaded_at │
│ total       │ │ status      │ └─────────────┘
│ category    │ └─────────────┘
└─────────────┘
     │
     │ ON DELETE CASCADE
     │

┌─────────────────────────────────────────────────────────────┐
│                        CUSTOMERS                            │
├─────────────────────────────────────────────────────────────┤
│ id (UUID, PK)                                               │
│ customer_id (TEXT, UNIQUE)                                  │
│ name (TEXT, NULLABLE)                                       │
│ meta (JSONB)                                                │
│ created_at (TIMESTAMP)                                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ 1:N
                            │
                            ▼
                    (see INVOICES above)
```

## Relationships

1. **vendors** → **invoices** (1:N)
   - One vendor can have many invoices
   - Foreign key: `invoices.vendor_id` → `vendors.id`
   - ON DELETE: SET NULL

2. **customers** → **invoices** (1:N)
   - One customer can have many invoices
   - Foreign key: `invoices.customer_id` → `customers.id`
   - ON DELETE: SET NULL

3. **invoices** → **line_items** (1:N)
   - One invoice can have many line items
   - Foreign key: `line_items.invoice_id` → `invoices.id`
   - ON DELETE: CASCADE

4. **invoices** → **payments** (1:N)
   - One invoice can have many payments
   - Foreign key: `payments.invoice_id` → `invoices.id`
   - ON DELETE: CASCADE

5. **invoices** → **documents** (1:N)
   - One invoice can have many documents
   - Foreign key: `documents.invoice_id` → `invoices.id`
   - ON DELETE: CASCADE

## Indexes

- `vendors.vendor_id` (UNIQUE)
- `customers.customer_id` (UNIQUE)
- `invoices.invoice_number` (UNIQUE)
- `invoices.vendor_id` (INDEX)
- `invoices.date` (INDEX)
- `invoices.total_amount` (INDEX)
- `line_items.invoice_id` (INDEX)
- `payments.invoice_id` (INDEX)
- `documents.invoice_id` (INDEX)

## Constraints

- All primary keys are UUIDs
- `invoices.total_amount` has CHECK constraint: `>= 0`
- Foreign keys enforce referential integrity
- Unique constraints prevent duplicates


