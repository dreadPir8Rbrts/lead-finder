from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    supabase_url: str
    supabase_service_key: str
    anthropic_api_key: str
    outscraper_api_key: str = ""
    instantly_api_key: str = ""
    instantly_api_url: str = "https://api.instantly.ai/api/v1"
    instantly_campaign_id: str = ""
    # Compatibility with the merged example that placed this frontend setting here.
    # Next.js still needs its own copy in app/.env.local.
    next_public_api_url: str | None = None


settings = Settings()
