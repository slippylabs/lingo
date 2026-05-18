FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential curl git gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy entire project
COPY . /app

# Install dependencies from src/pyproject.toml
RUN cd /app/src && pip install --no-cache-dir -e .

VOLUME ["/data/courses"]

CMD ["/bin/bash"]
