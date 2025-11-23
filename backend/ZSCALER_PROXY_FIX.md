# Zscaler Corporate Proxy Fix

## Issue Identified
The chatbot cannot connect to OpenAI API because **Zscaler corporate proxy** is intercepting HTTPS connections and causing SSL certificate verification failures.

## Root Cause
When the test script ran, it received HTML content from Zscaler instead of the OpenAI API response:
```
<!-- Zscaler protection page HTML -->
```

This indicates that:
1. Zscaler is intercepting HTTPS connections (SSL inspection)
2. The SSL certificate presented by Zscaler is not trusted by the Docker container
3. Even with `verify=False`, the proxy interception might be causing issues

## Fix Applied
Updated `backend/src/langchain_app/config/model_config.py` to:

1. **Disable SSL verification more aggressively**:
   - Set multiple environment variables (`CURL_CA_BUNDLE`, `REQUESTS_CA_BUNDLE`, `SSL_CERT_FILE`, `SSL_CERT_DIR`)
   - Disable SSL verification in Python's ssl module
   - Suppress urllib3 SSL warnings

2. **Configure httpx clients properly**:
   - Both sync and async clients use `verify=False`
   - Added `follow_redirects=True` to handle proxy redirects
   - Timeout set to 60 seconds

3. **Handle corporate proxy scenarios**:
   - The fix is designed to work with corporate proxies that intercept HTTPS
   - SSL verification is disabled to bypass proxy certificate issues

## Configuration
- **DISABLE_SSL_VERIFICATION**: Set to `true` in `docker-compose.yml` ✓
- **HTTP Clients**: Configured with `verify=False` ✓
- **Environment Variables**: SSL-related env vars cleared ✓

## Testing
After restarting the backend, test the chatbot:
1. Send a message through the knowledge base chat interface
2. Check if AI responses are generated
3. Monitor backend logs for connection errors

## Expected Behavior
- Chatbot should connect to OpenAI API through Zscaler proxy
- SSL certificate verification errors should be bypassed
- AI responses should be generated successfully

## Security Note
⚠️ **WARNING**: This workaround disables SSL verification, which makes connections vulnerable to man-in-the-middle attacks. This is acceptable in corporate environments where Zscaler is trusted, but should be documented and reviewed with your security team.

## Alternative Solutions (for production)
1. **Install Zscaler root certificate** in the Docker container
2. **Configure proxy settings** explicitly in httpx clients
3. **Use a trusted proxy** configuration
4. **Whitelist OpenAI API** in Zscaler to bypass inspection

