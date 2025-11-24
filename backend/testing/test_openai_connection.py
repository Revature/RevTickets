#!/usr/bin/env python3
"""Test script to verify OpenAI API connection"""

import os
import sys
import asyncio
from openai import OpenAI
from src.langchain_app.config.model_config import embedding_model, chat_model

def test_api_key():
    """Test if API key is present"""
    print("=" * 60)
    print("TEST 1: Checking API Key")
    print("=" * 60)
    key = os.getenv('OPENAI_API_KEY')
    if key:
        print(f"✓ API Key present: {bool(key)}")
        print(f"✓ API Key length: {len(key)}")
        print(f"✓ API Key prefix: {key[:15]}...")
        return True
    else:
        print("✗ API Key not found!")
        return False

def test_openai_client():
    """Test OpenAI client connection"""
    print("\n" + "=" * 60)
    print("TEST 2: Testing OpenAI Client Connection")
    print("=" * 60)
    try:
        client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        models = client.models.list()
        print(f"✓ OpenAI API connection successful")
        print(f"✓ Available models: {len(models.data)} models")
        return True
    except Exception as e:
        print(f"✗ OpenAI API connection failed: {e}")
        return False

def test_embedding_model():
    """Test embedding model"""
    print("\n" + "=" * 60)
    print("TEST 3: Testing Embedding Model")
    print("=" * 60)
    try:
        result = embedding_model.embed_query("test query for embedding")
        print(f"✓ Embedding generated successfully")
        print(f"✓ Embedding dimensions: {len(result)}")
        return True
    except Exception as e:
        print(f"✗ Embedding model failed: {e}")
        return False

async def test_chat_model():
    """Test chat model"""
    print("\n" + "=" * 60)
    print("TEST 4: Testing Chat Model")
    print("=" * 60)
    try:
        from langchain_core.messages import HumanMessage
        response = await chat_model.ainvoke([HumanMessage(content="Say hello in one word")])
        print(f"✓ Chat model response successful")
        print(f"✓ Response: {response.content}")
        return True
    except Exception as e:
        print(f"✗ Chat model failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("OpenAI API Connection Test")
    print("=" * 60 + "\n")
    
    results = []
    
    # Test 1: API Key
    results.append(test_api_key())
    
    # Test 2: OpenAI Client
    if results[0]:
        results.append(test_openai_client())
    
    # Test 3: Embedding Model
    if results[0]:
        results.append(test_embedding_model())
    
    # Test 4: Chat Model
    if results[0]:
        results.append(await test_chat_model())
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    passed = sum(results)
    total = len(results)
    print(f"Tests passed: {passed}/{total}")
    
    if passed == total:
        print("✓ All tests passed! OpenAI API connection is working.")
        return 0
    else:
        print("✗ Some tests failed. Please check the errors above.")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)

