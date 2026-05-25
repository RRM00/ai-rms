"""Sentiment analysis chain powered by LangChain + Gemini."""

import json

from app.ai.llm import get_llm


async def analyze_sentiment(review_text: str) -> dict:
    """
    Analyse the sentiment of a customer review and return structured
    results including overall sentiment and aspect-based breakdown.
    """
    llm = get_llm()

    prompt = (
        "You are a sentiment analysis expert for a restaurant.\n"
        "Analyze the following customer review and return a JSON object with:\n"
        "1. \"overall\": one of \"positive\", \"negative\", \"neutral\", or \"mixed\"\n"
        "2. \"aspects\": an array of objects, each with:\n"
        "   - \"aspect\": the topic (e.g. food, service, ambiance, price, speed)\n"
        "   - \"sentiment\": one of \"positive\", \"negative\", \"neutral\"\n"
        "   - \"detail\": a brief explanation\n\n"
        "Return ONLY valid JSON, no markdown fences, no extra text.\n\n"
        f"Review:\n\"{review_text}\""
    )

    response = await llm.ainvoke(prompt)
    raw = response.content.strip()

    # Strip accidental markdown fences
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1] if "\n" in raw else raw[3:]
        if raw.endswith("```"):
            raw = raw[:-3]
        raw = raw.strip()

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        # Fallback if the LLM returns unparseable output
        parsed = {
            "overall": "unknown",
            "aspects": [
                {
                    "aspect": "general",
                    "sentiment": "unknown",
                    "detail": raw,
                }
            ],
        }

    # Normalise keys to match the expected schema
    return {
        "overall": parsed.get("overall", "unknown"),
        "aspects": parsed.get("aspects", []),
    }
