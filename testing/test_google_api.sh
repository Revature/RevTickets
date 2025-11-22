#!/bin/bash

# Test Google Gemini API (gemini-2.0-flash) Availability
# This script tests if the Google API key is configured and working

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Testing Google Gemini API Availability"
echo "=========================================="
echo ""

# Check if API key is provided
if [ -z "$GOOGLE_API_KEY" ]; then
    echo -e "${YELLOW}Warning: GOOGLE_API_KEY environment variable is not set${NC}"
    echo "Please set it using: export GOOGLE_API_KEY='your-api-key-here'"
    echo ""
    echo "Testing with placeholder API key (will fail but show endpoint)..."
    GOOGLE_API_KEY="test-key-placeholder"
fi

# API Configuration
MODEL="gemini-2.0-flash"
API_URL="https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent"

echo "Model: ${MODEL}"
echo "API Endpoint: ${API_URL}"
echo ""

# Test request payload (simple test)
PAYLOAD=$(cat <<EOF
{
  "contents": [{
    "parts": [{
      "text": "Say 'Hello, API is working!' in one sentence."
    }]
  }]
}
EOF
)

echo "Sending test request..."
echo ""

# Make the API request
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  "${API_URL}?key=${GOOGLE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "${PAYLOAD}")

# Extract HTTP status code
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "=========================================="
echo "Response Status: ${HTTP_STATUS}"
echo "=========================================="
echo ""

# Check response
if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ API is available and working!${NC}"
    echo ""
    echo "Response:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
elif [ "$HTTP_STATUS" = "401" ] || [ "$HTTP_STATUS" = "403" ]; then
    echo -e "${RED}✗ Authentication failed${NC}"
    echo "The API key is invalid or doesn't have proper permissions."
    echo ""
    echo "Error details:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
elif [ "$HTTP_STATUS" = "400" ]; then
    echo -e "${YELLOW}⚠ Bad Request${NC}"
    echo "The request format might be incorrect."
    echo ""
    echo "Error details:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}✗ API request failed${NC}"
    echo "HTTP Status: ${HTTP_STATUS}"
    echo ""
    echo "Response:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
fi

echo ""
echo "=========================================="
echo "Test Complete"
echo "=========================================="

