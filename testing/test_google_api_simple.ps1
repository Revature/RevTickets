# Simple Google Gemini API Test Script
# Usage: .\test_google_api_simple.ps1 -ApiKey "YOUR_API_KEY"

param(
    [string]$ApiKey = ""
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Testing Google Gemini API (gemini-2.0-flash)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

if ([string]::IsNullOrEmpty($ApiKey)) {
    Write-Host "No API key provided. Testing endpoint reachability..." -ForegroundColor Yellow
    $ApiKey = "test-key-placeholder"
}

$API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$ApiKey"

$payload = @{
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

Write-Host "Endpoint: $API_URL" -ForegroundColor Green
Write-Host "Sending test request..." -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $API_URL `
        -Method Post `
        -ContentType "application/json" `
        -Body $payload `
        -ErrorAction Stop

    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "✓ SUCCESS: API is working!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host ""
    
    if ($response.candidates -and $response.candidates[0].content.parts) {
        $aiResponse = $response.candidates[0].content.parts[0].text
        Write-Host "AI Response:" -ForegroundColor Cyan
        Write-Host $aiResponse -ForegroundColor White
        Write-Host ""
    }
    
    Write-Host "Full Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    
    Write-Host "==========================================" -ForegroundColor Red
    Write-Host "✗ Request Failed" -ForegroundColor Red
    Write-Host "HTTP Status: $statusCode" -ForegroundColor Red
    Write-Host "==========================================" -ForegroundColor Red
    Write-Host ""
    
    if ($statusCode -eq 403) {
        Write-Host "403 Forbidden - API key is invalid or missing" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "To test with a valid API key:" -ForegroundColor Cyan
        Write-Host "  .\test_google_api_simple.ps1 -ApiKey 'YOUR_API_KEY'" -ForegroundColor White
        Write-Host ""
        Write-Host "Or set environment variable:" -ForegroundColor Cyan
        Write-Host "  `$env:GOOGLE_API_KEY = 'YOUR_API_KEY'" -ForegroundColor White
        Write-Host "  .\test_google_api_simple.ps1" -ForegroundColor White
    } elseif ($statusCode -eq 401) {
        Write-Host "401 Unauthorized - API key is invalid" -ForegroundColor Yellow
    } elseif ($statusCode -eq 400) {
        Write-Host "400 Bad Request - Request format is incorrect" -ForegroundColor Yellow
    } else {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Try to read error response
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host ""
            Write-Host "Error Details:" -ForegroundColor Yellow
            Write-Host $responseBody -ForegroundColor Yellow
        } catch {
            # Ignore if we can't read the response
        }
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Test Complete" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
