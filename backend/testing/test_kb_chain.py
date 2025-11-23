#!/usr/bin/env python3
"""Test KB chat chain directly"""

import sys
import asyncio
sys.path.insert(0, '/app')

from src.langchain_app.chains.kb_chat import KBChatChain

async def test_chain():
    """Test KB chat chain"""
    print("=" * 60)
    print("TEST: KB Chat Chain")
    print("=" * 60)
    try:
        print("Creating KBChatChain instance...")
        chain = KBChatChain()
        print("✓ Chain created successfully")
        
        print("\nTesting generate_response...")
        response, sources = await chain.generate_response(
            question="What is a ticket?",
            history=[]
        )
        
        print(f"✓ SUCCESS!")
        print(f"✓ Response: {response[:200]}...")
        print(f"✓ Sources count: {len(sources)}")
        return True
    except Exception as e:
        print(f"✗ FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    try:
        result = asyncio.run(test_chain())
        sys.exit(0 if result else 1)
    except KeyboardInterrupt:
        print("\nTest interrupted")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

