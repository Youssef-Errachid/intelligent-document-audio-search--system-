from pymongo import AsyncMongoClient

from app.config import settings

client = AsyncMongoClient(
    settings.mongodb_url,
    serverSelectionTimeoutMS=5000,
)
database = client[settings.database_name]