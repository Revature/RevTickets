# SSL Certificate Verification Workaround

## Overview
This workaround disables SSL certificate verification for OpenAI API calls when running in development environments where SSL certificate verification fails.

## Configuration

### Environment Variable
Set `DISABLE_SSL_VERIFICATION=true` in your `docker-compose.yml` or `.env` file to enable the workaround.

### Current Status
- **Enabled**: SSL verification is currently disabled for development
- **Location**: `backend/src/langchain_app/config/model_config.py`

## Security Warning

⚠️ **WARNING**: This workaround disables SSL certificate verification, which makes connections vulnerable to man-in-the-middle attacks. 

**Only use this in:**
- Development environments
- Testing environments
- When you have no other option

**Never use this in:**
- Production environments
- Environments handling sensitive data
- Public-facing applications

## How It Works

The workaround creates a custom HTTP client with SSL verification disabled:

```python
if settings.disable_ssl_verification:
    return httpx.AsyncClient(verify=False, timeout=60.0)
```

This client is used by:
- OpenAI Chat models (`chat_model`, `llm`)
- OpenAI Embedding model (`embedding_model`)

## Disabling the Workaround

To re-enable SSL verification:

1. Set `DISABLE_SSL_VERIFICATION=false` in `docker-compose.yml`
2. Rebuild the backend container: `docker-compose up -d --build backend`

## Proper Solution

For production, you should:
1. Install proper CA certificates in the Docker container
2. Ensure the container's system time is synchronized
3. Use a proper SSL certificate management solution
4. Consider using a proxy or VPN if corporate firewalls are interfering

## Testing

Run the test script to verify the connection:
```bash
docker exec fastapi-backend python /app/test_openai_connection.py
```

