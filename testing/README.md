# Testing Documentation & Scripts

This folder contains all test scripts and documentation related to testing the RevTickets application.

## 📁 Contents

### Test Scripts

1. **test_google_api.ps1** - PowerShell script to test Google Gemini API availability
2. **test_google_api_simple.ps1** - Simplified version of the API test script
3. **test_google_api.sh** - Bash script version for Unix/Linux systems

### Test Documentation

#### AI Summary Feature Testing
- **AI_SUMMARY_TEST_INSTRUCTIONS.md** - Comprehensive test instructions for AI summary feature (15 test cases)
- **AI_SUMMARY_QUICK_TEST_CHECKLIST.md** - Quick reference checklist for fast validation

#### API Testing & Analysis
- **GOOGLE_API_TEST_RESULTS.md** - Results from Google API availability tests
- **GOOGLE_API_TEST_COMMANDS.md** - CURL commands for testing Google API
- **GOOGLE_API_TEST_SUMMARY.md** - Summary of Google API test findings
- **test_google_api_curl.md** - CURL command documentation
- **test_gemini_api.md** - Gemini API testing documentation
- **API_RESPONSE_ANALYSIS.md** - Detailed analysis of API responses and error codes

#### Implementation Documentation
- **TIMEOUT_FALLBACK_IMPLEMENTATION.md** - Documentation for 20-second timeout with automatic fallback
- **CORS_ERROR_EXPLANATION.md** - Explanation of CORS errors and fixes
- **CACHE_CLEAR_SUMMARY.md** - Documentation for cache clearing procedures

---

## 🚀 Quick Start

### Test Google API Availability

**PowerShell (Windows)**:
```powershell
powershell -ExecutionPolicy Bypass -File testing/test_google_api.ps1
```

**Bash (Linux/Mac)**:
```bash
bash testing/test_google_api.sh
```

### Run AI Summary Tests

Follow the instructions in:
- `AI_SUMMARY_TEST_INSTRUCTIONS.md` - For comprehensive testing
- `AI_SUMMARY_QUICK_TEST_CHECKLIST.md` - For quick validation

---

## 📋 File Descriptions

### Test Scripts

| File | Description |
|------|-------------|
| `test_google_api.ps1` | Full-featured PowerShell script with detailed error handling |
| `test_google_api_simple.ps1` | Simplified version for quick testing |
| `test_google_api.sh` | Bash script for Unix/Linux environments |

### Documentation Files

| File | Description |
|------|-------------|
| `AI_SUMMARY_TEST_INSTRUCTIONS.md` | Complete test guide with 15 test cases |
| `AI_SUMMARY_QUICK_TEST_CHECKLIST.md` | Quick 5-minute validation checklist |
| `GOOGLE_API_TEST_RESULTS.md` | Test results and analysis |
| `API_RESPONSE_ANALYSIS.md` | HTTP response analysis and error codes |
| `TIMEOUT_FALLBACK_IMPLEMENTATION.md` | 20-second timeout implementation details |
| `CORS_ERROR_EXPLANATION.md` | CORS error explanation and solutions |
| `CACHE_CLEAR_SUMMARY.md` | Cache clearing procedures |

---

## 🔍 Test Coverage

### AI Summary Feature
- ✅ Generate Summary functionality
- ✅ Loading states (initial & refresh)
- ✅ Hide/Show summary
- ✅ Error handling
- ✅ Timestamp and metadata display
- ✅ Summary refresh
- ✅ Timeout handling (20 seconds)

### API Testing
- ✅ Google Gemini API availability
- ✅ API key validation
- ✅ Error response analysis
- ✅ CORS configuration
- ✅ Timeout behavior

---

## 📝 Notes

- All test scripts read the `GOOGLE_API_KEY` from the root `.env` file
- Test results are logged to console
- Documentation files provide detailed explanations and troubleshooting guides
- Scripts are designed to work with the current application configuration

---

## 🔗 Related Files

- `.env` - Contains `GOOGLE_API_KEY` (root directory)
- `backend/src/langchain_app/chains/summarize_ticket_data.py` - Summary generation logic
- `frontend/app/tickets/[id]/page.tsx` - Frontend summary UI

---

## 📅 Last Updated

November 21, 2025

