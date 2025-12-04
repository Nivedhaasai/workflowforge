FROM node:20-alpine

WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm ci --production

# Copy source
COPY . .

EXPOSE 5000
ENV PORT=5000
CMD ["node", "index.js"]
