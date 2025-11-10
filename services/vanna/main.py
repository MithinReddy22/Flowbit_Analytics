import os
import re
import asyncio
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import asyncpg
from dotenv import load_dotenv
import sqlparse

load_dotenv()

app = FastAPI(title="Vanna AI SQL Generator", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
VANNA_API_KEY = os.getenv("VANNA_API_KEY")
PORT = int(os.getenv("PORT", "8000"))

# SQL keywords to reject
FORBIDDEN_KEYWORDS = [
    "INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "TRUNCATE",
    "CREATE", "GRANT", "REVOKE", "PROCEDURE", "EXEC", "EXECUTE",
    "MERGE", "REPLACE", "COPY", "IMPORT", "EXPORT"
]

# Request/Response models
class SQLRequest(BaseModel):
    question: str
    schema: Optional[str] = None

class SQLResponse(BaseModel):
    sql: str
    explain: str
    columns: List[str]
    rows: List[Dict[str, Any]]
    truncated: Optional[bool] = False

# Dependency for API key validation
async def verify_api_key(authorization: Optional[str] = Header(None)):
    if VANNA_API_KEY:
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
        token = authorization.replace("Bearer ", "")
        if token != VANNA_API_KEY:
            raise HTTPException(status_code=403, detail="Invalid API key")
    return True

# Simple mock SQL generation for testing
def generate_mock_sql(question: str) -> tuple[str, str]:
    """Generate mock SQL based on common question patterns"""
    question_lower = question.lower()
    
    if "total spend" in question_lower or "total amount" in question_lower:
        sql = "SELECT SUM(total_amount) as total_spend FROM invoices"
        explain = "Calculates the total spend across all invoices"
    elif "total invoices" in question_lower or "count invoices" in question_lower:
        sql = "SELECT COUNT(*) as total_invoices FROM invoices"
        explain = "Counts the total number of invoices"
    elif "average" in question_lower and ("invoice" in question_lower or "spend" in question_lower):
        sql = "SELECT AVG(total_amount) as avg_invoice_value FROM invoices"
        explain = "Calculates the average invoice value"
    elif "vendors" in question_lower and ("top" in question_lower or "spend" in question_lower):
        sql = """SELECT v.name, SUM(i.total_amount) as total_spend 
                 FROM vendors v 
                 JOIN invoices i ON v.id = i.vendor_id 
                 GROUP BY v.id, v.name 
                 ORDER BY total_spend DESC 
                 LIMIT 10"""
        explain = "Shows the top 10 vendors by total spending"
    elif "customers" in question_lower:
        sql = """SELECT c.name, COUNT(i.id) as invoice_count, SUM(i.total_amount) as total_spend 
                 FROM customers c 
                 JOIN invoices i ON c.id = i.customer_id 
                 GROUP BY c.id, c.name 
                 ORDER BY total_spend DESC"""
        explain = "Shows all customers with their invoice count and total spending"
    elif "unpaid" in question_lower or "outstanding" in question_lower:
        sql = """SELECT invoice_number, vendor_id, total_amount, due_date 
                 FROM invoices 
                 WHERE status != 'paid' 
                 ORDER BY due_date ASC"""
        explain = "Lists all unpaid invoices ordered by due date"
    elif "category" in question_lower and ("spend" in question_lower or "spending" in question_lower):
        sql = """SELECT li.category, SUM(li.total) as total_spend 
                 FROM line_items li 
                 GROUP BY li.category 
                 ORDER BY total_spend DESC"""
        explain = "Shows total spending by category"
    else:
        # Default response
        sql = "SELECT COUNT(*) as row_count FROM invoices"
        explain = "Returns the total number of invoices in the database"
    
    return sql, explain

# SQL sanitization
def sanitize_sql(sql: str) -> tuple[bool, str]:
    """
    Sanitize SQL to ensure it's safe to execute.
    Returns (is_safe, sanitized_sql)
    """
    # Remove comments
    sql = sqlparse.format(sql, strip_comments=True)
    
    # Normalize whitespace
    sql = re.sub(r'\s+', ' ', sql.strip())
    
    # Check for forbidden keywords (case-insensitive)
    sql_upper = sql.upper()
    for keyword in FORBIDDEN_KEYWORDS:
        if re.search(rf'\b{keyword}\b', sql_upper):
            return False, f"SQL contains forbidden keyword: {keyword}"
    
    # Check for semicolon chaining
    if sql.count(';') > 1 or (sql.count(';') == 1 and not sql.strip().endswith(';')):
        return False, "SQL contains multiple statements (semicolon chaining not allowed)"
    
    # Ensure it starts with SELECT
    if not sql_upper.strip().startswith('SELECT'):
        return False, "Only SELECT statements are allowed"
    
    # Remove trailing semicolon if present
    sql = sql.rstrip(';').strip()
    
    return True, sql

# Execute SQL query
async def execute_sql(sql: str, pool: asyncpg.Pool) -> tuple[List[str], List[Dict[str, Any]], bool]:
    """
    Execute SQL query and return columns, rows, and truncation flag.
    """
    try:
        async with pool.acquire() as conn:
            rows = await conn.fetch(sql)
            
            if not rows:
                return [], [], False
            
            # Get column names
            columns = list(rows[0].keys())
            
            # Convert rows to dictionaries
            result_rows = []
            truncated = False
            max_rows = 1000
            max_text_length = 500
            
            for row in rows:
                row_dict = {}
                for col in columns:
                    value = row[col]
                    if isinstance(value, str) and len(value) > max_text_length:
                        value = value[:max_text_length] + "..."
                        truncated = True
                    row_dict[col] = value
                result_rows.append(row_dict)
                
                if len(result_rows) >= max_rows:
                    truncated = True
                    break
            
            return columns, result_rows, truncated
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Database connection pool
pool: Optional[asyncpg.Pool] = None

@app.on_event("startup")
async def startup():
    global pool
    if DATABASE_URL:
        pool = await asyncpg.create_pool(DATABASE_URL, min_size=2, max_size=10)

@app.on_event("shutdown")
async def shutdown():
    if pool:
        await pool.close()

@app.get("/health")
async def health():
    """Health check endpoint"""
    db_status = "connected" if pool else "disconnected"
    return {"status": "ok", "db": db_status}

@app.post("/generate-sql", response_model=SQLResponse, dependencies=[Depends(verify_api_key)])
async def generate_sql(request: SQLRequest):
    """Generate SQL and execute it"""
    if not pool:
        raise HTTPException(status_code=503, detail="Database not connected")
    
    try:
        # Generate SQL (using mock function for now)
        sql, explain = generate_mock_sql(request.question)
        
        # Sanitize SQL
        is_safe, sanitized_sql = sanitize_sql(sql)
        if not is_safe:
            raise HTTPException(status_code=400, detail=sanitized_sql)
        
        # Execute SQL
        columns, rows, truncated = await execute_sql(sanitized_sql, pool)
        
        return SQLResponse(
            sql=sanitized_sql,
            explain=explain,
            columns=columns,
            rows=rows,
            truncated=truncated
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
