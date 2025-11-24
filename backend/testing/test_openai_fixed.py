#!/usr/bin/env python3
"""Test OpenAI API with SSL workaround"""
import os
import sys
import ssl

# Disable SSL verification BEFORE importing anything
os.environ['CURL_CA_BUNDLE'] = ''
os.environ['REQUESTS_CA_BUNDLE'] = ''
ssl._create_default_https_context = ssl._create_unverified_context

import httpx
from openai import OpenAI

api_key = os.getenv('OPENAI_API_KEY')
print(f"API Key: {bool(api_key)}")

try:
    # Create client with verify=False
    http_client = httpx.Client(verify=False, timeout=60.0)
    client = OpenAI(api_key=api_key, http_client=http_client)
    
    print("Testing API call...")
    response = client.chat.completions.create(
        model='gpt-4o',
        messages=[{'role': 'user', 'content': 'Say hello'}],
        max_tokens=10
    )
    print(f"SUCCESS: {response.choices[0].message.content}")
    sys.exit(0)
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

