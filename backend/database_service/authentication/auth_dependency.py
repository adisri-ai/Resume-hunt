from fastapi import (
    Depends,
    HTTPException
)

from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials
)

from database_service.authentication.auth import verify_token

from  session_service.current_session import current_session

security = HTTPBearer()
async def get_current_user(

    credentials: HTTPAuthorizationCredentials = Depends(
        security
    )

):

    payload = verify_token(
        credentials.credentials
    )

    if payload is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token."
        )

    current_session.user_id = payload["sub"]

    current_session.email = payload["email"]

    current_session.authenticated = True

    return payload