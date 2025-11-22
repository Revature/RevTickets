# Export .env Variables in PowerShell

## Quick One-Liner Command

```powershell
Get-Content .env | ForEach-Object { if ($_ -match '^([^#=]+)=(.*)$') { $name = $matches[1].Trim(); $val = $matches[2].Trim(); Set-Item -Path "env:$name" -Value $val; Write-Host "Exported: $name" } }
```

## Using the Script

Run the provided script:
```powershell
.\export-env.ps1
```

Or with explicit execution policy:
```powershell
powershell -ExecutionPolicy Bypass -File .\export-env.ps1
```

## What It Does

1. Reads the `.env` file
2. Parses each line in `KEY=VALUE` format
3. Skips comments (lines starting with `#`)
4. Exports each variable to the current PowerShell session
5. Sets environment variables accessible via `$env:VARIABLE_NAME`

## Verify Exported Variables

```powershell
# Check individual variables
$env:GOOGLE_API_KEY
$env:BACKEND_PORT
$env:FRONTEND_PORT

# List all exported variables
Get-ChildItem Env: | Where-Object { $_.Name -match 'GOOGLE|BACKEND|FRONTEND' }
```

## Usage Example

After exporting, you can use the variables:

```powershell
# Export variables
Get-Content .env | ForEach-Object { if ($_ -match '^([^#=]+)=(.*)$') { $name = $matches[1].Trim(); $val = $matches[2].Trim(); Set-Item -Path "env:$name" -Value $val } }

# Use in commands
Write-Host "API Key: $env:GOOGLE_API_KEY"
docker-compose up -d  # Will use GOOGLE_API_KEY from environment

# Test Google API with exported key
$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$env:GOOGLE_API_KEY"
```

## Notes

- Variables are exported to the **current PowerShell session only**
- They will be lost when you close the PowerShell window
- To make them permanent, add them to your PowerShell profile or use System Environment Variables
- The script masks sensitive values (API keys, passwords) when displaying verification

## Make Variables Permanent (Optional)

To persist variables across sessions, add to your PowerShell profile:

```powershell
# Edit profile
notepad $PROFILE

# Add this line (adjust path as needed)
Get-Content "$PSScriptRoot\.env" | ForEach-Object { if ($_ -match '^([^#=]+)=(.*)$') { $name = $matches[1].Trim(); $val = $matches[2].Trim(); Set-Item -Path "env:$name" -Value $val } }
```

