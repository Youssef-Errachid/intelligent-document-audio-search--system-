from pymongo import AsyncMongoClient
pp/routers/documents.py

pp/routers/documents.py
from app.config import settings
pp/routers/documents.py

pp/routers/documents.py
client = AsyncMongoClient(
pp/routers/documents.py
    settings.mongodb_url,
pp/routers/documents.py
    serverSelectionTimeoutMS=5000,
pp/routers/documents.py
)
pp/routers/documents.py
database = client[settings.database_name]
pp/routers/documents.py
