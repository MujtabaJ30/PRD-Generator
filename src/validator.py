"""Validation layer for input and output.

Catches bad inputs early and ensures LLM output is complete and structured.
"""
import json
import re
from typing import Any

from src.config import MIN_INPUT_LENGTH, MAX_INPUT_LENGTH, REQUIRED_SECTIONS


class ValidationError(Exception):
    """Raised when input or output fails validation."""
    pass


def validate_input(text: str) -> None:
    """Validate user input before sending to LLM.

    Args:
        text: Raw user input.

    Raises:
        ValidationError: If input is empty, too short, or too long.
    """
    if not text or not text.strip():
        raise ValidationError("Input cannot be empty. Please describe the problem you want to solve.")

    stripped = text.strip()
    if len(stripped) < MIN_INPUT_LENGTH:
        raise ValidationError(
            f"Input is too short ({len(stripped)} chars). "
            f"Please provide at least {MIN_INPUT_LENGTH} characters describing the problem."
        )

    if len(stripped) > MAX_INPUT_LENGTH:
        raise ValidationError(
            f"Input is too long ({len(stripped)} chars). "
            f"Please keep it under {MAX_INPUT_LENGTH} characters for best results."
        )

    # Check for obviously vague input (e.g., just "booking system")
    word_count = len(stripped.split())
    if word_count < 3:
        raise ValidationError(
            "Input is too vague. Please add more detail about the users, context, or goals."
        )


def validate_output(raw_output: str) -> dict[str, Any]:
    """Validate and parse LLM output.

    Args:
        raw_output: Raw string from the LLM.

    Returns:
        Parsed JSON dict if valid.

    Raises:
        ValidationError: If output is not valid JSON or missing required sections.
    """
    # Clean up common LLM artifacts
    cleaned = raw_output.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise ValidationError(f"Output is not valid JSON: {e}")

    if not isinstance(data, dict):
        raise ValidationError("Output must be a JSON object (dictionary), not a list or string.")

    missing = [key for key in REQUIRED_SECTIONS if key not in data]
    if missing:
        raise ValidationError(f"Missing required sections: {', '.join(missing)}")

    # Check for empty sections
    empty = [key for key in REQUIRED_SECTIONS if not data.get(key)]
    if empty:
        raise ValidationError(f"Empty required sections: {', '.join(empty)}")

    # Check for at least one quantitative metric
    metrics = data.get("success_metrics", [])
    has_quantitative = any(
        re.search(r"\d+%?|\d+\s*(hours|days|weeks|minutes|seconds|users|requests)", str(m))
        for m in metrics
    )
    if not has_quantitative:
        raise ValidationError(
            "No quantitative metric found in success_metrics. "
            "At least one metric must contain a number or time unit."
        )

    return data


def check_needs_retry(raw_output: str) -> bool:
    """Quick check if output needs retry without full parsing.

    Args:
        raw_output: Raw LLM output string.

    Returns:
        True if output looks malformed or incomplete.
    """
    if not raw_output or not raw_output.strip():
        return True

    cleaned = raw_output.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()

    try:
        data = json.loads(cleaned)
    except (json.JSONDecodeError, ValueError):
        return True

    if not isinstance(data, dict):
        return True

    missing = [key for key in REQUIRED_SECTIONS if key not in data]
    if missing:
        return True

    return False
