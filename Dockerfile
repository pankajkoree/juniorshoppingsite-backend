# ---------- Build stage ----------
FROM node:20 AS builder

WORKDIR /app

# Copy only dependency files first (better caching)
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TS → JS
RUN npm run build


# ---------- Production stage ----------
FROM node:20-slim

WORKDIR /app

# Prisma needs OpenSSL
RUN apt-get update \
    && apt-get install -y openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy only what is needed
COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled app + prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/app.js"]
