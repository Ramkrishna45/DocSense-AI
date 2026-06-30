"""Authentication router for user registration, login, and profile."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.auth import (
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
)
from app.services.auth_service import authenticate_user, register_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=201,
    summary="Register a new user account",
)
async def register(
    user_data: UserRegister,
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """Register a new user with name, email, and password.

    - Validates email uniqueness
    - Hashes password with bcrypt
    - Returns user profile (without password)
    """
    user = await register_user(db, user_data)
    return UserResponse.model_validate(user)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login and get access token",
)
async def login(
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Authenticate with email and password to receive a JWT access token.

    - Validates credentials against stored bcrypt hash
    - Returns Bearer token valid for configured hours
    """
    access_token = await authenticate_user(db, credentials.email, credentials.password)
    return TokenResponse(access_token=access_token)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user profile",
)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Get the authenticated user's profile information.

    Requires valid Bearer token in Authorization header.
    """
    return UserResponse.model_validate(current_user)
