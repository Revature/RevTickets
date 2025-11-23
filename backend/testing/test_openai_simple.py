#!/usr/bin/env python3
import os
import sys
from openai import OpenAI

api_key = os.getenv('OPENAI_API_KEY')
print(f"API Key present: {bool(api_key)}")
print(f"API Key prefix: {api_key[:20] if api_key else 'N/A'}...")

try:
    client = OpenAI(api_key=api_key)
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

