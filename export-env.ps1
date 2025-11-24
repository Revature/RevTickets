# PowerShell script to export variables from .env file
# Usage: .\export-env.ps1 [path-to-env-file]

param(
    [string]$EnvFile = ".env"
)

Write-Host "`n=== Exporting variables from $EnvFile ===" -ForegroundColor Cyan

if (-not (Test-Path $EnvFile)) {
    Write-Host "Error: .env file not found at: $EnvFile" -ForegroundColor Red
    exit 1
}

$exportedCount = 0

Get-Content $EnvFile | ForEach-Object {
    $line = $_.Trim()
    
    # Skip empty lines and comments
    if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith('#')) {
        return
    }
    
    # Parse KEY=VALUE format
    if ($line -match '^([^=]+)=(.*)$') {
        $varName = $matches[1].Trim()
        $varValue = $matches[2].Trim()
        
        # Remove quotes if present
        if ($varValue -match '^["''](.*)["'']$') {
            $varValue = $matches[1]
        }
        
        # Export to current PowerShell session
        Set-Item -Path "env:$varName" -Value $varValue
        
        # Also set in Process environment
        [Environment]::SetEnvironmentVariable($varName, $varValue, 'Process')
        
        Write-Host "✓ Exported: $varName" -ForegroundColor Green
        $exportedCount++
    }
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Exported $exportedCount variables" -ForegroundColor White
Write-Host "`n=== Verification ===" -ForegroundColor Cyan

# Show exported variables
Get-Content $EnvFile | ForEach-Object {
    $line = $_.Trim()
    if (-not [string]::IsNullOrWhiteSpace($line) -and -not $line.StartsWith('#') -and $line -match '^([^=]+)=(.*)$') {
        $varName = $matches[1].Trim()
        $value = $env:$varName
        if ($value) {
            # Mask sensitive values (API keys, passwords)
            if ($varName -match 'API_KEY|PASSWORD|SECRET|TOKEN') {
                $displayValue = $value.Substring(0, [Math]::Min(10, $value.Length)) + "***"
            } else {
                $displayValue = $value
            }
            Write-Host "$varName = $displayValue" -ForegroundColor White
        }
    }
}

Write-Host "`nVariables are now available in this PowerShell session!" -ForegroundColor Green
Write-Host "Example: `$env:GOOGLE_API_KEY" -ForegroundColor Gray

