FROM node:23-bookworm

WORDDIR /app

COPY /apps/backend-hono/src ./src
COPY /apps/backend-hono/package.json ./
