"""Shared LLM instance for AI pipelines."""

from langchain_google_genai import ChatGoogleGenerativeAI

from app.config import settings


def get_llm() -> ChatGoogleGenerativeAI:
    """Return a ChatGoogleGenerativeAI instance configured from app settings."""
    return ChatGoogleGenerativeAI(
        model=settings.LLM_MODEL,
        google_api_key=settings.GOOGLE_API_KEY,
        temperature=0,
    )
