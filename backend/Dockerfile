FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies (optional: build tools if you have dependencies like numpy, pandas etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    netcat-openbsd \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Make start script executable and fix line endings (Windows to Unix)
RUN sed -i 's/\r$//' start.sh && chmod +x start.sh

# Expose the port FastAPI runs on
EXPOSE 8000

# Set the entrypoint
CMD ["./start.sh"]