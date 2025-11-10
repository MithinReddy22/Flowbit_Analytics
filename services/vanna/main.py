import os
import re
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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
VANNA_API_KEY = os.getenv("VANNA_API_KEY", "f5c8dd3bf1fed3d3015dd4af4fa03c38f970b7affc2fe74999ed938706d0d170")
PORT = int(os.getenv("PORT", "8000"))

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

# Simple mock SQL generation
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
    else:
        sql = "SELECT COUNT(*) as row_count FROM invoices"
        explain = "Returns the total number of invoices in the database"
    
    return sql, explain

# Generate mock data
def generate_mock_data(sql: str) -> tuple[List[str], List[Dict[str, Any]]]:
    """Generate mock data based on SQL pattern"""
    if "COUNT" in sql.upper():
        return ["row_count"], [{"row_count": 1250}]
    elif "SUM" in sql.upper() and "total_spend" in sql:
        return ["total_spend"], [{"total_spend": 2500000.50}]
    elif "AVG" in sql.upper():
        return ["avg_invoice_value"], [{"avg_invoice_value": 2000.00}]
    elif "vendors" in sql.lower() and "total_spend" in sql.lower():
        return ["name", "total_spend"], [
            {"name": "Tech Corp", "total_spend": 500000.00},
            {"name": "Office Supplies Inc", "total_spend": 250000.00},
            {"name": "Software Solutions", "total_spend": 180000.00}
        ]
    else:
        return ["result"], [{"result": "Mock data"}]

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Vanna AI SQL Generator"}

@app.post("/generate-sql", dependencies=[Depends(verify_api_key)])
async def generate_sql(request: SQLRequest):
    try:
        # Generate SQL and explanation
        sql, explain = generate_mock_sql(request.question)
        
        # Generate mock data
        columns, rows = generate_mock_data(sql)
        
        return SQLResponse(
            sql=sql,
            explain=explain,
            columns=columns,
            rows=rows,
            truncated=False
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
