from motor.motor_asyncio import AsyncIOMotorClient

from settings.config import (
    MONGO_URI,
    DATABASE_NAME,
    USERS_COLLECTION
)

client = None
database = None
users_collection = None


async def connect_database():
    global client
    global database
    global users_collection

    client = AsyncIOMotorClient(MONGO_URI)

    database = client[DATABASE_NAME]

    users_collection = database[USERS_COLLECTION]

    print("MongoDB Connected")


async def close_database():
    global client

    if client:
        client.close()