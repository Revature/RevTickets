FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies (optional: build tools if you have dependencies like numpy, pandas etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Fix line endings and make start script executable
RUN sed -i 's/\r$//' start.sh && chmod +x start.sh

# Expose the port FastAPI runs on
EXPOSE 8000

# Set the entrypoint
CMD ["bash", "start.sh"]