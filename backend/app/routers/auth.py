import logging
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pymongo.errors import DuplicateKeyError

from app.auth.dependencies import get_current_user
from app.auth.security import (
    create_access_token,
    hash_password,
    hash_token,
    new_refresh_token,
    utcnow_naive,
    verify_password,
)
from app.config import settings
from app.database import database
from app.schemas import AuthResponse, LoginRequest, RegisterRequest, UserOut

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["auth"])

REFRESH_COOKIE = "refresh_token"
COOKIE_PATH = "/api/auth"  # the cookie is only sent to auth endpoints


def user_out(user: dict) -> UserOut:
    return UserOut(
        id=str(user["_id"]),
        email=user["email"],
        name=user["name"],
        role=user.get("role", "user"),
    )


def set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=REFRESH_COOKIE,
        value=token,
        max_age=settings.refresh_token_expire_days * 24 * 3600,
        httponly=True,
        samesite="lax",
        secure=settings.auth_cookie_secure,
        path=COOKIE_PATH,
    )


async def issue_session(response: Response, user: dict) -> AuthResponse:
    """Create an access token and a stored, rotatable refresh token."""
    refresh_token = new_refresh_token()
    await database["refresh_tokens"].insert_one(
        {
            "token_hash": hash_token(refresh_token),
            "user_id": user["_id"],
            "expires_at": utcnow_naive()
            + timedelta(days=settings.refresh_token_expire_days),
        }
    )
    set_refresh_cookie(response, refresh_token)
    return AuthResponse(
        access_token=create_access_token(str(user["_id"]), user.get("role", "user")),
        user=user_out(user),
    )


@router.post("/register", response_model=AuthResponse, status_code=201)
async def register(body: RegisterRequest, response: Response):
    email = body.email.lower()
    users = database["users"]

    if await users.find_one({"email": email}, {"_id": 1}):
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    user = {
        "email": email,
        "password_hash": hash_password(body.password),
        "name": body.name.strip(),
        "role": "user",
        "is_active": True,
        "created_at": utcnow_naive(),
    }
    try:
        result = await users.insert_one(user)
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")
    user["_id"] = result.inserted_id

    return await issue_session(response, user)


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest, response: Response):
    user = await database["users"].find_one({"email": body.email.lower()})

    # Same message for unknown email and wrong password: do not reveal which.
    if user is None or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    if not user.get("is_active", True):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    return await issue_session(response, user)


@router.post("/refresh", response_model=AuthResponse)
async def refresh(request: Request, response: Response):
    token = request.cookies.get(REFRESH_COOKIE)
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token.")

    tokens = database["refresh_tokens"]
    stored = await tokens.find_one({"token_hash": hash_token(token)})
    if stored is None or stored["expires_at"] < utcnow_naive():
        if stored is not None:
            await tokens.delete_one({"_id": stored["_id"]})
        response.delete_cookie(REFRESH_COOKIE, path=COOKIE_PATH)
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")

    user = await database["users"].find_one({"_id": stored["user_id"]})
    if user is None or not user.get("is_active", True):
        await tokens.delete_one({"_id": stored["_id"]})
        response.delete_cookie(REFRESH_COOKIE, path=COOKIE_PATH)
        raise HTTPException(status_code=401, detail="User not found or disabled.")

    # Rotation: the used refresh token is replaced by a new one.
    await tokens.delete_one({"_id": stored["_id"]})
    return await issue_session(response, user)


@router.post("/logout", status_code=204)
async def logout(request: Request, response: Response):
    token = request.cookies.get(REFRESH_COOKIE)
    if token:
        await database["refresh_tokens"].delete_one({"token_hash": hash_token(token)})
    response.delete_cookie(REFRESH_COOKIE, path=COOKIE_PATH)
    return Response(status_code=204)


@router.get("/me", response_model=UserOut)
async def me(user: dict = Depends(get_current_user)):
    return user_out(user)
