FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --production

# Copy app files
COPY . .

ENV PORT=5000

EXPOSE 5000

CMD ["node", "index.js"]
