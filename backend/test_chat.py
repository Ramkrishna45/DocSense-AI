import asyncio
from app.database import async_session
from app.services.chat_service import process_chat
from app.models.user import User
from sqlalchemy import select

async def test():
    async with async_session() as db:
        result = await db.execute(select(User).limit(1))
        user = result.scalar_one_or_none()
        if not user:
            print('No user')
            return
        print(f"Using user {user.id}")
        res = await process_chat(db, user.id, 'What is this?')
        print(res)

if __name__ == '__main__':
    asyncio.run(test())
