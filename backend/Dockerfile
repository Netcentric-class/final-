FROM node:20-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y \
    vim \
    curl \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 3000

CMD ["sleep", "infinity"]