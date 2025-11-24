#!/usr/bin/env python3
import os
import sys
from openai import OpenAI

api_key = os.getenv('OPENAI_API_KEY')
sys.stdout.write(f"API Key present: {bool(api_key)}\n")
sys.stdout.write(f"API Key prefix: {api_key[:20] if api_key else 'N/A'}...\n")
sys.stdout.flush()

try:
    # Create client with verify=False
    client = OpenAI(
        api_key=api_key,
        http_client=None  # Let it use default but we'll set verify=False via env
    )
    sys.stdout.write("Testing API call...\n")
    sys.stdout.flush()
    
    response = client.chat.completions.create(
        model='gpt-4o',
        messages=[{'role': 'user', 'content': 'Say hello'}],
        max_tokens=10
    )
    sys.stdout.write(f"SUCCESS: {response.choices[0].message.content}\n")
    sys.stdout.flush()
    sys.exit(0)
except Exception as e:
    sys.stdout.write(f"ERROR: {e}\n")
    sys.stdout.flush()
    import traceback
    traceback.print_exc()
    sys.exit(1)

