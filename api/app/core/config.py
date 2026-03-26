from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    debug: bool = False

    # JWT
    secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_days: int = 7

    # Thunderbird MCP proxy
    thunderbird_api_url: str = "https://api.d2mluxury.quest"
    thunderbird_api_key: str = ""

    # Email (magic link send via d2mconcierge)
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = "d2mconcierge@gmail.com"
    smtp_password: str = ""
    magic_link_base_url: str = "https://app.d2mluxury.quest"

    # CORS
    cors_origins: list[str] = [
        "https://app.d2mluxury.quest",
        "http://localhost:5173",
    ]


settings = Settings()
