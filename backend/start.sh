#!/bin/bash

echo "Starting TicketSystem Backend..."

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to be ready..."
while ! nc -z mongo 27017; do
    sleep 1
done
echo "MongoDB is ready!"

# Run seed data (always run for development - clears and recreates data)
echo "Running seed data script (development mode - clearing existing data)..."
python -m src.seed_data

# Start the FastAPI server
echo "Starting FastAPI server..."
uvicorn main:app --host 0.0.0.0 --port 8000
