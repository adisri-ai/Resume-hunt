from datetime import (
    datetime,
    timedelta,
    timezone
)

from jose import jwt
from jose import JWTError

from  settings.config import (
    JWT_SECRET,
    JWT_ALGORITHM,
    JWT_EXPIRE_MINUTES
)
def create_access_token(
    user_id: str,
    email: str
):

    expire = datetime.now(
        timezone.utc
    ) + timedelta(
        minutes=JWT_EXPIRE_MINUTES
    )

    payload = {

        "sub": user_id,

        "email": email,

        "exp": expire

    }

    return jwt.encode(
        payload,
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )
def decode_token(
    token: str
):

    return jwt.decode(
        token,
        JWT_SECRET,
        algorithms=[JWT_ALGORITHM]
    )
def verify_token(
    token: str
):

    try:

        return decode_token(token)

    except JWTError:

        return None