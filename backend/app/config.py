from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    mongodb_url: str
    database_name: str
    tika_url: str = "http://localhost:9998"
    whisper_model_path: str = "models/whisper-base"
    solr_url: str = "http://localhost:8983/solr/documents"
    ollama_url: str = "http://localhost:11434"
    embedding_model: str = "granite-embedding:278m"
    embedding_dimension: int = 768
    llm_model: str = "qwen2.5:3b"
    llm_timeout: int = 300
    rag_top_k: int = 3

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()