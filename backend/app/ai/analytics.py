"""Text-to-SQL analytics chain powered by LangChain + Gemini."""

import re

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.llm import get_llm

# Full schema description for the LLM prompt
DB_SCHEMA = """
DATABASE SCHEMA (SQLite):

Table: users
  - id            INTEGER  PRIMARY KEY
  - username      VARCHAR(50)   NOT NULL, UNIQUE
  - hashed_password VARCHAR(255) NOT NULL
  - name          VARCHAR(100)  NOT NULL
  - role          VARCHAR(20)   NOT NULL  ("staff" or "admin")
  - created_at    DATETIME      NOT NULL

Table: menu_items
  - id            INTEGER  PRIMARY KEY
  - name          VARCHAR(100)  NOT NULL
  - description   TEXT          NULLABLE
  - price         FLOAT         NOT NULL
  - category      VARCHAR(50)   NOT NULL  (e.g. Appetizers, Mains, Desserts, Beverages)
  - image_url     VARCHAR(255)  NULLABLE
  - is_available  BOOLEAN       NOT NULL  DEFAULT TRUE
  - created_at    DATETIME      NOT NULL

Table: orders
  - id            INTEGER  PRIMARY KEY
  - status        VARCHAR(20)   NOT NULL  ("Received", "Preparing", "Ready", "Delivered")
  - total         FLOAT         NOT NULL
  - items         JSON          NOT NULL  (array of {menu_item_id, name, quantity, unit_price, subtotal})
  - created_at    DATETIME      NOT NULL

Table: customer_reviews
  - id            INTEGER  PRIMARY KEY
  - order_id      INTEGER       NOT NULL  FOREIGN KEY -> orders.id
  - review_text   TEXT          NOT NULL
  - created_at    DATETIME      NOT NULL
""".strip()

# Dangerous SQL keywords that should never appear in generated queries
_FORBIDDEN_PATTERN = re.compile(
    r"\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE)\b",
    re.IGNORECASE,
)


async def run_analytics(question: str, db: AsyncSession) -> dict:
    """
    Accept a natural-language question, generate a read-only SQL query via
    the LLM, execute it against the database, and return a human-readable
    summary of the results.
    """
    llm = get_llm()

    # ── Step 1: Generate SQL ─────────────────────────────────────────────
    sql_prompt = (
        f"You are a SQL expert. Given the following SQLite database schema:\n\n"
        f"{DB_SCHEMA}\n\n"
        f"Write a single READ-ONLY SQL SELECT query to answer this question:\n"
        f"\"{question}\"\n\n"
        f"Rules:\n"
        f"- Return ONLY the raw SQL query, no markdown fences, no explanation.\n"
        f"- The query must be valid SQLite syntax.\n"
        f"- Do NOT use INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, or TRUNCATE.\n"
        f"- Keep the query concise and efficient.\n"
        f"- If the question cannot be answered from the schema, return: SELECT 'Not enough data' AS answer;"
    )

    sql_response = await llm.ainvoke(sql_prompt)
    sql = sql_response.content.strip()

    # Strip accidental markdown fences from LLM output
    if sql.startswith("```"):
        sql = re.sub(r"^```(?:sql)?\s*", "", sql)
        sql = re.sub(r"\s*```$", "", sql)
    sql = sql.strip()

    # ── Step 2: Safety check ─────────────────────────────────────────────
    if _FORBIDDEN_PATTERN.search(sql):
        return {
            "question": question,
            "sql": sql,
            "results": [],
            "answer": "The generated query was rejected because it contains "
                      "a write operation. Only read-only queries are allowed.",
        }

    # ── Step 3: Execute query ────────────────────────────────────────────
    try:
        result = await db.execute(text(sql))
        rows = result.fetchall()
        columns = list(result.keys())
        results = [dict(zip(columns, row)) for row in rows]
    except Exception as exc:
        return {
            "question": question,
            "sql": sql,
            "results": [],
            "answer": f"Query execution failed: {exc}",
        }

    # ── Step 4: Generate human-readable answer ───────────────────────────
    answer_prompt = (
        f"You are a helpful restaurant analytics assistant.\n"
        f"The user asked: \"{question}\"\n\n"
        f"The following SQL query was executed:\n{sql}\n\n"
        f"And produced these results:\n{results}\n\n"
        f"Please provide a clear, concise, human-readable answer based on "
        f"the results. Use plain language suitable for a restaurant manager. "
        f"If the results are empty, say so politely."
    )

    answer_response = await llm.ainvoke(answer_prompt)
    answer = answer_response.content.strip()

    return {
        "question": question,
        "sql": sql,
        "results": results,
        "answer": answer,
    }
