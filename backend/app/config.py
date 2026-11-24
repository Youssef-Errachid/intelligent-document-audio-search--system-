from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    mongodb_url: str
    database_name: str
    tika_url: str = "http://localhost:9998"
    whisper_model_path: str = "models/faster-whisper-base"
    solr_url: str = "http://localhost:8983/solr/documents"
    ollama_url: str = "http://localhost:11434"
    embedding_model: str = "granite-embedding:278m"
    embedding_dimension: int = 768
    llm_model: str = "qwen2.5:0.5b"
    llm_timeout: int = 300
    rag_top_k: int = 3
    rag_min_score: float = 0.85
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    auth_cookie_secure: bool = False  # True in production (HTTPS)

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()