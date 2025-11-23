from pydantic_settings import BaseSettings
from pydantic import Field
import os

class Settings(BaseSettings):
    app_name: str = "Enterprise Ticketing System"
    mongodb_uri: str = Field(..., alias="MONGODB_URI")  # Required from env variable
    openai_api_key: str = Field(..., alias='OPENAI_API_KEY')
    google_api_key: str = Field(default="", alias="GOOGLE_API_KEY")  # Optional Google API key for ticket summaries
    # ENHANCEMENT L3 KB CHAT - ChromaDB configuration
    chroma_url: str = Field(default="http://localhost:8001", alias="CHROMA_URL")
    # SSL verification workaround for development
    disable_ssl_verification: bool = Field(default=False, alias="DISABLE_SSL_VERIFICATION")

    class Config:
        env_file = ".env"  # Load from a .env file (recommended for local dev)
        case_sensitive = True
settings = Settings()