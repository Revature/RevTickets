# Google Gemini API Test Commands

## API Configuration
- **Model**: `gemini-2.0-flash`
- **API Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
- **Method**: POST
- **Authentication**: API key as query parameter `?key=YOUR_API_KEY`

## Test Commands

### Windows PowerShell (with API key)
```powershell
$apiKey = "YOUR_API_KEY_HERE"
$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$apiKey"
$body = @{
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

Invoke-RestMethod -Uri $url -Method Post -ContentType "application/json" -Body $body
```

### curl Command (Windows/Linux/Mac)
```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Say '\''Hello, API is working!'\'' in one sentence."
      }]
    }]
  }'
```

### One-liner curl (Windows PowerShell)
```powershell
curl.exe -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY_HERE" -H "Content-Type: application/json" -d '{\"contents\":[{\"parts\":[{\"text\":\"Say Hello, API is working! in one sentence.\"}]}]}'
```

## Expected Response (Success)
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "Hello, API is working!"
          }
        ],
        "role": "model"
      },
      "finishReason": "STOP",
      "index": 0,
      "safetyRatings": [...]
    }
  ],
  "promptFeedback": {...}
}
```

## Error Responses

### 401 Unauthorized (Invalid API Key)
```json
{
  "error": {
    "code": 401,
    "message": "API key not valid. Please pass a valid API key.",
    "status": "UNAUTHENTICATED"
  }
}
```

### 400 Bad Request (Invalid Model)
```json
{
  "error": {
    "code": 400,
    "message": "Model not found",
    "status": "INVALID_ARGUMENT"
  }
}
```

## Testing Without API Key
If no API key is set, the request will fail with 401. This is expected and confirms the endpoint is reachable.

