#!/usr/bin/env python3
"""Quick script to create demo users"""
import asyncio
from src.models.user import User
from src.models.enums import UserRole
from src.db.init_db import init_db
import bcrypt

def hash_password_safe(password: str) -> str:
    """Hash password with bcrypt, handling the 72 byte limitation"""
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

async def create_users():
    """Create demo users"""
    print("Starting user creation...")
    await init_db()
    
    users_data = [
        {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@company.com",
            "password": "password123",
            "role": UserRole.user
        },
        {
            "first_name": "Jane",
            "last_name": "Smith",
            "email": "jane.smith@company.com",
            "password": "password123",
            "role": UserRole.user
        },
        {
            "first_name": "Sarah",
            "last_name": "Wilson",
            "email": "sarah.wilson@company.com",
            "password": "password123",
            "role": UserRole.agent
        }
    ]
    
    for user_data in users_data:
        try:
            # Check if user already exists
            existing = await User.find_one(User.email == user_data["email"])
            if existing:
                print(f"User {user_data['email']} already exists, skipping...")
                continue
            
            user = User(
                first_name=user_data["first_name"],
                last_name=user_data["last_name"],
                email=user_data["email"],
                hashed_password=hash_password_safe(user_data["password"]),
                role=user_data["role"]
            )
            await user.insert()
            print(f"✓ Created {user_data['role']} user: {user_data['email']}")
        except Exception as e:
            print(f"✗ Error creating {user_data['email']}: {e}")
    
    print("\n=== Login Credentials ===")
    print("Regular Users:")
    print("  john.doe@company.com / password123")
    print("  jane.smith@company.com / password123")
    print("\nAgent:")
    print("  sarah.wilson@company.com / password123")

if __name__ == "__main__":
    asyncio.run(create_users())


