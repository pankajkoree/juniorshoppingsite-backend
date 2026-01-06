# ---------- Build stage ----------
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
# Copy prisma folder so the client can be generated
COPY prisma ./prisma/ 

RUN npm install
COPY . .

# CRITICAL: Generate Prisma Client before building
RUN npx prisma generate
RUN npm run build

# ---------- Production stage ----------
FROM node:20-slim

WORKDIR /app

# Install openssl (Required for Prisma engines on slim images)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --omit=dev

# Copy the generated prisma client and the compiled code
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/app.js"]