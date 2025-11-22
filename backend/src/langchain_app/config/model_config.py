from langchain_google_genai import ChatGoogleGenerativeAI
from src.core.config import settings
from typing import Optional

# Initialize LLM lazily to avoid errors when API key is not set
_llm: Optional[ChatGoogleGenerativeAI] = None

def get_llm() -> Optional[ChatGoogleGenerativeAI]:
    """Get or create the LLM instance. Returns None if API key is not configured."""
    global _llm
    if _llm is None and settings.google_api_key:
        try:
            _llm = ChatGoogleGenerativeAI(
                google_api_key=settings.google_api_key,
                model="gemini-2.0-flash",
                temperature=0,
                max_tokens=None,
                timeout=None,
                max_retries=2,
            )
        except Exception as e:
            print(f"Warning: Failed to initialize LLM: {e}")
            return None
    return _llm

# For backward compatibility, try to initialize if API key is available
if settings.google_api_key:
    try:
        _llm = ChatGoogleGenerativeAI(
            google_api_key=settings.google_api_key,
            model="gemini-2.0-flash",
            temperature=0,
            max_tokens=None,
            timeout=None,
            max_retries=2,
        )
    except Exception:
        # If initialization fails, it will be created lazily when needed
        pass

# Export llm for backward compatibility (will be None if not initialized)
llm = _llm