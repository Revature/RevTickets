# Google Gemini API Test Script
# Tests the availability of Google Gemini LLM using API key from .env file

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Google Gemini API Availability Test" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Read API key from .env file
$envFile = ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "ERROR: .env file not found!" -ForegroundColor Red
    exit 1
}

$envContent = Get-Content $envFile -Raw
if ($envContent -match 'GOOGLE_API_KEY\s*=\s*(.+)') {
    $apiKey = $matches[1].Trim()
    Write-Host "✓ Found GOOGLE_API_KEY in .env file" -ForegroundColor Green
    Write-Host "  Key length: $($apiKey.Length) characters" -ForegroundColor Gray
    Write-Host "  Key preview: $($apiKey.Substring(0, [Math]::Min(15, $apiKey.Length)))..." -ForegroundColor Gray
} else {
    Write-Host "ERROR: GOOGLE_API_KEY not found in .env file!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# API Configuration
$model = "gemini-2.0-flash"
$baseUrl = "https://generativelanguage.googleapis.com/v1beta"
$endpoint = "${baseUrl}/models/${model}:generateContent"
$fullUrl = "${endpoint}?key=${apiKey}"

Write-Host "API Configuration:" -ForegroundColor Cyan
Write-Host "  Model: $model" -ForegroundColor White
Write-Host "  Endpoint: $endpoint" -ForegroundColor White
Write-Host ""

# Create request payload
$requestBody = @{
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

Write-Host "Request Payload:" -ForegroundColor Cyan
Write-Host $requestBody -ForegroundColor Gray
Write-Host ""

# Generate curl command for reference
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "CURL Command (for reference):" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "curl -X POST \`" -ForegroundColor Yellow
Write-Host "  '$fullUrl' \`" -ForegroundColor Yellow
Write-Host "  -H 'Content-Type: application/json' \`" -ForegroundColor Yellow
Write-Host "  -d '$requestBody'" -ForegroundColor Yellow
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Sending API Request..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $fullUrl -Method Post -ContentType "application/json" -Body $requestBody -ErrorAction Stop
    
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "✓ SUCCESS - API is available and working!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Response Details:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10 | Write-Host
    
    Write-Host ""
    
    # Extract generated text
    if ($response.candidates -and $response.candidates[0].content.parts[0].text) {
        $generatedText = $response.candidates[0].content.parts[0].text
        Write-Host "Generated Text:" -ForegroundColor Green
        Write-Host "  $generatedText" -ForegroundColor White
        Write-Host ""
        Write-Host "✓ LLM is responding correctly!" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "TEST RESULT: PASSED" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "The Google Gemini API is:" -ForegroundColor Green
    Write-Host "  ✓ Accessible" -ForegroundColor Green
    Write-Host "  ✓ Authenticated successfully" -ForegroundColor Green
    Write-Host "  ✓ Generating responses" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your application can use this API for AI summaries." -ForegroundColor Green
    
} catch {
    Write-Host "==========================================" -ForegroundColor Red
    Write-Host "✗ FAILED - API request failed" -ForegroundColor Red
    Write-Host "==========================================" -ForegroundColor Red
    Write-Host ""
    
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "HTTP Status Code: $statusCode" -ForegroundColor Red
    Write-Host ""
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        $reader.Close()
        
        Write-Host "Error Response:" -ForegroundColor Yellow
        Write-Host $errorBody -ForegroundColor Yellow
        Write-Host ""
        
        # Parse error if JSON
        try {
            $errorJson = $errorBody | ConvertFrom-Json
            if ($errorJson.error) {
                Write-Host "Error Details:" -ForegroundColor Yellow
                Write-Host "  Message: $($errorJson.error.message)" -ForegroundColor Yellow
                if ($errorJson.error.status) {
                    Write-Host "  Status: $($errorJson.error.status)" -ForegroundColor Yellow
                }
            }
        } catch {
            # Not JSON, show raw error
        }
    } else {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Diagnosis:" -ForegroundColor Cyan
    
    if ($statusCode -eq 401 -or $statusCode -eq 403) {
        Write-Host "  ✗ Authentication failed" -ForegroundColor Red
        Write-Host ""
        Write-Host "Possible causes:" -ForegroundColor Yellow
        Write-Host "  1. API key is invalid or expired" -ForegroundColor Yellow
        Write-Host "  2. API key doesn't have Generative AI API enabled" -ForegroundColor Yellow
        Write-Host "  3. API key restrictions are blocking the request" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Solutions:" -ForegroundColor Cyan
        Write-Host "  1. Verify API key at: https://console.cloud.google.com/apis/credentials" -ForegroundColor Cyan
        Write-Host "  2. Enable 'Generative Language API' for your project" -ForegroundColor Cyan
        Write-Host "  3. Check API key restrictions in Google Cloud Console" -ForegroundColor Cyan
    } elseif ($statusCode -eq 400) {
        Write-Host "  ⚠ Bad Request" -ForegroundColor Yellow
        Write-Host "  Check API endpoint and request format" -ForegroundColor Yellow
    } elseif ($statusCode -eq 404) {
        Write-Host "  ⚠ Model not found" -ForegroundColor Yellow
        Write-Host "  Check if 'gemini-2.0-flash' is available in your region" -ForegroundColor Yellow
        Write-Host "  Try alternative models: gemini-pro, gemini-1.5-pro" -ForegroundColor Yellow
    } elseif ($statusCode -eq 429) {
        Write-Host "  ⚠ Rate limit exceeded" -ForegroundColor Yellow
        Write-Host "  Too many requests - wait and retry" -ForegroundColor Yellow
    } else {
        Write-Host "  ⚠ Unknown error" -ForegroundColor Yellow
        Write-Host "  Check API service status" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Red
    Write-Host "TEST RESULT: FAILED" -ForegroundColor Red
    Write-Host "==========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "The Google Gemini API is NOT available." -ForegroundColor Red
    Write-Host "Your application will use fallback summaries." -ForegroundColor Yellow
}

Write-Host ""
