import os
import re
import asyncio
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import asyncpg
from groq import Groq
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
    
    # Add LIMIT if not present (safety measure)
    if 'LIMIT' not in sql_upper:
        sql = f"{sql} LIMIT 1000"
    
    return True, sql

# Database connection pool
async def get_db_pool():
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL not set")
    
    # Convert psycopg URL to asyncpg format if needed
    db_url = DATABASE_URL.replace("postgresql+psycopg://", "postgresql://")
    
    pool = await asyncpg.create_pool(db_url, min_size=1, max_size=5)
    return pool

# LLM SQL generation
async def generate_sql(question: str, schema_context: Optional[str] = None) -> tuple[str, str]:
    """
    Generate SQL from natural language question using Groq LLM.
    Returns (sql, explanation)
    """
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")
    
    client = Groq(api_key=GROQ_API_KEY)
    
    # Build prompt
    prompt = f"""You are a SQL expert. Generate a PostgreSQL SELECT query based on the user's question.

Database Schema:
{schema_context or "No schema context provided"}

Rules:
1. Generate ONLY a single SELECT statement
2. Use PostgreSQL syntax
3. Do NOT include any comments, explanations, or markdown formatting
4. Return ONLY the SQL query, nothing else
5. Use proper JOINs when needed
6. Use appropriate aggregate functions (SUM, COUNT, AVG, etc.) when requested
7. Include WHERE clauses for filtering
8. Use LIMIT 1000 if the query might return many rows

User Question: {question}

SQL Query:"""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are a SQL expert. Generate only PostgreSQL SELECT queries. Return only the SQL query, no explanations."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.1,
            max_tokens=500,
        )
        
        sql = response.choices[0].message.content.strip()
        
        # Remove markdown code blocks if present
        sql = re.sub(r'^```sql\s*', '', sql, flags=re.MULTILINE)
        sql = re.sub(r'^```\s*', '', sql, flags=re.MULTILINE)
        sql = sql.strip()
        
        # Generate explanation
        explain_prompt = f"Explain what this SQL query does in one sentence: {sql}"
        explain_response = client.chat.completions.create(
            model="llama-3.1-70b-versatile",
            messages=[
                {"role": "user", "content": explain_prompt}
            ],
            temperature=0.3,
            max_tokens=100,
        )
        explain = explain_response.choices[0].message.content.strip()
        
        return sql, explain
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM error: {str(e)}")

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
            
            for i, row in enumerate(rows):
                if i >= max_rows:
                    truncated = True
                    break
                
                row_dict = {}
                for col in columns:
                    value = row[col]
                    # Truncate long text fields
                    if isinstance(value, str) and len(value) > max_text_length:
                        value = value[:max_text_length] + "..."
                    row_dict[col] = value
                
                result_rows.append(row_dict)
            
            return columns, result_rows, truncated
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Endpoints
@app.get("/health")
async def health():
    """Health check endpoint"""
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
        return {"status": "ok", "db": "connected"}
    except Exception as e:
        return {"status": "error", "db": "disconnected", "error": str(e)}

@app.post("/generate-sql", response_model=SQLResponse, dependencies=[Depends(verify_api_key)])
async def generate_sql_endpoint(request: SQLRequest):
    """
    Generate SQL from natural language and execute it.
    """
    try:
        # Generate SQL
        sql, explain = await generate_sql(request.question, request.schema)
        
        # Sanitize SQL
        is_safe, sanitized_sql = sanitize_sql(sql)
        if not is_safe:
            raise HTTPException(status_code=400, detail=f"Unsafe SQL detected: {sanitized_sql}")
        
        # Get database pool
        pool = await get_db_pool()
        
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

@app.post("/chat-stream", dependencies=[Depends(verify_api_key)])
async def chat_stream(request: SQLRequest):
    """
    Streaming endpoint for SQL generation (SSE).
    """
    import json
    
    async def generate():
        try:
            # Generate SQL
            sql, explain = await generate_sql(request.question, request.schema)
            
            # Sanitize SQL
            is_safe, sanitized_sql = sanitize_sql(sql)
            if not is_safe:
                yield f"data: {json.dumps({'error': f'Unsafe SQL: {sanitized_sql}'})}\n\n"
                return
            
            # Send SQL
            yield f"data: {json.dumps({'type': 'sql', 'sql': sanitized_sql, 'explain': explain})}\n\n"
            
            # Execute SQL
            pool = await get_db_pool()
            columns, rows, truncated = await execute_sql(sanitized_sql, pool)
            
            # Send results
            yield f"data: {json.dumps({'type': 'results', 'columns': columns, 'rows': rows, 'truncated': truncated})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)


