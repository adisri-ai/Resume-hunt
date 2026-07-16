import database_service.database as database


async def find_user_by_email(email: str):

    return await database.users_collection.find_one(
        {
            "email": email
        }
    )


async def create_user(document: dict):

    return await database.users_collection.insert_one(document)


async def find_user_by_id(user_id: str):

    return await database.users_collection.find_one(
        {
            "_id": user_id
        }
    )