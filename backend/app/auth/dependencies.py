import jwt
from bson import ObjectId
from bson.errors import InvalidId
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.auth.security import decode_access_token
from app.database import database

bearer_scheme = HTTPBearer(auto_error=False)


def unauthorized(detail: str) -> HTTPException:
    return HTTPException(
        status_code=401,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict:
    if credentials is None:
        raise unauthorized("Not authenticated.")

    try:
        payload = decode_access_token(credentials.credentials)
    except jwt.PyJWTError:
        raise unauthorized("Invalid or expired token.")

    if payload.get("type") != "access":
        raise unauthorized("Invalid token type.")

    try:
        user_id = ObjectId(payload["sub"])
    except (InvalidId, KeyError, TypeError):
        raise unauthorized("Invalid token subject.")

    user = await database["users"].find_one({"_id": user_id})
    if user is None or not user.get("is_active", True):
        raise unauthorized("User not found or disabled.")

    return user


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")
    return user
