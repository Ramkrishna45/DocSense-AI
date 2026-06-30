"""Authentication service for user registration and login."""

import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import UserRegister


async def register_user(db: AsyncSession, user_data: UserRegister) -> User:
    """Register a new user account.

    Args:
        db: Async database session.
        user_data: Registration data (name, email, password).

    Returns:
        The newly created User object.

    Raises:
        HTTPException: 409 if email is already registered.
    """
    # Check for existing email
    result = await db.execute(
        select(User).where(User.email == user_data.email)
    )
    existing_user = result.scalar_one_or_none()

    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    # Create new user with hashed password
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
    )
    db.add(new_user)
    await db.flush()
    await db.refresh(new_user)

    return new_user


async def authenticate_user(db: AsyncSession, email: str, password: str) -> str:
    """Authenticate a user and return a JWT access token.

    Args:
        db: Async database session.
        email: User's email address.
        password: User's plain-text password.

    Returns:
        JWT access token string.

    Raises:
        HTTPException: 401 if credentials are invalid.
    """
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user is None or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Create JWT with user ID as subject
    access_token = create_access_token(data={"sub": str(user.id)})
    return access_token


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
    """Fetch a user by their ID.

    Args:
        db: Async database session.
        user_id: The user's UUID.

    Returns:
        The User object, or None if not found.
    """
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()
