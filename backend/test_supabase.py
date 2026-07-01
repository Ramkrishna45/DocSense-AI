import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import sys

# URL encoded password: Rk@8780518300 -> Rk%408780518300
DB_URL = "postgresql+asyncpg://postgres:Rk%408780518300@db.wxkljdgdbezbjkkckaiy.supabase.co:5432/postgres"

async def test_connection():
    engine = create_async_engine(DB_URL, echo=False)
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT version();"))
            row = result.fetchone()
            print(f"Successfully connected to Supabase! PostgreSQL version: {row[0]}")
    except Exception as e:
        print(f"Connection failed: {e}")
        sys.exit(1)
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_connection())
