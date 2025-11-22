from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    app_name: str = "Enterprise Ticketing System"
    mongodb_uri: str = Field(..., alias="MONGODB_URI")  # Required from env variable
    google_api_key: str = Field(default="", alias="GOOGLE_API_KEY")  # Optional, defaults to empty string

    class Config:
        env_file = ".env"  # Load from a .env file (recommended for local dev)
        case_sensitive = True
settings = Settings()