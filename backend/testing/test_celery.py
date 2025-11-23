#!/usr/bin/env python3
"""
ENHANCEMENT L2 SLA AUTOMATION - Test script for Celery setup

This script can be used to test if Celery is properly configured and can execute tasks.
Run this from the backend directory after starting Redis and the services.

Usage:
python test_celery.py
"""

import asyncio
import sys
import os

# Add the src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from src.tasks.sla_monitor import celery_app, monitor_sla_breaches

def test_celery_connection():
    """Test if Celery can connect to Redis"""
    try:
        # Check if Celery can connect to the broker
        inspect = celery_app.control.inspect()
        stats = inspect.stats()
        if stats:
            print("✅ Celery worker connection successful!")
            print(f"Connected workers: {list(stats.keys())}")
            return True
        else:
            print("❌ No Celery workers found. Make sure celery worker is running.")
            return False
    except Exception as e:
        print(f"❌ Celery connection failed: {e}")
        return False

def test_task_execution():
    """Test if we can queue a task"""
    try:
        # Queue the SLA monitoring task
        result = monitor_sla_breaches.delay()
        print(f"✅ Task queued successfully! Task ID: {result.id}")
        
        # Wait a bit for the task to complete
        print("Waiting for task to complete...")
        try:
            result.get(timeout=30)  # Wait up to 30 seconds
            print("✅ Task completed successfully!")
            return True
        except Exception as e:
            print(f"⚠️  Task may still be running or failed: {e}")
            return False
    except Exception as e:
        print(f"❌ Failed to queue task: {e}")
        return False

if __name__ == "__main__":
    print("Testing Celery setup for SLA Automation...")
    print("=" * 50)
    
    # Test connection
    connection_ok = test_celery_connection()
    
    if connection_ok:
        print("\n" + "=" * 50)
        # Test task execution
        test_task_execution()
    else:
        print("\nPlease make sure:")
        print("1. Redis is running")
        print("2. Celery worker is running: celery -A src.tasks.sla_monitor worker --loglevel=info")
        print("3. Environment variables are set correctly")
    
    print("\n" + "=" * 50)
    print("Test completed!")