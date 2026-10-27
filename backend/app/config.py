from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    mongodb_url: str
    database_name: str
    tika_url: str = "http://localhost:9998"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()