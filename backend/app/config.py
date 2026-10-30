from pydantic_settings import BaseSettings, SettingsConfigDict
pp/routers/documents.py

pp/routers/documents.py

pp/routers/documents.py
class Settings(BaseSettings):
pp/routers/documents.py
    mongodb_url: str
pp/routers/documents.py
    database_name: str
pp/routers/documents.py
    tika_url: str = "http://localhost:9998"
pp/routers/documents.py
    whisper_model_path: str = "models/whisper-base"
pp/routers/documents.py

pp/routers/documents.py
    model_config = SettingsConfigDict(env_file=".env")
pp/routers/documents.py

pp/routers/documents.py

pp/routers/documents.py
settings = Settings()
pp/routers/documents.py
