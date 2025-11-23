#!/usr/bin/env python3
"""Test script to verify OpenAI chat API access"""

import sys
import asyncio
sys.path.insert(0, '/app')

from langchain_core.messages import HumanMessage
from src.langchain_app.config.model_config import chat_model, embedding_model

async def test_chat():
    """Test chat model"""
    print("=" * 60)
    print("TEST: Chat Model API Call")
    print("=" * 60)
    try:
        print("Calling chat_model.ainvoke...")
        result = await chat_model.ainvoke([HumanMessage(content='Say hello in one word')])
        print(f"✓ SUCCESS!")
        print(f"✓ Response: {result.content}")
        return True
    except Exception as e:
        print(f"✗ FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_embedding():
    """Test embedding model"""
    print("\n" + "=" * 60)
    print("TEST: Embedding Model API Call")
    print("=" * 60)
    try:
        print("Calling embedding_model.embed_query...")
        result = embedding_model.embed_query("test query")
        print(f"✓ SUCCESS!")
        print(f"✓ Embedding dimensions: {len(result)}")
        return True
    except Exception as e:
        print(f"✗ FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("OpenAI LLM Access Test")
    print("=" * 60 + "\n")
    
    results = []
    
    # Test embedding first (faster)
    results.append(await test_embedding())
    
    # Test chat
    results.append(await test_chat())
    
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

