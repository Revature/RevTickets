# Test Google Gemini API with curl

## Quick Test Command

Replace `YOUR_API_KEY` with your actual Google API key:

```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Say \"Hello, API is working!\" in one sentence."
      }]
    }]
  }'
```

## PowerShell Version

```powershell
$API_KEY = "YOUR_API_KEY"
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

## Test Without API Key (Will Fail but Shows Endpoint)

```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=test-key" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Test"
      }]
    }]
  }' \
  -v
```
