"""Streamlit app for PRD Generator.

Minimal UI that takes a problem statement and displays a structured PRD.
Uses OpenCode GO API with DeepSeek V4 Flash model.
"""
import json

import streamlit as st
from openai import OpenAI
from openai import RateLimitError, APIError

from src.config import (
    OPENCODE_API_KEY,
    BASE_URL,
    MODEL_NAME,
    MAX_RETRIES,
    validate_config,
)
from src.prompt import build_prompt, build_retry_prompt
from src.validator import validate_input, validate_output, check_needs_retry, ValidationError

# Page config
st.set_page_config(
    page_title="PRD Generator",
    page_icon="📝",
    layout="centered",
)

st.title("📝 PRD Generator")
st.markdown("Enter a problem statement. Get a structured Product Requirements Document in seconds.")

# Check API key
api_key_ok = True
client = None
try:
    validate_config()
    client = OpenAI(
        api_key=OPENCODE_API_KEY,
        base_url=BASE_URL,
    )
except ValueError as e:
    api_key_ok = False
    st.error(f"⚠️ {e}")
    st.info(
        "**How to get your API key:**\n"
        "1. Go to https://opencode.ai/auth\n"
        "2. Sign in and subscribe to OpenCode Go ($5 first month)\n"
        "3. Copy your API key from the console\n"
        "4. Paste it into the `.env` file"
    )

# Input form
problem_statement = st.text_area(
    "Problem Statement",
    placeholder="e.g., Design a class booking system for a university campus",
    height=120,
)

col1, col2 = st.columns([1, 4])
with col1:
    generate_clicked = st.button("Generate PRD", type="primary", disabled=not api_key_ok)

# Output area
if generate_clicked and problem_statement:
    try:
        # Validate input
        validate_input(problem_statement)

        with st.spinner("Generating PRD..."):
            # First attempt
            prompt = build_prompt(problem_statement)
            response = client.chat.completions.create(
                model=MODEL_NAME,
                messages=[
                    {"role": "system", "content": "You are a senior product manager."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.7,
            )
            raw_output = response.choices[0].message.content

            # Validate and retry if needed
            retries = 0
            while check_needs_retry(raw_output) and retries < MAX_RETRIES:
                retries += 1
                retry_prompt = build_retry_prompt(problem_statement)
                response = client.chat.completions.create(
                    model=MODEL_NAME,
                    messages=[
                        {"role": "system", "content": "You are a senior product manager."},
                        {"role": "user", "content": retry_prompt},
                    ],
                    temperature=0.7,
                )
                raw_output = response.choices[0].message.content

            # Final validation
            prd = validate_output(raw_output)

        # Display PRD
        st.success("✅ PRD generated successfully!")
        if retries > 0:
            st.caption(f"(Required {retries} retry attempt(s) to get a complete output)")

        st.divider()

        # Problem Statement
        st.subheader("🎯 Problem Statement")
        st.write(prd.get("problem_statement", ""))

        # Persona
        st.subheader("👤 Target Persona")
        st.write(prd.get("persona", ""))

        # User Stories
        st.subheader("📖 User Stories")
        for story in prd.get("user_stories", []):
            st.markdown(f"- {story}")

        # Acceptance Criteria
        st.subheader("✅ Acceptance Criteria")
        for criterion in prd.get("acceptance_criteria", []):
            st.markdown(f"- {criterion}")

        # Success Metrics
        st.subheader("📊 Success Metrics")
        for metric in prd.get("success_metrics", []):
            st.markdown(f"- {metric}")

        # Edge Cases
        st.subheader("⚠️ Edge Cases")
        for edge in prd.get("edge_cases", []):
            st.markdown(f"- {edge}")

        # Open Questions
        st.subheader("❓ Open Questions")
        for question in prd.get("open_questions", []):
            st.markdown(f"- {question}")

        # Raw JSON (collapsible)
        with st.expander("📋 Raw JSON Output"):
            st.json(prd)

    except ValidationError as e:
        st.error(f"Validation Error: {e}")
    except RateLimitError as e:
        st.error("⚠️ Rate Limit Exceeded")
        st.info(
            "**You've hit the OpenCode GO rate limit.**\n\n"
            "**What to do:**\n"
            "1. Wait a few minutes and try again\n"
            "2. Check your usage at https://opencode.ai/auth\n\n"
            "**DeepSeek V4 Flash limits:**\n"
            "- 31,650 requests per 5 hours\n"
            "- ~$0.14 per 1M input tokens\n"
            "- ~$0.28 per 1M output tokens\n"
        )
    except APIError as e:
        st.error(f"API Error: {e}")
        st.info("Check your API key and internet connection.")
    except Exception as e:
        st.error(f"Unexpected Error: {e}")
        st.info("If this persists, check your API key and internet connection.")

elif generate_clicked and not problem_statement:
    st.warning("Please enter a problem statement before generating.")

# Footer
st.divider()
st.caption("Built for portfolio demonstration | PRD Generator v1.0 | Powered by OpenCode GO")
