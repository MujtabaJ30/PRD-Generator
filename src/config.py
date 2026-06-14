"""Configuration module for PRD Generator.

Loads environment variables and provides app-wide settings.
"""
import os
from dotenv import load_dotenv

# Load .env file from project root
load_dotenv()

OPENCODE_API_KEY: str = os.getenv("OPENCODE_API_KEY", "")

# OpenCode GO API settings
# Endpoint: OpenAI-compatible API
BASE_URL: str = "https://opencode.ai/zen/go/v1"
# Model: DeepSeek V4 Flash - cheapest, highest rate limit (31,650 req/5h)
MODEL_NAME: str = "deepseek-v4-flash"
MAX_RETRIES: int = 2

# Input validation settings
MIN_INPUT_LENGTH: int = 10
MAX_INPUT_LENGTH: int = 2000

# Output validation settings
REQUIRED_SECTIONS: list[str] = [
    "problem_statement",
    "persona",
    "user_stories",
    "acceptance_criteria",
    "success_metrics",
    "edge_cases",
    "open_questions",
]


def validate_config() -> None:
    """Check that required configuration is present.

    Raises:
        ValueError: If OPENCODE_API_KEY is missing or empty.
    """
    if not OPENCODE_API_KEY or OPENCODE_API_KEY == "your_opencode_api_key_here":
        raise ValueError(
            "OPENCODE_API_KEY is not set. "
            "Copy .env.example to .env and add your OpenCode GO API key."
        )
