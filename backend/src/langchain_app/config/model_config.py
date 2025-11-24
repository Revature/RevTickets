from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from src.core.config import settings
from typing import Optional
import httpx
import ssl
import os

# Set SSL verification environment variables if disabled
# This must be done BEFORE importing httpx/httpcore to take effect
def _apply_ssl_workaround():
    """Apply SSL verification workaround if disabled - handles corporate proxies like Zscaler"""
    if settings.disable_ssl_verification:
        # Disable SSL verification globally for httpx/httpcore
        os.environ['CURL_CA_BUNDLE'] = ''
        os.environ['REQUESTS_CA_BUNDLE'] = ''
        os.environ['SSL_CERT_FILE'] = ''
        os.environ['SSL_CERT_DIR'] = ''
        
        import warnings
        warnings.filterwarnings('ignore', message='Unverified HTTPS request')
        warnings.filterwarnings('ignore', category=UserWarning, module='urllib3')
        
        # Disable SSL verification in Python's ssl module
        ssl._create_default_https_context = ssl._create_unverified_context
        
        # Patch urllib3 to disable SSL warnings
        try:
            import urllib3
            urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        except Exception:
            pass
        
        return True
    return False

# Apply SSL workaround immediately - BEFORE any httpx imports
_ssl_disabled = _apply_ssl_workaround()

# Create HTTP client with SSL verification workaround
def _create_http_client():
    """Create HTTP client with optional SSL verification disabled - handles corporate proxies"""
    if settings.disable_ssl_verification:
        # Workaround: Disable SSL verification for development/corporate proxy environments
        # WARNING: Only use in development, not production!
        # Create sync client with verify=False to bypass SSL certificate checks
        # This is necessary when corporate proxies (like Zscaler) intercept HTTPS connections
        client = httpx.Client(
            verify=False, 
            timeout=60.0,
            follow_redirects=True
        )
        return client
    return None  # Use default client with SSL verification

# Create async HTTP client for async operations
def _create_async_http_client():
    """Create async HTTP client with optional SSL verification disabled - handles corporate proxies"""
    if settings.disable_ssl_verification:
        # Create async client with verify=False to bypass SSL certificate checks
        # This is necessary when corporate proxies (like Zscaler) intercept HTTPS connections
        client = httpx.AsyncClient(
            verify=False, 
            timeout=60.0,
            follow_redirects=True
        )
        return client
    return None  # Use default client with SSL verification

# Chat model for general LLM operations (OpenAI)
llm = ChatOpenAI(
    openai_api_key=settings.openai_api_key,
    model="gpt-4o",
    temperature=0,
    max_tokens=None,
    timeout=None,
    max_retries=2,
    http_client=_create_http_client(),
)

# Chat model for KB chat operations (OpenAI)
chat_model = ChatOpenAI(
    openai_api_key=settings.openai_api_key,
    model="gpt-4o",   # you can pick "gpt-4o" for higher quality
    temperature=0.3,       # slightly higher temp for more natural responses
    max_tokens=None,
    timeout=60.0,  # 60 second timeout for chat requests
    max_retries=2,
    http_client=_create_http_client(),
)

# Embedding model for vector operations (OpenAI)
embedding_model = OpenAIEmbeddings(
    openai_api_key=settings.openai_api_key,
    model="text-embedding-3-small",   # or "text-embedding-3-large"
    timeout=30.0,  # 30 second timeout for embedding requests
    max_retries=2,
    http_client=_create_http_client(),
)

# Google Generative AI for ticket summaries (lazy initialization)
_google_llm: Optional[ChatGoogleGenerativeAI] = None

def get_llm() -> Optional[ChatGoogleGenerativeAI]:
    """Get or create the Google Generative AI LLM instance. Returns None if API key is not configured."""
    global _google_llm
    if _google_llm is None and settings.google_api_key:
        try:
            _google_llm = ChatGoogleGenerativeAI(
                google_api_key=settings.google_api_key,
                model="gemini-2.0-flash",
                temperature=0,
                max_tokens=None,
                timeout=25.0,  # Set timeout to 25 seconds (5 second buffer for asyncio.wait_for 20s timeout)
                max_retries=1,  # Reduce retries to ensure timeout works properly
            )
        except Exception as e:
            print(f"Warning: Failed to initialize Google LLM: {e}")
            return None
    return _google_llm

# For backward compatibility, try to initialize if API key is available
if settings.google_api_key:
    try:
        _google_llm = ChatGoogleGenerativeAI(
            google_api_key=settings.google_api_key,
            model="gemini-2.0-flash",
            temperature=0,
            max_tokens=None,
            timeout=25.0,  # Set timeout to 25 seconds (5 second buffer for asyncio.wait_for 20s timeout)
            max_retries=1,  # Reduce retries to ensure timeout works properly
        )
    except Exception:
        # If initialization fails, it will be created lazily when needed
        pass
