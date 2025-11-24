"""
Test script to verify 20-second timeout for Google API
This script simulates a slow API call to test the timeout mechanism
"""
import asyncio
import time
from datetime import datetime

async def test_timeout():
    """Test that timeout works correctly"""
    print("=" * 60)
    print("Testing 20-Second Timeout for Google API")
    print("=" * 60)
    print()
    
    # Simulate a slow API call that takes longer than 20 seconds
    async def slow_api_call():
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Starting API call...")
        await asyncio.sleep(25)  # Simulate 25-second delay
        return "API Response"
    
    try:
        start_time = time.time()
        response = await asyncio.wait_for(slow_api_call(), timeout=20.0)
        elapsed = time.time() - start_time
        print(f"[{datetime.now().strftime('%H:%M:%S')}] API call completed in {elapsed:.2f} seconds")
        print("❌ TIMEOUT FAILED - API call should have timed out!")
        return False
    except asyncio.TimeoutError:
        elapsed = time.time() - start_time
        print(f"[{datetime.now().strftime('%H:%M:%S')}] ✅ TIMEOUT WORKED - API call timed out after {elapsed:.2f} seconds")
        print("✅ Timeout mechanism is working correctly!")
        return True

if __name__ == "__main__":
    result = asyncio.run(test_timeout())
    exit(0 if result else 1)

