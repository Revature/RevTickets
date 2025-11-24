# Google Gemini API Test Commands

## ✅ Test Results Summary

**Endpoint Test**: ✓ **API Endpoint is Reachable**
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
- Status: Endpoint responds (403 with invalid key = endpoint is working)
- Model: `gemini-2.0-flash` (as configured in the application)

---

## 🧪 Test Commands

### Option 1: PowerShell Script (Recommended)

**Run the test script:**
```powershell
# Without API key (tests endpoint reachability)
.\test_google_api_simple.ps1

# With API key
.\test_google_api_simple.ps1 -ApiKey "YOUR_API_KEY_HERE"

# Or set environment variable first
$env:GOOGLE_API_KEY = "YOUR_API_KEY_HERE"
.\test_google_api_simple.ps1
```

### Option 2: Direct PowerShell Command

```powershell
$API_KEY = "YOUR_API_KEY_HERE"
$URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$API_KEY"
$BODY = @{
    contents = @(
        @{
            parts = @(
                @{
                    text = "Say 'Hello, API is working!' in one sentence."
                }
            )
        }
    )
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri $URL -Method Post -ContentType "application/json" -Body $BODY
```

### Option 3: Using curl.exe (if available)

```bash
curl.exe -X POST ^
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY_HERE" ^
  -H "Content-Type: application/json" ^
  -d "{\"contents\":[{\"parts\":[{\"text\":\"Say Hello in one sentence.\"}]}]}"
```

### Option 4: Test Endpoint Only (No API Key Required)

```powershell
# This will return 403 but confirms endpoint is reachable
$URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=test"
$BODY = '{"contents":[{"parts":[{"text":"Test"}]}]}'
try {
    Invoke-RestMethod -Uri $URL -Method Post -ContentType "application/json" -Body $BODY
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Endpoint is reachable! (403 = endpoint works, just needs valid key)"
}
```

---

## 📋 Expected Responses

### ✅ Success (200 OK)
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "Hello, API is working!"
          }
        ]
      }
    }
  ]
}
```

### ❌ Invalid API Key (403 Forbidden)
```json
{
  "error": {
    "code": 403,
    "message": "API key not valid...",
    "status": "PERMISSION_DENIED"
  }
}
```

### ❌ Missing API Key (400 Bad Request)
```json
{
  "error": {
    "code": 400,
    "message": "API key not valid...",
    "status": "INVALID_ARGUMENT"
  }
}
```

---

## 🔑 Getting a Google API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key
5. Set it in your environment:
   ```powershell
   $env:GOOGLE_API_KEY = "your-api-key-here"
   ```

---

## 🐳 Testing with Docker Container

**Check if API key is set in backend container:**
```powershell
docker exec fastapi-backend printenv GOOGLE_API_KEY
```

**Set API key in docker-compose.yml:**
```yaml
environment:
  - GOOGLE_API_KEY=${GOOGLE_API_KEY}  # Set this in your .env file or export it
```

**Or set it directly:**
```powershell
$env:GOOGLE_API_KEY = "your-api-key-here"
docker-compose restart backend
```

---

## ✅ Verification Checklist

- [ ] API endpoint is reachable (tested - ✓ working)
- [ ] API key is configured in environment
- [ ] API key is valid (test with script)
- [ ] Backend can access API key
- [ ] LLM initialization works in backend

---

## 📝 Notes

- The endpoint test confirmed the API is reachable (403 response = endpoint works)
- You need a valid Google API key to get successful responses
- The model `gemini-2.0-flash` is correctly configured
- The application will use fallback summaries if API key is not set or invalid

