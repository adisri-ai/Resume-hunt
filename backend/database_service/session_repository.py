from typing import Optional

import database_service.database as database
from  models.database_models import UserSessionDB


class SessionRepository:

    @staticmethod
    async def save_session(
        email: str,
        session: UserSessionDB
    ) -> None:

        await database.users_collection.update_one(

            {
                "email": email
            },

            {
                "$set": {
                    "session": session.model_dump()
                }
            }

        )

    @staticmethod
    async def load_session(
        email: str
    ) -> Optional[UserSessionDB]:

        user = await database.users_collection.find_one(

            {
                "email": email
            },

            {
                "session": 1
            }

        )

        if user is None:

            return None

        if "session" not in user:

            return None

        return UserSessionDB(**user["session"])

    @staticmethod
    async def reset_session(
        email: str
    ) -> None:

        empty_session = UserSessionDB()

        await database.users_collection.update_one(

            {
                "email": email
            },

            {
                "$set": {
                    "session": empty_session.model_dump()
                }
            }

        )