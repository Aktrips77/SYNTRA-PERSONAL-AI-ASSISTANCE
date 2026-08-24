"""
Centralised application configuration.

Everything that could change between environments (API keys, model name,
allowed origins, timeouts) lives here and is loaded from environment
variables / a local .env file. Nothing here is hardcoded so the AI
provider or model can be swapped without touching business logic.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # OpenRouter / AI provider settings
    openrouter_api_key: str = ""
    openrouter_model: str = "openai/gpt-4o-mini"
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    openrouter_site_url: str = "http://localhost:5173"
    openrouter_site_name: str = "SYNTRA"

    # Networking
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    ai_request_timeout: int = 30

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def has_api_key(self) -> bool:
        return bool(self.openrouter_api_key and self.openrouter_api_key.strip())


@lru_cache
def get_settings() -> Settings:
    """Settings are cached so the .env file is only parsed once."""
    return Settings()
