# Use the official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDeps for build)
RUN npm install

# Copy the rest of your code
COPY . .

# Generate Prisma Client and Build TypeScript
RUN npx prisma generate
RUN npm run build

# Expose the port (Back4app usually uses 3000 by default)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]