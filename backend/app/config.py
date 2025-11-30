import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./pair_programming.db"
    environment: str = "development"
    
    class Config:
        env_file = ".env"


settings = Settings()