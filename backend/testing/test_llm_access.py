#!/usr/bin/env python3
"""Test script to verify OpenAI LLM access"""

import os
import sys
import asyncio
from openai import OpenAI
from src.langchain_app.config.model_config import chat_model, embedding_model

def test_openai_direct():
    """Test OpenAI API directly"""
    print("=" * 60)
    print("TEST 1: Direct OpenAI API Access")
    print("=" * 60)
    try:
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            print("✗ OPENAI_API_KEY not found in environment")
            return False
        
        print(f"✓ API Key found: {api_key[:20]}...")
        
        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model='gpt-4o',
            messages=[{'role': 'user', 'content': 'Say hello'}],
            max_tokens=10
        )
        
        result = response.choices[0].message.content
        print(f"✓ Direct API call successful!")
        print(f"✓ Response: {result}")
        return True
    except Exception as e:
        print(f"✗ Direct API call failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_embedding_model():
    """Test embedding model"""
    print("\n" + "=" * 60)
    print("TEST 2: Embedding Model Access")
    print("=" * 60)
    try:
        result = embedding_model.embed_query("test query")
        print(f"✓ Embedding model successful!")
        print(f"✓ Embedding dimensions: {len(result)}")
        return True
    except Exception as e:
        print(f"✗ Embedding model failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_chat_model():
    """Test chat model"""
    print("\n" + "=" * 60)
    print("TEST 3: Chat Model Access (LangChain)")
    print("=" * 60)
    try:
        from langchain_core.messages import HumanMessage
        response = await chat_model.ainvoke([HumanMessage(content="Say hello in one word")])
        print(f"✓ Chat model successful!")
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
    print("OpenAI LLM Access Test")
    print("=" * 60 + "\n")
    
    results = []
    
    # Test 1: Direct OpenAI API
    results.append(test_openai_direct())
    
    # Test 2: Embedding Model
    if results[0]:
        results.append(test_embedding_model())
    
    # Test 3: Chat Model
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
        print("✓ All tests passed! OpenAI API access is working.")
        return 0
    else:
        print("✗ Some tests failed. Please check the errors above.")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)

